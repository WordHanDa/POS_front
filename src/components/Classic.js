import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Classic.css';

function Classic({ BASE_API }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 串接您的 API 位址
    fetch(`${BASE_API}/ITEM_BY_TYPE?type=aaa`)
      .then(response => response.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="menu-container" style={{color: '#fff'}}>Loading...</div>;
  }

  return (
    <div className="classic-page">
      <div className="menu-container">
        <Link to="/" className="back-link" style={{ color: '#b2966b', textDecoration: 'none' }}>← BACK</Link>
        
        <div className="section-title text-gradient">MENU SELECTION</div>
        
        <div className="menu-grid">
          {items.map((item) => (
            <div className="menu-item" key={item.ITEM_ID}>
              <div className="item-header">
                {/* 使用 API 返回的 ITEM_NAME 與 ITEM_PRICE */}
                <span className="item-name">{item.ITEM_NAME}</span>
                <span className="item-price">{item.ITEM_PRICE}</span>
              </div>
              {/* 使用 API 返回的 Description */}
              <div className="item-description">{item.Description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Classic;