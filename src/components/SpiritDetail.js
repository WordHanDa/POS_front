import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SpiritSection from './SpiritSection';
import './SpiritDetail.css';

function SpiritDetail({ BASE_API }) {
  const { type } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // 關鍵：給予 50ms 的微小延遲，確保 DOM 已經掛載完成再啟動動畫
    const timer = setTimeout(() => {
      setIsEntering(true);
    }, 50);
    
    window.scrollTo(0, 0);
    return () => clearTimeout(timer);
  }, []);

  const displayTitle = location.state?.displayName ||
    (type ? type.replace('TASTING_', '').replace('_', ' ').toUpperCase() : 'SPIRITS');

  const handleBackClick = (e) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      navigate('/spirits');
    }, 300);
  };

  return (
    /* 這裡我們多加一個 render-ready 類別，確保背景色第一時間鎖定 */
    <div className={`spirit-detail-page render-ready ${isEntering ? 'fade-in' : ''} ${isExiting ? 'page-exit' : ''}`}>
      <div className="detail-content-wrapper">
        <div style={{ marginBottom: '20px' }}>
          <a href="/spirits" onClick={handleBackClick} className="back-link-custom">
            ← BACK TO CATEGORIES
          </a>
        </div>

        <h1 className="section-title">{displayTitle}</h1>

        <SpiritSection
          type={type}
          title={displayTitle}
          BASE_API={BASE_API}
        />
      </div>

      <footer style={{ marginTop: '60px', textAlign: 'center', opacity: 0.6, fontSize: '0.9rem' }}>
        <p>* Alcohol abuse is harmful to health. Drink responsibly.</p>
        <p>未滿十八歲禁止飲酒。酒後不開車，安全有保障。</p>
      </footer>
    </div>
  );
}

export default SpiritDetail;