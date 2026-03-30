import React, { useEffect, useState, useRef } from 'react';
import { Settings, Share2, Camera, User, Loader2, X, Save, FileText, Heart, Eye, Lock, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getThumbnailUrl } from '../utils/mediaUtils';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    tag: '',
    location: '',
    hashtags: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    fetchProfileAndWorks();
  }, []);

  const fetchProfileAndWorks = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      // 1. 프로필 조회 시도
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // 2. 프로필이 없으면 자동 생성 (Upsert pattern)
      if (!profileData) {
        const newProfile = {
          id: user.id,
          name: user.user_metadata?.full_name || '새 사용자',
          tag: '안녕하세요! 꿈 아카이브입니다.',
          location: '지구 어딘가',
          hashtags: ['꿈', '아카이브']
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .upsert(newProfile)
          .select()
          .single();

        if (createError) throw createError;
        profileData = createdProfile;
      }

      setProfile(profileData);
      setEditData({
        name: profileData.name || 'S&J 사용자',
        tag: profileData.tag || '',
        location: profileData.location || '',
        hashtags: profileData.hashtags?.join(', ') || ''
      });

      // 작품 목록 로드
      const { data: worksData, error: worksError } = await supabase
        .from('works')
        .select('*, profiles(name, avatar_url)')
        .eq('author_id', profileData.id)
        .order('created_at', { ascending: false });

      if (worksError) throw worksError;
      setWorks(worksData || []);

    } catch (error) {
      console.error('Error fetching profile:', error.message);
      // 로그인 세션이 끊겼을 가능성 확인
      if (error.message.includes('로그인')) {
        alert('로그인이 필요한 페이지입니다. 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('works-storage')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('works-storage')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      alert('프로필 사진이 업데이트되었습니다.');
      fetchProfileAndWorks();
    } catch (error) {
      alert(`사진 업로드 실패: ${error.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editData.name,
          tag: editData.tag,
          location: editData.location,
          hashtags: editData.hashtags.split(',').map(s => s.trim()).filter(s => s !== '')
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      alert('프로필이 성공적으로 수정되었습니다.');
      setIsEditModalOpen(false);
      fetchProfileAndWorks();
    } catch (error) {
      alert(`수정 실패: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleWorkVisibility = async (workId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('works')
        .update({ is_public: !currentStatus })
        .eq('id', workId);
      
      if (error) throw error;
      fetchProfileAndWorks();
    } catch (error) {
      alert('상태 변경 실패');
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.parentElement.style.backgroundColor = '#f1f5f9';
    e.target.parentElement.classList.add('image-error');
  };

  const renderWorkThumbnail = (work) => {
    const isImage = work.thumbnail_url?.match(/\.(jpg|jpeg|png|webp|gif|svg|avif)/i);
    if (work.category === 'VIDEO' && !isImage) {
      return (
        <video className="my-work-video-preview" muted playsInline>
          <source src={`${work.file_url}#t=0.1`} type="video/mp4" />
        </video>
      );
    }

    return (
      <img 
        src={getThumbnailUrl(work)} 
        alt={work.title} 
        onError={handleImageError}
      />
    );
  };

  if (loading) return <div className="loading-container container"><Loader2 className="animate-spin" size={40} /> 로딩 중...</div>;
  if (!profile) return <div className="container">프로필 정보를 불러올 수 없습니다.</div>;

  const totalLikes = works.reduce((acc, work) => acc + (work.likes || 0), 0);
  const totalViews = works.reduce((acc, work) => acc + (work.views || 0), 0);

  return (
    <div className="profile-page container">
      <div className="profile-header-card">
        <div className="profile-main">
           <div className="profile-avatar-wrapper">
             <div className="profile-avatar" onClick={() => avatarInputRef.current.click()} style={{ cursor: 'pointer' }}>
               {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.name} /> : <User size={60} color="#94a3b8" />}
               
               <div className="profile-avatar-overlay">
                 <Camera size={26} color="white" />
                 <span style={{ fontSize: '0.8rem', marginTop: '6px', fontWeight: '600' }}>사진 변경</span>
               </div>

               {uploadingAvatar && (
                 <div className="avatar-loading"><Loader2 className="animate-spin" color="var(--primary-color)" size={32} /></div>
               )}
               <input type="file" ref={avatarInputRef} style={{ display: 'none' }} onChange={handleAvatarUpload} accept="image/*" />
             </div>
           </div>
          <div className="profile-info">
            <div className="name-row">
              <h1>{profile.name}</h1>
              <span className="user-tag">{profile.tag}</span>
            </div>
            <div className="user-hashtags">
              {profile.hashtags?.map((tag, i) => <span key={i}>#{tag}</span>)}
            </div>
            <div className="user-meta">
              <span>📅 가입일: {new Date(profile.created_at).toLocaleDateString()}</span>
              <span>📍 {profile.location}</span>
            </div>
          </div>
          <div className="profile-actions">
            <button className="edit-profile-btn" onClick={() => setIsEditModalOpen(true)}>프로필 수정</button>
            <button className="share-profile-btn"><Share2 size={20} /></button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="profile-edit-modal">
            <div className="modal-header">
              <h2>프로필 수정</h2>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>이름</label>
                <input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>한 줄 소개</label>
                <input type="text" value={editData.tag} onChange={(e) => setEditData({...editData, tag: e.target.value})} />
              </div>
              <div className="form-group">
                <label>지역</label>
                <input type="text" value={editData.location} onChange={(e) => setEditData({...editData, location: e.target.value})} />
              </div>
              <div className="form-group">
                <label>태그 (쉼표로 구분)</label>
                <input type="text" value={editData.hashtags} onChange={(e) => setEditData({...editData, hashtags: e.target.value})} />
              </div>
              <button className="save-btn" type="submit" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? '저장 중...' : '변경사항 저장'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-bg blue">
              <FileText size={20} className="icon-blue" />
            </div>
            <span className="stat-title">총 업로드</span>
          </div>
          <div className="stat-value">{works.length} <span className="unit">개</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-bg pink">
              <Heart size={20} className="icon-pink" />
            </div>
            <span className="stat-title">받은 응원</span>
          </div>
          <div className="stat-value">{totalLikes} <span className="unit">회</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-bg green">
              <Eye size={20} className="icon-green" />
            </div>
            <span className="stat-title">총 조회수</span>
          </div>
          <div className="stat-value">{totalViews} <span className="unit">회</span></div>
        </div>
      </div>

      <div className="profile-content">
        <div className="tabs">
          <button className="tab active">내가 올린 작품</button>
        </div>

        <div className="my-work-grid">
          {works.length > 0 ? works.map(work => (
            <div key={work.id} className="my-work-card">
              <div className="my-work-thumb">
                 {renderWorkThumbnail(work)}
                 <button 
                  className={`status-badge ${work.is_public ? 'public' : 'private'}`}
                  onClick={() => toggleWorkVisibility(work.id, work.is_public)}
                 >
                   {work.is_public ? <Globe size={12} /> : <Lock size={12} />}
                   {work.is_public ? '공개' : '비공개'}
                 </button>
              </div>
              <div className="my-work-info">
                <h4>{work.title}</h4>
                <p>{new Date(work.created_at).toLocaleDateString()} 업로드</p>
                <div className="my-work-stats">
                   <span>👁️ {work.views}</span>
                   <span>❤️ {work.likes}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="empty-state">아직 업로드한 작품이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
