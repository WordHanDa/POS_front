import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 匯入各個頁面元件
import Home from './components/Home';
import BaseMenu from './components/BaseMenu';
import Classic from './components/Classic';
import Special from './components/Special';
import SpiritDetail from './components/SpiritDetail';

const BASE_API = 'https://api.example.com';

function App() {
  return (
    <Router>
      <Routes>
        {/* 入口首頁 (index.html 內容) */}
        <Route path="/" element={<Home />} />
        
        {/* 經典調酒頁 (classic.html 內容) */}
        <Route path="/classic" element={<Classic BASE_API={BASE_API} />} />
        
        {/* 特調頁 (spical.html 內容) */}
        <Route path="/special" element={<Special BASE_API={BASE_API} />} />
        
        {/* 基酒選單頁 (base.html 內容) */}
        <Route path="/spirits" element={<BaseMenu BASE_API={BASE_API} />} />
        
        {/* 基酒詳細列表 (如 /spirits/gin, /spirits/whiskey) */}
        <Route path="/spirits/:type" element={<SpiritDetail BASE_API={BASE_API} />} />
      </Routes>
    </Router>
  );
}

export default App;