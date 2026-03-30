import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, X, ChevronDown, Rocket, Loader2, Globe, Lock, Link as LinkIcon, FileUp, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getYoutubeVideoId, getYoutubeThumbnail } from '../utils/mediaUtils';
import './Upload.css';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'link'
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    is_public: true,
  });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (uploadMethod === 'file') {
      if (!file || !formData.category || !formData.title) {
        alert('모든 필수 항목을 입력해주세요 (파일, 카테고리, 제목).');
        return;
      }
    } else {
      if (!linkUrl || !formData.category || !formData.title) {
        alert('모든 필수 항목을 입력해주세요 (링크 주소, 카테고리, 제목).');
        return;
      }
    }

    try {
      setUploading(true);

      let finalFileUrl = linkUrl;
      let finalThumbnailUrl = null;

      if (uploadMethod === 'file') {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('works-storage')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('works-storage')
          .getPublicUrl(filePath);

        finalFileUrl = publicUrl;
        finalThumbnailUrl = formData.category === 'VIDEO' ? null : publicUrl;
      } else {
        // 외부 링크 처리 (유튜브 썸네일 파싱)
        const videoId = getYoutubeVideoId(linkUrl);
        if (videoId) {
          finalThumbnailUrl = getYoutubeThumbnail(videoId);
        }
      }

      // 커스텀 썸네일 업로드 처리 (사용자가 직접 첨부한 경우 최우선 덮어쓰기)
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
          
        finalThumbnailUrl = thumbPublicUrl;
      }

      // 현재 로그인된 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('로그인이 필요합니다. 다시 로그인해 주세요.');
      }

      const { error: dbError } = await supabase
        .from('works')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          author_id: user.id,
          file_url: finalFileUrl,
          thumbnail_url: finalThumbnailUrl,
          is_public: formData.is_public, // 공개 설정 반영
        });

      if (dbError) throw dbError;

      alert('작품이 성공적으로 등록되었습니다!');
      navigate('/');
    } catch (error) {
      alert(`업로드 실패: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page container">
      <div className="upload-header">
        <h1>작품 업로드</h1>
        <p>당신의 반짝이는 꿈을 세상과 공유해보세요. 청소년 창작자들을 응원합니다.</p>
      </div>

      <div className="upload-card">
        <div className="upload-method-tabs">
          <button 
            type="button"
            className={`method-tab ${uploadMethod === 'file' ? 'active' : ''}`}
            onClick={() => setUploadMethod('file')}
          >
            <FileUp size={18} /> 파일 직접 업로드
          </button>
          <button 
            type="button"
            className={`method-tab ${uploadMethod === 'link' ? 'active' : ''}`}
            onClick={() => setUploadMethod('link')}
          >
            <LinkIcon size={18} /> 외부 미디어 링크
          </button>
        </div>

        {uploadMethod === 'file' ? (
          <div 
            className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
            <div className="upload-icon-circle"><UploadIcon size={32} /></div>
            <h3>{file ? file.name : '파일을 드래그하거나 클릭하세요'}</h3>
            <p>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '영상, 창작 웹툰, 오디오 파일을 업로드 할 수 있습니다'}</p>
          </div>
        ) : (
          <div className="link-input-zone">
            <div className="link-icon-circle"><LinkIcon size={32} /></div>
            <h3>미디어 링크 주소를 입력하세요</h3>
            <p className="link-desc">유튜브(YouTube), 사운드클라우드 등 외부 미디어의 공유 링크를 지원합니다</p>
            <input 
              type="url" 
              className="link-url-input"
              placeholder="https://www.youtube.com/watch?v=..." 
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              required={uploadMethod === 'link'}
            />
          </div>
        )}

        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>카테고리 선택</label>
            <div className="select-wrapper">
              <select 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="" disabled>작품의 장르를 선택해주세요</option>
                <option value="MUSIC">음악</option>
                <option value="WEBTOON">웹툰</option>
                <option value="VIDEO">영상</option>
                <option value="PHOTO">이미지</option>
                <option value="EBOOK">동화책(e-book)</option>
              </select>
              <ChevronDown className="select-arrow" size={20} />
            </div>
          </div>

          <div className="form-group">
            <label>작품 제목</label>
            <input 
              type="text" 
              placeholder="작품의 이름을 지어주세요." 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>작품 설명</label>
            <textarea 
              placeholder="작품에 담긴 이야기나 창작 의도를 적어주세요." 
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="form-group" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ImageIcon size={18} color="#64748b" /> 작품 대표 표지(썸네일) 첨부 <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'normal' }}>(선택)</span>
            </label>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
              메인 갤러리 카드에 노출될 예쁜 커버 이미지를 직접 업로드할 수 있습니다. (미첨부 시 기본 테마 표지 제공)
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
            {thumbnailFile && <p style={{ marginTop: '8px', color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>✓ {thumbnailFile.name} 첨부 완료!</p>}
          </div>

          <div className="form-group">
            <label>공개 설정</label>
            <div className="visibility-toggle">
              <button 
                type="button" 
                className={`toggle-btn ${formData.is_public ? 'active' : ''}`}
                onClick={() => setFormData({...formData, is_public: true})}
              >
                <Globe size={18} /> 전체 공개
              </button>
              <button 
                type="button" 
                className={`toggle-btn ${!formData.is_public ? 'active' : ''}`}
                onClick={() => setFormData({...formData, is_public: false})}
              >
                <Lock size={18} /> 나만 보기
              </button>
            </div>
          </div>

          <button className="submit-btn" type="submit" disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Rocket size={20} />}
            {uploading ? '업로드 중...' : '작품 올리기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
