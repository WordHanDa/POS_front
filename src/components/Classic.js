import React, { useLayoutEffect } from 'react'; // 引入 useLayoutEffect
import { Link } from 'react-router-dom';
import MenuSection from './MenuSection';
import './Classic.css';

function Classic({ BASE_API }) {
  // 強制回到頂部
  useLayoutEffect(() => {
    // 1. 處理手動滾動
    window.scrollTo(0, 0);
    
    // 2. 針對某些瀏覽器（如 Chrome）的自動捲動恢復機制
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    return () => {
      // 離開頁面時恢復成自動，以免影響其他頁面
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  const sections = [
    { type: 'SPARKLING', title: 'SPARKLING 氣泡' },
    { type: 'CLASSIC', title: 'CLASSIC 經典' },
    { type: 'SHOTS', title: 'SHOTS 一口酒' },
    { type: 'TASTING_MENU', title: 'TASTING MENU 品嘗菜單' }
  ];

  return (
    <div className="classic-page">
      <div className="menu-container">
        <Link to="/" className="back-link" style={{ color: '#b2966b', textDecoration: 'none' }}>
          ← BACK
        </Link>
        <div>其他經典品相請另外詢問</div> {/* 占位用於左右對齊 */}
        {sections.map((section, idx) => (
          <MenuSection 
            key={section.type} 
            index={idx} 
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