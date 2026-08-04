import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cookies from 'js-cookie';

// 匯入各個頁面元件
import Home from './components/Home';
import BaseMenu from './components/BaseMenu';
import Classic from './components/Classic';
import Special from './components/Special';
import SpiritDetail from './components/SpiritDetail';
import CartDrawer from './components/CartDrawer';

const BASE_API = 'http://127.0.0.1:3002';

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const seatIdFromUrl = params.get('SEAT_ID');

    if (seatIdFromUrl) {
      // 1. 先存下 ID
      Cookies.set('customer_seat_id', seatIdFromUrl, { expires: 1, path: '/' });

      // 2. 向後端請求所有座位清單，比對出 SEAT_NAME
      fetch(`${BASE_API}/SEAT`)
        .then(res => res.json())
        .then(data => {
          // 找尋 ID 匹配的座位項目
          const targetSeat = data.find(s => String(s.SEAT_ID) === String(seatIdFromUrl));
          if (targetSeat) {
            // 3. 找到後將 SEAT_NAME 存入 Cookie
            Cookies.set('customer_seat_name', targetSeat.SEAT_NAME, { expires: 1, path: '/' });
            console.log(`桌號名稱已鎖定: ${targetSeat.SEAT_NAME}`);
          }
        })
        .catch(err => console.error("獲取座位名稱失敗:", err));
    }
  }, []);

  return (
    <Router>
      {/* 傳入 BASE_API 到 CartDrawer */}
      <CartDrawer BASE_API={BASE_API} />

      <Routes>
        <Route path="/" element={<Home BASE_API={BASE_API} />} />
        <Route path="/classic" element={<Classic BASE_API={BASE_API} />} />
        <Route path="/special" element={<Special BASE_API={BASE_API} />} />
        <Route path="/spirits" element={<BaseMenu BASE_API={BASE_API} />} />
        <Route path="/spirits/:type" element={<SpiritDetail BASE_API={BASE_API} />} />
      </Routes>
    </Router>
  );
}

export default App;