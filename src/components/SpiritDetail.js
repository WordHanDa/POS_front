import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom'; // 增加 useLocation
import SpiritSection from './SpiritSection';
import './SpiritDetail.css';

function SpiritDetail({ BASE_API }) {
    const { type } = useParams();
    const location = useLocation();

    // 優先使用 Link state 傳過來的漂亮名稱 (如 GIN)，若無則處理 type 字符串
    const displayTitle = location.state?.displayName || 
                         (type ? type.replace('TASTING_', '').replace('_', ' ').toUpperCase() : 'SPIRITS');

    return (
        <div className="container">
            <div style={{ marginBottom: '20px' }}>
                <Link to="/spirits" className="back-link-custom">
                    ← BACK TO CATEGORIES
                </Link>
            </div>

            {/* 標題現在會顯示優化後的文字，例如 "GIN" 或 "WHISKEY" */}
            <h1 className="section-title">{displayTitle}</h1>

            <SpiritSection 
                type={type} 
                title={displayTitle} 
                BASE_API={BASE_API} 
            />

            <footer style={{ marginTop: '60px', textAlign: 'center', opacity: 0.6, fontSize: '0.9rem' }}>
                <p>* Alcohol abuse is harmful to health. Drink responsibly.</p>
                <p>未滿十八歲禁止飲酒。酒後不開車，安全有保障。</p>
            </footer>
        </div>
    );
}

export default SpiritDetail;