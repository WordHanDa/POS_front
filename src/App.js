import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Classic from './Classic';
import './App.css';
import './menu.css';

function Home() {
  const spirits = [
    { zh: '經典調酒', en: 'CLASSIC', link: '/classic' },
    { zh: '琴酒', en: 'GIN', link: '/gin' },
    { zh: '威士忌', en: 'WHISKEY', link: '/whiskey' },
    // ...
  ];

  return (
    <div className="spirit-page">
      <h1>單杯品飲 / Spirits</h1>
      <div className="button-container">
        {spirits.map((spirit, index) => (
          <Link key={index} to={spirit.link} className="spirit-button">
            <span className="zh">{spirit.zh}</span>
            <span className="en">{spirit.en}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/classic" element={<Classic />} />
        {/* 其他頁面路由 */}
      </Routes>
    </Router>
  );
}

export default App;