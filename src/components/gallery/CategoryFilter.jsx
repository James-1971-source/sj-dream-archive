import React from 'react';
import { Music, Layout, Video, Image as ImageIcon, Grid, Book } from 'lucide-react';
import './CategoryFilter.css';

const CategoryFilter = ({ activeCategory, setActiveCategory }) => {
  const categories = [
    { id: 'all', label: '전체', icon: <Grid size={18} /> },
    { id: 'music', label: '음악', icon: <Music size={18} /> },
    { id: 'webtoon', label: '웹툰', icon: <Layout size={18} /> },
    { id: 'video', label: '영상', icon: <Video size={18} /> },
    { id: 'photo', label: '이미지', icon: <ImageIcon size={18} /> },
    { id: 'ebook', label: '동화책(e-book)', icon: <Book size={18} /> },
  ];

  return (
    <div className="category-filter-container">
      <div className="category-filter">
        {categories.map((cat) => (
          <button 
            key={cat.id} 
            className={`filter-item ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="icon">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
