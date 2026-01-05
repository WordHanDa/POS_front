import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

const MenuSection = ({ type, title, BASE_API }) => {
  const [items, setItems] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false); // 新增錯誤狀態
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          fetchData();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasLoaded, type]); // 加入 type 確保類別改變時邏輯正確

  const fetchData = async () => {
    setLoading(true);
    setError(false); // 開始抓取前重置錯誤狀態
    try {
      const res = await fetch(`${BASE_API}/ITEM_BY_TYPE?type=${type}`);
      
      // 檢查回應是否成功 (處理 500, 404 等)
      if (!res.ok) throw new Error('Server Error');

      const data = await res.json();
      
      // 確保 data 是陣列才設定，否則報錯
      if (Array.isArray(data)) {
        setItems(data);
        setHasLoaded(true);
      } else {
        throw new Error('Data format error');
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError(true); // 捕捉到任何錯誤就設為 true
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingCart = Cookies.get('shopping_cart');
    let cart = existingCart ? JSON.parse(existingCart) : [];
    const idx = cart.findIndex(i => i.ITEM_ID === item.ITEM_ID);

    if (idx > -1) {
      cart[idx].quantity += 1;
    } else {
      cart.push({
        ITEM_ID: item.ITEM_ID,
        ITEM_NAME: item.ITEM_NAME,
        ITEM_PRICE: item.ITEM_PRICE,
        quantity: 1
      });
    }
    Cookies.set('shopping_cart', JSON.stringify(cart), { expires: 7, path: '/' });
  };

  return (
    <div className="menu-section-wrapper" ref={sectionRef}>
      <div className="section-title text-gradient">{title}</div>
      
      {loading && <p className="loading-text">Loading...</p>}

      {/* 發生錯誤時顯示重新整理字串 */}
      {error ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#b2966b' }}>
          <p>發生錯誤，請重新整理</p>
          <button 
            onClick={() => fetchData()} 
            style={{ background: 'none', border: '1px solid #b2966b', color: '#b2966b', padding: '5px 10px', cursor: 'pointer', marginTop: '10px' }}
          >
            重試
          </button>
        </div>
      ) : (
        <div className="menu-grid">
          {/* 加入 Array.isArray 確保不會因 map 而崩潰 */}
          {Array.isArray(items) && items.map((item) => (
            <div className="menu-item" key={item.ITEM_ID} onClick={() => addToCart(item)}>
              <div className="item-header">
                <span className="item-name">{item.ITEM_NAME}</span>
                <span className="item-price">${item.ITEM_PRICE}</span>
              </div>
              <div className="item-description">{item.Description}</div>
              <div className="add-hint">+ ADD TO CART</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuSection;