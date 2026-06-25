import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getThumbnailUrl } from '../../utils/mediaUtils';
import './WorkCard.css';

const WorkCard = ({ work }) => {
  const navigate = useNavigate();
  
  const getBadgeColor = (type) => {
    switch(type) {
      case 'MUSIC': return 'var(--music-tag)';
      case 'WEBTOON': return 'var(--webtoon-tag)';
      case 'VIDEO': return 'var(--video-tag)';
      case 'PHOTO': return 'var(--photo-tag)';
      case 'EBOOK': return 'var(--ebook-tag)';
      default: return 'var(--primary-color)';
    }
  };

  const authorName = work.profiles?.name || '익명 작가';

  const handleImageError = (e) => {
    e.target.style.display = 'none'; // 깨진 이미지 아이콘 숨기기
    e.target.parentElement.style.backgroundColor = '#f1f5f9';
    e.target.parentElement.classList.add('image-error');
  };

  const renderThumbnail = () => {
    // 비디오인데 이미지가 없는 경우만 비디오 미리보기 노출
    const isImage = work.thumbnail_url?.match(/\.(jpg|jpeg|png|webp|gif|svg|avif)/i);
    if (work.category === 'VIDEO' && !isImage) {
      return (
        <video className="card-video-preview" muted playsInline>
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

  return (
    <div className="work-card" onClick={() => navigate(`/works/${work.id}`)}>
      <div className="card-thumb">
        {renderThumbnail()}
        <span className="type-badge" style={{ backgroundColor: getBadgeColor(work.category) }}>
          {work.category}
        </span>
      </div>
      <div className="card-body">
        <h3>{work.title}</h3>
        <div className="card-meta">
          <div className="author-info">
             <div className="author-avatar">
               {work.profiles?.avatar_url ? (
                 <img src={work.profiles.avatar_url} alt={authorName} />
               ) : (
                 authorName.charAt(0)
               )}
             </div>
             <span className="author-name">{authorName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkCard;
