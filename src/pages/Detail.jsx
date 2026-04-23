import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, SkipBack, SkipForward, Repeat, Shuffle, Heart, Eye, User, MoreHorizontal, Loader2, Share2, Bell, Trash2, ShieldCheck, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getThumbnailUrl, getYoutubeVideoId } from '../utils/mediaUtils';
import './Detail.css';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherWorks, setOtherWorks] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasFollowed, setHasFollowed] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    fetchWorkDetail();
    fetchComments();
    checkUserRole();
  }, [id]);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile) {
        setIsAdmin(profile.role === 'ADMIN');
      }
    }
  };

  const fetchWorkDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('works')
        .select(`
          *,
          profiles (
            *
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setWork(data);

      if (data.author_id) {
        const { data: others } = await supabase
          .from('works')
          .select('*')
          .eq('author_id', data.author_id)
          .neq('id', id)
          .limit(2);
        setOtherWorks(others || []);
      }
      
      // 조회수 증가
      await supabase.from('works').update({ views: (data.views || 0) + 1 }).eq('id', id);

      // (임시처리) 로컬에 저장된 팔로워 수나 좋아요 여부를 상태로 복구
      if (data.author_id) {
        const localFollows = JSON.parse(localStorage.getItem('follows_db') || '{}');
        setFollowerCount(localFollows[data.author_id] || data.profiles.followers || 0);
      }
      
    } catch (error) {
      console.error('Error fetching work detail:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 작품을 삭제하시겠습니까? 삭제된 작품은 복구할 수 없습니다.')) return;

    try {
      const { error } = await supabase
        .from('works')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('작품이 정상적으로 삭제되었습니다.');
      navigate('/');
    } catch (error) {
      alert(`삭제 실패: ${error.message}`);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            name,
            avatar_url
          )
        `)
        .eq('work_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error.message);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      if (window.confirm('로그인이 필요한 기능입니다. 로그인 하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    if (hasLiked) {
      alert('이미 응원(좋아요)을 누르셨습니다.');
      return;
    }

    try {
      const newLikes = (work.likes || 0) + 1;
      setWork({ ...work, likes: newLikes });
      setHasLiked(true);

      const { error } = await supabase
        .from('works')
        .update({ likes: newLikes })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
       console.error("Like failed:", error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      if (window.confirm('로그인이 필요한 기능입니다. 로그인 하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    if (hasFollowed) {
      alert('이미 팔로우 중입니다.');
      return;
    }
    
    const newFollowers = followerCount + 1;
    setFollowerCount(newFollowers);
    setHasFollowed(true);

    // 로컬 스토리지에 임시 저장 (profiles 테이블에 followers 컬럼이 없을 경우를 대비한 브라우저 UI 반영)
    const localFollows = JSON.parse(localStorage.getItem('follows_db') || '{}');
    localFollows[work.author_id] = newFollowers;
    localStorage.setItem('follows_db', JSON.stringify(localFollows));

    try {
       // DB 업데이트 시도
       await supabase.from('profiles').update({ followers: newFollowers }).eq('id', work.author_id);
    } catch (err) {
       // profiles 테이블에 followers 컬럼이 없으면 에러가 무시되고 UI 상의 숫자는 유지됩니다.
       console.log("DB 컬럼 누락 에러 무시됨:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      
      // 현재 로그인된 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('로그인이 필요한 기능입니다.');
        return;
      }

      const { error } = await supabase
        .from('comments')
        .insert({
          work_id: id,
          author_id: user.id,
          content: commentText
        });

      if (error) throw error;
      
      setCommentText('');
      fetchComments(); // 댓글 목록 새로고침
    } catch (error) {
      alert(`댓글 등록 실패: ${error.message}`);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <div className="loading-container container"><Loader2 className="animate-spin" size={40} /> 로딩 중...</div>;
  if (!work) return <div className="container">작품을 찾을 수 없습니다.</div>;

  const author = work.profiles;

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.parentElement.style.backgroundColor = '#f1f5f9';
    e.target.parentElement.classList.add('image-error');
  };

  const renderDetailMainContent = () => {
    const isYoutube = getYoutubeVideoId(work.file_url);

    if (work.category === 'MUSIC') {
      if (isYoutube) {
        return (
          <div className="video-player-container youtube-container">
             <iframe 
               width="100%" 
               height="100%" 
               src={`https://www.youtube.com/embed/${isYoutube}?autoplay=1`} 
               title="YouTube player" 
               frameBorder="0" 
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
               allowFullScreen
               className="main-iframe-element"
               style={{ minHeight: '400px', borderRadius: '16px' }}
             ></iframe>
          </div>
        );
      }
      return (
        <div className="music-player-container">
          <div className="player-bg-art">
            <img 
              src={getThumbnailUrl(work)} 
              alt={work.title} 
              onError={handleImageError}
            />
          </div>
          <div className="player-ui">
             <h3>{work.title}</h3>
             <p className="player-sub">Original Soundtrack (feat. AI Vocals)</p>
             <audio src={work.file_url} controls style={{ width: '100%', marginTop: '20px' }} />
          </div>
        </div>
      );
    } 
    
    if (work.category === 'VIDEO') {
      if (isYoutube) {
        return (
          <div className="video-player-container youtube-container">
             <iframe 
               width="100%" 
               height="100%" 
               src={`https://www.youtube.com/embed/${isYoutube}?autoplay=1`} 
               title="YouTube player" 
               frameBorder="0" 
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
               allowFullScreen
               className="main-iframe-element"
               style={{ minHeight: '400px', borderRadius: '16px' }}
             ></iframe>
          </div>
        );
      }
      return (
        <div className="video-player-container">
          <video controls className="main-video-element" autoPlay>
             <source src={work.file_url} type="video/mp4" />
             Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return (
      <div className="generic-content-view">
         <img 
           src={getThumbnailUrl(work)} 
           alt={work.title} 
           className="content-img" 
           onError={handleImageError} 
         />
         <a href={work.file_url} target="_blank" rel="noopener noreferrer" className="view-full-btn">
           새 창에서 작품 전체 보기
         </a>
      </div>
    );
  };

  return (
    <div className="detail-page container">
      <div className="detail-top-nav">
        <div className="top-nav-left">
           <span className="category-tag">{work.category === 'MUSIC' ? '음악' : work.category === 'VIDEO' ? '영상' : '디지털 미디어'}</span>
           <span className="sub-tag">디지털 미디어</span>
        </div>
        <div className="top-nav-right">
          <button className="icon-btn" onClick={() => navigate('/')}>메인으로</button>
          <button className="icon-btn"><Share2 size={20} /></button>
          <button className="icon-btn"><MoreHorizontal size={20} /></button>
        </div>
      </div>

      <header className="detail-header">
        <h1>{work.title}</h1>
        
        <div className="author-bar">
          <div className="author-info-main">
            <div className="author-avatar-large">
              {author?.avatar_url ? <img src={author.avatar_url} alt={author.name} /> : <User size={24} />}
            </div>
            <div className="author-meta-text">
              <span className="author-name-large">
                {author?.name || 'S&J 관리자'}
                {author?.role === 'ADMIN' && <ShieldCheck size={16} className="admin-icon-inline" title="공식 관리자" />}
              </span>
              <span className="author-description">{author?.tag || '디렉터 콘텐츠 디자인 전공'}</span>
            </div>
            
            {(isAdmin || currentUser?.id === work.author_id) && (
              <button 
                className="edit-btn" 
                onClick={() => navigate(`/edit/${work.id}`)}
                style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', color: '#475569', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
              >
                <Edit2 size={16} /> 수정
              </button>
            )}

            {isAdmin && <button className="admin-delete-btn" onClick={handleDelete}><Trash2 size={16} /> 작품 관리(삭제)</button>}
            {!isAdmin && currentUser?.id === work.author_id && <button className="delete-btn" onClick={handleDelete}><Trash2 size={16} /> 삭제</button>}
            
            <button 
              className="follow-btn-large" 
              onClick={handleFollow}
              style={{ background: hasFollowed ? '#94a3b8' : 'var(--primary-color)' }}
            >
              {hasFollowed ? '팔로잉 됨' : '팔로우'} 
              <span style={{opacity: 0.8, fontSize: '0.9em', marginLeft: '5px'}}>({followerCount})</span>
            </button>
          </div>
          <div className="header-stats">
            <div 
              className="stat-item" 
              onClick={handleLike} 
              style={{ cursor: 'pointer', color: hasLiked ? '#FF4D4D' : 'var(--text-muted)' }}
              title="좋아요 (응원하기)"
            >
              <Heart size={20} className={hasLiked ? "heart-icon" : ""} /> {work.likes || 0}
            </div>
            <div className="stat-item"><Eye size={20} /> {work.views || 0}</div>
          </div>
        </div>
      </header>

      <div className="main-content-viewer">
        {renderDetailMainContent()}
      </div>

      <div className="detail-bottom-layout">
        <div className="detail-main-text">
          <section className="info-section">
            <h3 className="section-title"><MoreHorizontal size={20} /> 작품 설명</h3>
            <p className="description-text">{work.description || '작품에 대한 설명이 없습니다.'}</p>
          </section>

          <section className="comment-section-v2">
            <h3 className="section-title">응원 댓글 <span className="count">{comments.length}</span></h3>
            <form className="comment-input-box" onSubmit={handleCommentSubmit}>
               <div className="user-mini-avatar">
                 <User size={24} />
               </div>
               <div className="input-wrapper">
                 <textarea 
                   placeholder="작품에 대한 따뜻한 응원을 남겨주세요!"
                   value={commentText}
                   onChange={(e) => setCommentText(e.target.value)}
                   required
                 ></textarea>
                 <button className="btn-comment-submit" type="submit" disabled={submittingComment}>
                   {submittingComment ? '...' : '등록'}
                 </button>
               </div>
            </form>
            
            <div className="comment-list">
               {comments.length > 0 ? comments.map(comment => (
                 <div key={comment.id} className="comment-item">
                    <div className="comment-user-avatar">
                      {comment.profiles?.avatar_url ? <img src={comment.profiles.avatar_url} alt="" /> : <User size={20} />}
                    </div>
                    <div className="comment-content">
                       <div className="comment-header">
                          <span className="user-name">{comment.profiles?.name || '익명'}</span>
                          <span className="time">{new Date(comment.created_at).toLocaleDateString()}</span>
                       </div>
                       <p>{comment.content}</p>
                    </div>
                 </div>
               )) : (
                 <div className="empty-comments">아직 댓글이 없습니다. 첫 번째 응원을 남겨보세요!</div>
               )}
            </div>
          </section>
        </div>

        <aside className="detail-sidebar">
          <div className="sidebar-info-card">
            <h4>작품 정보</h4>
            <div className="info-line"><span>발매일</span> <span>{new Date(work.created_at).toLocaleDateString()}</span></div>
            <div className="info-line"><span>장르</span> <span>{work.category}</span></div>
            <div className="info-line"><span>라이선스</span> <span className="license">CC BY-NC</span></div>
          </div>

          <div className="sidebar-related-card">
            <div className="related-header">
               <h4>이 제작자의 다른 작품</h4>
            </div>
            <div className="related-list">
              {otherWorks.length > 0 ? otherWorks.map(other => (
                <div key={other.id} className="related-item" onClick={() => navigate(`/work/${other.id}`)}>
                  <div className="related-thumb">
                    <img src={getThumbnailUrl(other)} alt={other.title} onError={handleImageError} />
                  </div>
                  <div className="related-info">
                    <h5>{other.title}</h5>
                    <p>{other.category}</p>
                  </div>
                </div>
              )) : (
                <p className="no-related">다른 작품이 없습니다.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Detail;
