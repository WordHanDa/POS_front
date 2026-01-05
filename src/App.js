import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 匯入各個頁面元件
import Home from './components/Home';
import BaseMenu from './components/BaseMenu';
import Classic from './components/Classic';
import Special from './components/Special';
import SpiritDetail from './components/SpiritDetail';

// 匯入購物車組件 (假設你將上面的購物車代碼存為 CartDrawer.js)
import CartDrawer from './components/CartDrawer';

const BASE_API = 'https://posserver-sigma.vercel.app';

function App() {
  return (
    <Router>
      {/* 1. 放在這裡：無論頁面如何切換，購物車按鈕都會固定在右下角 */}
      <CartDrawer />

      <Routes>
        {/* 入口首頁 */}
        <Route path="/" element={<Home />} />
        
        {/* 經典調酒頁 */}
        <Route path="/classic" element={<Classic BASE_API={BASE_API} />} />
        
        {/* 特調頁 */}
        <Route path="/special" element={<Special BASE_API={BASE_API} />} />
        
        {/* 基酒選單頁 */}
        <Route path="/spirits" element={<BaseMenu BASE_API={BASE_API} />} />
        
        {/* 基酒詳細列表 */}
        <Route path="/spirits/:type" element={<SpiritDetail BASE_API={BASE_API} />} />
      </Routes>
    </Router>
  );
}

export default App;