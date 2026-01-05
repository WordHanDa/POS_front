import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Classic.css';

function Classic({ BASE_API }) {
  const [sparklingItems, setSparklingItems] = useState([]);
  const [shotItems, setShotItems] = useState([]);
  const [gatheringDrinksItems, setGatheringDrinksItems] = useState([]);
  const [tastingMenuItems, setTastingMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch(`${BASE_API}/ITEM_BY_TYPE?type=SPARKLING`).then(res => res.json()),
      fetch(`${BASE_API}/ITEM_BY_TYPE?type=SHOT`).then(res => res.json()),
      fetch(`${BASE_API}/ITEM_BY_TYPE?type=GATHERING_DRINKS`).then(res => res.json()),
      fetch(`${BASE_API}/ITEM_BY_TYPE?type=TASTING_MENU`).then(res => res.json())
    ])
      .then(([sparkling, shot, gathering, tasting]) => {
        setSparklingItems(sparkling);
        setShotItems(shot);
        setGatheringDrinksItems(gathering); // 修正：賦值給 state
        setTastingMenuItems(tasting);       // 修正：賦值給 state
        setLoading(false);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setLoading(false);
      });
  }, [BASE_API]);

  if (loading) return <div className="menu-container" style={{ color: '#fff' }}>Loading...</div>;

  return (
    <div className="classic-page">
      <div className="menu-container">
        <Link to="/" className="back-link" style={{ color: '#b2966b', textDecoration: 'none' }}>← BACK</Link>

        {/* SPARKLING */}
        <div className="section-title text-gradient">SPARKLING 氣泡</div>
        <div className="menu-grid">
          {sparklingItems.map((item) => <MenuItem key={item.ITEM_ID} item={item} />)}
        </div>

        {/* SHOTS */}
        <div className="section-title text-gradient">SHOTS 一口酒</div>
        <div className="menu-grid">
          {shotItems.map((item) => <MenuItem key={item.ITEM_ID} item={item} />)}
        </div>

        {/* GATHERING DRINKS */}
        <div className="section-title text-gradient">GATHERING DRINKS 聚會酒</div>
        <div className="menu-grid">
          {gatheringDrinksItems.map((item) => <MenuItem key={item.ITEM_ID} item={item} />)}
        </div>

        {/* TASTING MENU */}
        <div className="section-title text-gradient">TASTING MENU 品嘗菜單</div>
        <div className="menu-grid">
          {tastingMenuItems.map((item) => <MenuItem key={item.ITEM_ID} item={item} />)}
        </div>
      </div>
    </div>
  );
}

function MenuItem({ item }) {
  return (
    <div className="menu-item">
      <div className="item-header">
        <span className="item-name">{item.ITEM_NAME}</span>
        <span className="item-price">{item.ITEM_PRICE}</span>
      </div>
      <div className="item-description">{item.Description}</div>
    </div>
  );
}

export default Classic;