import React from 'react';
import { useParams, Link } from 'react-router-dom';

function SpiritDetail() {
  const { type } = useParams();

  return (
    <div className="detail-container" style={{ padding: '40px', textAlign: 'center' }}>
      <Link to="/spirits" style={{ color: '#8b6f47', textDecoration: 'none' }}>← 返回類別</Link>
      <h1 style={{ color: '#4a3925', marginTop: '20px' }}>{type?.toUpperCase()}</h1>
      <p>酒單內容載入中...</p>
    </div>
  );
}

export default SpiritDetail; // 確保有這一行