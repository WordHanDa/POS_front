import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import MenuSection from './MenuSection';
import './specialmenu.css';

function Special({ BASE_API }) {
  
  // 進入頁面時，再次確認桌號（預防直接從網址進入此頁）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const seatId = params.get('SEAT_ID');
    if (seatId) {
      Cookies.set('customer_seat_id', seatId, { expires: 1, path: '/' });
      // 串接 API 取得桌號名稱 (T1, T2...)
      fetch(`${BASE_API}/SEAT`)
        .then(res => res.json())
        .then(data => {
          const target = data.find(s => String(s.SEAT_ID) === String(seatId));
          if (target) Cookies.set('customer_seat_name', target.SEAT_NAME, { expires: 1, path: '/' });
        });
    }
  }, [BASE_API]);

  return (
    <div className="classic-page"> {/* 使用與 Classic 一致的外層 class 確保樣式統一 */}
      <div className="menu-container dark-theme">
        <Link to="/" className="back-link" style={{ color: '#b2966b', textDecoration: 'none' }}>
          ← BACK
        </Link>

        {/* 調用 MenuSection 自動處理 AJAX 請求與滾動偵測 */}
        <MenuSection 
          type="SIGNATURE" 
          title="SIGNATURE 特調系列" 
          BASE_API={BASE_API} 
        />

        {/* 如果特調還有分不同子類別，可以繼續疊加 MenuSection */}
        {/* <MenuSection 
          type="SEASONAL" 
          title="SEASONAL 限定" 
          BASE_API={BASE_API} 
        /> 
        */}
      </div>
    </div>
  );
}

export default Special;