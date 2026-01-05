import React from 'react';
import { Link } from 'react-router-dom';
import MenuSection from './MenuSection'; // 引入新建立的子組件
import './Classic.css';

function Classic({ BASE_API }) {
  // 定義所有類別
  const sections = [
    { type: 'SPARKLING', title: 'SPARKLING 氣泡' },
    { type: 'CLASSIC', title: 'CLASSIC 經典' },
    { type: 'SHOTS', title: 'SHOTS 一口酒' },
    { type: 'GATHERING_DRINKS', title: 'GATHERING DRINKS 聚會酒' },
    { type: 'TASTING_MENU', title: 'TASTING MENU 品嘗菜單' }
  ];

  return (
    <div className="classic-page">
      <div className="menu-container">
        <Link to="/" className="back-link" style={{ color: '#b2966b', textDecoration: 'none' }}>← BACK</Link>

        {sections.map((section) => (
          <MenuSection 
            key={section.type} 
            type={section.type} 
            title={section.title} 
            BASE_API={BASE_API} 
          />
        ))}
      </div>
    </div>
  );
}

export default Classic;