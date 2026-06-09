import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Award, Gift, Sparkles, Heart, Eye, MessageSquare, ArrowRight, User, Music, BookOpen, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getThumbnailUrl } from '../utils/mediaUtils';
import './Awards.css';

const Awards = () => {
  const navigate = useNavigate();
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1인 1상 원칙이 적용된 최종 수상작 목록 정보 (정적 바인딩 데이터)
  const winnerSpecs = [
    {
      rank: 1,
      id: '7533b504-c7bb-4701-94f6-90b07bf6f693',
      rankName: '🥇 1등 (대상)',
      prize: '상금 10만원',
      badgeColor: '#ffd700',
      shadowColor: 'rgba(255, 215, 0, 0.25)',
      description: '조회수, 좋아요, 댓글 모두 압도적인 참여율을 기록하며 당당히 1위를 차지했습니다. 청소년 창작자로서의 놀라운 음악적 역량을 보여준 작품입니다.'
    },
    {
      rank: 2,
      id: 'ef8dd805-70bd-4152-9fbb-21093949c1be',
      rankName: '🥈 2등 (최우수상)',
      prize: '상금 5만원',
      badgeColor: '#c0c0c0',
      shadowColor: 'rgba(192, 192, 192, 0.25)',
      description: '감성적인 멜로디와 독창적인 곡 구성으로 관람객들의 수많은 공감과 따뜻한 댓글 응원을 이끌어내며 2위에 올랐습니다.'
    },
    {
      rank: 3,
      id: '5170c8af-4ede-4b45-82a4-23bb952c79c7', // 최수정 - 이별 하나
      rankName: '🥉 3등 (우수상)',
      prize: '상금 3만원',
      badgeColor: '#cd7f32',
      shadowColor: 'rgba(205, 127, 50, 0.25)',
      description: '완성도 높은 보컬 곡으로서 많은 이들에게 깊은 울림을 주며 높은 점수를 기록, 치열한 경쟁 속에서 3위 시상대에 올랐습니다.'
    }
  ];

  // 참가상 대상자 리스트 (중복 배제 및 시상자 제외된 6인)
  const participationAwards = [
    { name: '이지민', tag: 'Fading Lights' },
    { name: '남주승', tag: '차원의 문 / 챗바퀴' },
    { name: '이태민', tag: '나만의 노래' },
    { name: '김한결', tag: '뭐든지 괜찮아' },
    { name: '조장현', tag: '그날 밤 우리들의 이야기' },
    { name: '이예준', tag: '유리 너머의 세상' }
  ];

  useEffect(() => {
    fetchWinnerDetails();
  }, []);

  const fetchWinnerDetails = async () => {
    try {
      setLoading(true);
      const ids = winnerSpecs.map(w => w.id);
      
      // Supabase에서 수상작들 정보 조회
      const { data, error } = await supabase
        .from('works')
        .select(`
          *,
          profiles (
            name,
            avatar_url
          )
        `)
        .in('id', ids);

      if (error) throw error;

      // 댓글 수 동적 집계를 위해 댓글 목록 조회
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('work_id');
        
      if (commentsError) throw commentsError;

      // 댓글수 매핑
      const commentCountMap = {};
      comments.forEach(c => {
        commentCountMap[c.work_id] = (commentCountMap[c.work_id] || 0) + 1;
      });

      // 스펙 데이터와 DB 실시간 데이터 결합 및 정렬
      const combined = winnerSpecs.map(spec => {
        const dbInfo = data.find(item => item.id === spec.id);
        const commentsCount = dbInfo ? (commentCountMap[dbInfo.id] || 0) : 0;
        const totalScore = dbInfo ? (dbInfo.likes || 0) + (dbInfo.views || 0) + commentsCount : 0;

        return {
          ...spec,
          workData: dbInfo || null,
          commentsCount,
          totalScore
        };
      });

      // 등수 순으로 정렬
      combined.sort((a, b) => a.rank - b.rank);
      setWinners(combined);
    } catch (err) {
      console.error('Error fetching winner details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'MUSIC': return <Music size={16} />;
      case 'VIDEO': return <BookOpen size={16} />; // 혹은 비디오 아이콘
      default: return <Layers size={16} />;
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.parentElement.style.backgroundColor = 'var(--surface-container-high)';
    e.target.parentElement.classList.add('image-error-fallback');
  };

  return (
    <div className="awards-page">
      {/* 반짝이는 배경 애니메이션 효과용 장식 */}
      <div className="sparkle-background">
        <div className="star star-1">★</div>
        <div className="star star-2">✦</div>
        <div className="star star-3">★</div>
        <div className="star star-4">✦</div>
      </div>

      <div className="container awards-container">
        
        {/* 상단 헤더 */}
        <header className="awards-header">
          <div className="awards-badge">
            <Sparkles size={16} className="text-amber-400" />
            <span>DREAM STAR CHALLENGE AWARDS</span>
          </div>
          <h1>🌟 드림 스타 챌린지 수상작 발표</h1>
          <p className="awards-subtitle">
            청소년 창작자들의 찬란한 꿈을 응원합니다. 관람객 여러분의 소중한 참여로 선정된 영광의 수상작들을 공개합니다!
          </p>
          <div className="awards-period-info">
            <span>집계 기간: 2026. 05. 20 ~ 05. 31</span>
            <span className="divider">|</span>
            <span>발표일: 2026. 06. 10</span>
          </div>
        </header>

        {/* 수상 리스트 로딩 상태 */}
        {loading ? (
          <div className="awards-loading">
            <div className="spinner"></div>
            <p>영광의 순간을 불러오는 중입니다...</p>
          </div>
        ) : (
          <>
            {/* 1~3등 시상대 그리드 */}
            <section className="podium-section">
              <div className="podium-grid">
                
                {/* 2등 카드 (왼쪽 배치) */}
                {winners[1] && (
                  <div className="winner-card rank-2" style={{ '--shadow-color': winners[1].shadowColor }}>
                    <div className="ribbon silver">2nd</div>
                    <div className="card-inner">
                      <div className="rank-badge silver-badge">{winners[1].rankName}</div>
                      <div className="work-preview" onClick={() => navigate(`/work/${winners[1].id}`)}>
                        <img 
                          src={getThumbnailUrl(winners[1].workData)} 
                          alt={winners[1].workData?.title || '작품 이미지'} 
                          onError={handleImageError}
                        />
                        <div className="preview-overlay">
                          <span>자세히 보기 <ArrowRight size={14} /></span>
                        </div>
                      </div>
                      <div className="work-meta">
                        <span className="work-category">
                          {getCategoryIcon(winners[1].workData?.category)}
                          {winners[1].workData?.category === 'MUSIC' ? '음악' : '디지털 아트'}
                        </span>
                        <h3 className="work-title" onClick={() => navigate(`/work/${winners[1].id}`)}>
                          {winners[1].workData?.title}
                        </h3>
                        <div className="creator-profile">
                          <div className="mini-avatar">
                            {winners[1].workData?.profiles?.avatar_url ? (
                              <img src={winners[1].workData.profiles.avatar_url} alt="" />
                            ) : (
                              <User size={14} />
                            )}
                          </div>
                          <span className="creator-name">{winners[1].workData?.profiles?.name || '이혜정'}</span>
                        </div>
                      </div>
                      <p className="winner-desc">{winners[1].description}</p>
                      <div className="prize-amount">{winners[1].prize}</div>
                      <div className="score-summary">
                        <div className="score-item" title="좋아요"><Heart size={14} fill="#ff4d4d" color="#ff4d4d" /> <span>{winners[1].workData?.likes || 0}</span></div>
                        <div className="score-item" title="조회수"><Eye size={14} /> <span>{winners[1].workData?.views || 0}</span></div>
                        <div className="score-item" title="댓글"><MessageSquare size={14} /> <span>{winners[1].commentsCount}</span></div>
                        <div className="score-total">총점 {winners[1].totalScore}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1등 카드 (가운데 배치, 가장 강조됨) */}
                {winners[0] && (
                  <div className="winner-card rank-1" style={{ '--shadow-color': winners[0].shadowColor }}>
                    <div className="crown">👑</div>
                    <div className="ribbon gold">1st</div>
                    <div className="card-inner">
                      <div className="rank-badge gold-badge">{winners[0].rankName}</div>
                      <div className="work-preview" onClick={() => navigate(`/work/${winners[0].id}`)}>
                        <img 
                          src={getThumbnailUrl(winners[0].workData)} 
                          alt={winners[0].workData?.title || '작품 이미지'} 
                          onError={handleImageError}
                        />
                        <div className="preview-overlay">
                          <span>자세히 보기 <ArrowRight size={14} /></span>
                        </div>
                      </div>
                      <div className="work-meta">
                        <span className="work-category">
                          {getCategoryIcon(winners[0].workData?.category)}
                          {winners[0].workData?.category === 'MUSIC' ? '음악' : '디지털 아트'}
                        </span>
                        <h3 className="work-title" onClick={() => navigate(`/work/${winners[0].id}`)}>
                          {winners[0].workData?.title}
                        </h3>
                        <div className="creator-profile">
                          <div className="mini-avatar">
                            {winners[0].workData?.profiles?.avatar_url ? (
                              <img src={winners[0].workData.profiles.avatar_url} alt="" />
                            ) : (
                              <User size={14} />
                            )}
                          </div>
                          <span className="creator-name">{winners[0].workData?.profiles?.name || '이예윤'}</span>
                        </div>
                      </div>
                      <p className="winner-desc">{winners[0].description}</p>
                      <div className="prize-amount gold-prize">{winners[0].prize}</div>
                      <div className="score-summary">
                        <div className="score-item" title="좋아요"><Heart size={14} fill="#ff4d4d" color="#ff4d4d" /> <span>{winners[0].workData?.likes || 0}</span></div>
                        <div className="score-item" title="조회수"><Eye size={14} /> <span>{winners[0].workData?.views || 0}</span></div>
                        <div className="score-item" title="댓글"><MessageSquare size={14} /> <span>{winners[0].commentsCount}</span></div>
                        <div className="score-total">총점 {winners[0].totalScore}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3등 카드 (오른쪽 배치) */}
                {winners[2] && (
                  <div className="winner-card rank-3" style={{ '--shadow-color': winners[2].shadowColor }}>
                    <div className="ribbon bronze">3rd</div>
                    <div className="card-inner">
                      <div className="rank-badge bronze-badge">{winners[2].rankName}</div>
                      <div className="work-preview" onClick={() => navigate(`/work/${winners[2].id}`)}>
                        <img 
                          src={getThumbnailUrl(winners[2].workData)} 
                          alt={winners[2].workData?.title || '작품 이미지'} 
                          onError={handleImageError}
                        />
                        <div className="preview-overlay">
                          <span>자세히 보기 <ArrowRight size={14} /></span>
                        </div>
                      </div>
                      <div className="work-meta">
                        <span className="work-category">
                          {getCategoryIcon(winners[2].workData?.category)}
                          {winners[2].workData?.category === 'MUSIC' ? '음악' : '디지털 아트'}
                        </span>
                        <h3 className="work-title" onClick={() => navigate(`/work/${winners[2].id}`)}>
                          {winners[2].workData?.title}
                        </h3>
                        <div className="creator-profile">
                          <div className="mini-avatar">
                            {winners[2].workData?.profiles?.avatar_url ? (
                              <img src={winners[2].workData.profiles.avatar_url} alt="" />
                            ) : (
                              <User size={14} />
                            )}
                          </div>
                          <span className="creator-name">{winners[2].workData?.profiles?.name || '최수정'}</span>
                        </div>
                      </div>
                      <p className="winner-desc">{winners[2].description}</p>
                      <div className="prize-amount">{winners[2].prize}</div>
                      <div className="score-summary">
                        <div className="score-item" title="좋아요"><Heart size={14} fill="#ff4d4d" color="#ff4d4d" /> <span>{winners[2].workData?.likes || 0}</span></div>
                        <div className="score-item" title="조회수"><Eye size={14} /> <span>{winners[2].workData?.views || 0}</span></div>
                        <div className="score-item" title="댓글"><MessageSquare size={14} /> <span>{winners[2].commentsCount}</span></div>
                        <div className="score-total">총점 {winners[2].totalScore}</div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </section>

            {/* 참가상 정보 섹션 */}
            <section className="participation-section">
              <div className="section-header">
                <Gift className="gift-icon" />
                <h2>🎀 아티스트 참가상 발표</h2>
              </div>
              <div className="participation-box">
                <p className="participation-intro">
                  꿈을 향한 첫걸음으로 챌린지에 도전해 주신 모든 참가자 여러분께 감사드립니다. 시상 대상자를 제외하고 멋진 작품을 등록해 주신 <strong>모든 아티스트분들께 모바일 편의점 상품권(5천원권)</strong>을 발송해 드립니다!
                </p>
                
                <div className="participant-grid">
                  {participationAwards.map((p, idx) => (
                    <div key={idx} className="participant-chip">
                      <span className="avatar-placeholder">{p.name[0]}</span>
                      <div className="participant-info">
                        <span className="name">{p.name}</span>
                        <span className="tag">{p.tag}</span>
                      </div>
                      <span className="prize-tag">편의점 5천원</span>
                    </div>
                  ))}
                </div>

                <div className="delivery-notice">
                  <p>📢 <strong>상금 지급 안내 (1등~3등):</strong> 수상자분들께는 개별적으로 연락을 드려 '은행명 및 계좌번호'를 확인한 후, 해당 계좌로 <strong>6월 20일 이내</strong>에 상금을 지급해 드립니다.</p>
                  <p style={{ marginTop: '8px' }}>🎁 <strong>참가상 발송 안내:</strong> 아티스트 참가상 대상자분들께는 개별 연락처를 확인한 후, <strong>6월 20일 이내</strong>에 모바일 상품권 기프티콘을 순차적으로 발송해 드립니다.</p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* 하단 메인 갤러리 복귀 링크 */}
        <footer className="awards-footer-nav">
          <button className="back-to-gallery-btn" onClick={() => navigate('/')}>
            🎨 드림 아카이브 갤러리로 돌아가기
          </button>
        </footer>

      </div>
    </div>
  );
};

export default Awards;
