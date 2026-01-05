import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import './basemenu.css';

function BaseMenu() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const seatId = queryParams.get('SEAT_ID');

    useEffect(() => {
        if (seatId) {
            Cookies.set('customer_seat_id', seatId, { expires: 1, path: '/' });
        }
    }, [seatId]);

    const spirits = [
        { zh: '琴酒', en: 'GIN', type: 'TASTING_GIN' },
        { zh: '威士忌', en: 'WHISKEY', type: 'TASTING_WHISKEY' },
        { zh: '龍舌蘭', en: 'TEQUILA', type: 'TASTING_TEQUILA' },
        { zh: '白蘭地', en: 'BRANDY', type: 'TASTING_BRANDY' },
        { zh: '蘭姆酒', en: 'RUM', type: 'TASTING_RUM' },
        { zh: '其他', en: 'OTHER', type: 'TASTING_OTHER' }
    ];

    const getLinkWithSeat = (type) => {
        const currentSeat = seatId || Cookies.get('customer_seat_id');
        // 轉小寫路徑通常對 SEO 與網址美觀較好，後端再轉大寫查詢即可
        const pathType = type.toLowerCase(); 
        return currentSeat ? `/spirits/${pathType}?SEAT_ID=${currentSeat}` : `/spirits/${pathType}`;
    };

    return (
        <div className="spirit-page">
            <Link to="/" className="back-link" style={{ position: 'absolute', top: '20px', left: '20px', color: '#8b6f47', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>
                ← HOME
            </Link>

            <div className="menu-header">
                <h1>單杯品飲 / Spirits</h1>
                {/* 加上桌號裝飾標籤 */}
                <div className="seat-info-badge">
                    <span className="dot"></span>
                    TABLE: {Cookies.get('customer_seat_name') || 'T1'}
                </div>
            </div>

            <div className="button-container">
                {spirits.map((spirit, index) => (
                    <Link 
                        key={index} 
                        state={{displayName: spirit.en}}
                        to={getLinkWithSeat(spirit.type)} 
                        className="spirit-button"
                    >
                        <span className="zh">{spirit.zh}</span>
                        <span className="en">{spirit.en}</span>
                    </Link>
                ))}
            </div>

            <footer className="menu-footer">
                <p>* 價格以 15ml / 30ml 為準</p>
                <p>* 點擊類別進入詳細酒單</p>
            </footer>
        </div>
    );
}

export default BaseMenu;