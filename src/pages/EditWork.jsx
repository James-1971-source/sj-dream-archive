import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Loader2, Link as LinkIcon, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getYoutubeVideoId, getYoutubeThumbnail } from '../utils/mediaUtils';
import './Upload.css'; // 빠른 스타일 공유를 위해 Upload CSS 차용

const EditWork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [work, setWork] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    file_url: '',
    is_public: true,
  });

  useEffect(() => {
    fetchWork();
  }, [id]);

  const fetchWork = async () => {
    try {
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setWork(data);
      setFormData({
        category: data.category || '',
        title: data.title || '',
        description: data.description || '',
        file_url: data.file_url || '',
        is_public: data.is_public !== false,
      });
    } catch (err) {
      console.error(err);
      alert('작품 정보를 불러오는데 실패했습니다.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const deleteOldStorageFile = async (url) => {
    if (!url) return;
    try {
      if (url.includes('supabase.co/storage/v1/object/public/works-storage/')) {
        const filePath = url.split('works-storage/')[1];
        if (filePath) {
          const { error } = await supabase.storage.from('works-storage').remove([filePath]);
          if (error) {
            console.error('Storage file deletion failed:', error);
          } else {
            console.log('Old file successfully removed from storage:', filePath);
          }
        }
      }
    } catch (err) {
      console.error('Error in deleteOldStorageFile:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.file_url) {
      alert('필수 항목(제목, 링크 주소)을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);

      const isYoutube = getYoutubeVideoId(formData.file_url);
      let newThumbnail = work.thumbnail_url;

      // 만약 URL이 바뀌었고, 그게 유튜브 링크라면 썸네일도 새로 추출
      if (formData.file_url !== work.file_url && isYoutube) {
        newThumbnail = getYoutubeThumbnail(isYoutube);
      } else if (formData.file_url !== work.file_url && !isYoutube && formData.category === 'VIDEO') {
        newThumbnail = null; // 비디오인데 유튜브가 아니면 썸네일 초기화
      }

      // 커스텀 썸네일 교체 처리
      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split('.').pop();
        const thumbName = `thumb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${thumbExt}`;
        const thumbPath = `thumbnails/${thumbName}`;
        
        const { error: thumbUploadError } = await supabase.storage
          .from('works-storage')
          .upload(thumbPath, thumbnailFile);
          
        if (thumbUploadError) throw thumbUploadError;
        
        const { data: { publicUrl: thumbPublicUrl } } = supabase.storage
          .from('works-storage')
          .getPublicUrl(thumbPath);
          
        newThumbnail = thumbPublicUrl;
      }

      // 만약 기존 URL이 스토리지 파일이었는데 새로운 외부 링크로 덮어씌우는 경우 (스토리지 공간 반환)
      const oldWasStorage = work.file_url?.includes('works-storage');
      const newIsStorage = formData.file_url?.includes('works-storage');

      if (oldWasStorage && !newIsStorage && formData.file_url !== work.file_url) {
        await deleteOldStorageFile(work.file_url);
        alert('이전 원본 파일이 스토리지에서 삭제되어 용량이 확보되었습니다.');
      }

      const { error } = await supabase
        .from('works')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          file_url: formData.file_url,
          thumbnail_url: newThumbnail,
          is_public: formData.is_public
        })
        .eq('id', id);

      if (error) throw error;

      alert('작품이 정상적으로 수정되었습니다.');
      navigate(`/work/${id}`);
    } catch (err) {
      alert(`수정 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container" style={{padding: '80px', textAlign: 'center'}}><Loader2 className="animate-spin" /> 로딩 중...</div>;

  return (
    <div className="upload-page container">
      <div className="upload-header">
        <h1>미디어 & 작품 수정</h1>
        <p>기존 원본을 유튜브 등의 외부 링크로 교체하여 서버 용량을 즉각 되돌려 받을 수 있습니다.</p>
      </div>

      <div className="upload-card">
        <form className="upload-form" onSubmit={handleSubmit}>
          
          <div className="form-group" style={{ backgroundColor: '#fffbeb', padding: '20px', borderRadius: '12px', border: '1px solid #fde68a' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309' }}>
              <AlertTriangle size={18} /> 미디어 링크 교체 (마이그레이션)
            </label>
            <p style={{ fontSize: '0.9rem', color: '#92400e', marginBottom: '12px', lineHeight: '1.5' }}>
              아래에 유튜브, 구글 드라이브 등의 외부 링크를 입력하세요.<br/>
              현재 저장되어 있는 로컬 파일을 링크로 대체하게 되면 기존 대용량 파일은 <strong>자동으로 영구 삭제</strong>되어 서버 스토리지가 확보됩니다.
            </p>
            <div className="link-input-zone" style={{ padding: '20px 10px', backgroundColor: 'white', border: '1px solid #fde68a' }}>
              <input 
                type="url" 
                className="link-url-input"
                style={{ maxWidth: '100%' }}
                placeholder="https://youtu.be/..." 
                value={formData.file_url}
                onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>작품 제목</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>카테고리</label>
            <div className="select-wrapper">
              <select 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="MUSIC">음악</option>
                <option value="WEBTOON">웹툰</option>
                <option value="VIDEO">영상</option>
                <option value="PHOTO">이미지</option>
                <option value="EBOOK">동화책(e-book)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>작품 설명</label>
            <textarea 
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="form-group" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ImageIcon size={18} color="#64748b" /> 새 커스텀 썸네일 표지로 교체 <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'normal' }}>(선택)</span>
            </label>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
              새로운 표지 이미지를 첨부하면 갤러리 썸네일이 즉시 완전히 덮어씌워집니다. 기존 표지를 그대로 유지하려면 비워두시면 됩니다.
            </p>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                if(e.target.files && e.target.files[0]) {
                  setThumbnailFile(e.target.files[0]);
                }
              }}
              style={{ width: '100%', fontSize: '0.9rem', cursor: 'pointer' }}
            />
            {thumbnailFile && <p style={{ marginTop: '8px', color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>✓ {thumbnailFile.name} 선택됨 (변경사항 저장 시 동시 적용됨)</p>}
          </div>

          <button className="submit-btn" type="submit" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? '저장 중...' : '변경 사항 저장'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditWork;
