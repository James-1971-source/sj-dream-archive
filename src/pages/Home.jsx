import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import CategoryFilter from '../components/gallery/CategoryFilter';
import WorkCard from '../components/gallery/WorkCard';
import './Home.css';

const Home = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    fetchWorks();
  }, [activeCategory, searchQuery]);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('works')
        .select(`
          *,
          profiles (
            name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (activeCategory !== 'all') {
        const categoryMap = {
          'music': 'MUSIC',
          'webtoon': 'WEBTOON',
          'video': 'VIDEO',
          'photo': 'PHOTO',
          'ebook': 'EBOOK'
        };
        query = query.eq('category', categoryMap[activeCategory]);
      }

      if (searchQuery) {
        // title, description, 작가명에서 검색 (현재 supabase 클라이언트로는 profiles name 검색은 어려우므로 title과 desc만 일단 사용하고 클라이언트에서 필터링하거나 or 문법 사용)
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // 사용자 이름으로도 검색 되도록 클라이언트 사이드 추가 필터 반영
      let filteredData = data || [];
      if (searchQuery) {
        const sq = searchQuery.toLowerCase();
        filteredData = filteredData.filter(work => 
          (work.title && work.title.toLowerCase().includes(sq)) || 
          (work.description && work.description.toLowerCase().includes(sq)) || 
          (work.profiles?.name && work.profiles.name.toLowerCase().includes(sq))
        );
      }
      
      setWorks(filteredData);
    } catch (error) {
      console.error('Error fetching works:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <SEO
        title="S&J드림아카이브 | 청소년 창작 작품 아카이브"
        description="S&J희망나눔이 운영하는 청소년 창작 플랫폼입니다. 음악, 웹툰, 영상, 이미지, 전자책 등 청소년들의 다양한 창작 작품을 만나보세요."
        url="/"
      />
      <header className="hero-section">
        <div className="container hero-content">
          <span className="badge">ARCHIVE</span>
          <h1><span className="brand-orange">청소년의 꿈을 기록하다,</span><br /><span className="highlight">S&J 드림 아카이브(Dream Archive)</span></h1>
          <p>창의적인 청소년 크리에이터들의 예술적인 여정을 탐색하고 당신의 영감을 함께 공유해보세요.</p>
          <button className="cta-button" onClick={() => navigate('/upload')}>작품 올리기</button>
        </div>
      </header>

      <main className="container">
        <CategoryFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        
        <section className="gallery-section">
          <div className="section-header">
            <h2>
              {searchQuery ? `'${searchQuery}' 검색 결과` : 
                activeCategory === 'all' ? '최신 갤러리' : `${activeCategory.toUpperCase()} 작품`}
            </h2>
            {!searchQuery && <a href="#" className="view-more">더보기</a>}
          </div>

          {loading ? (
            <div className="loading-state">로딩 중...</div>
          ) : works.length > 0 ? (
            <div className="work-grid">
              {works.map(work => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          ) : (
            <div className="empty-state">아직 등록된 작품이 없습니다.</div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
