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

  const fetchWithRetry = async (url, retries = 2, delay = 1000) => {
  try {
    const res = await fetch(url);
    
    // 只有在 500 系列錯誤時才重試，減少無謂的 400 系列請求重試
    if (!res.ok) {
      if (res.status >= 500 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, retries - 1, delay * 2);
      }
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, retries - 1, delay * 2);
    }
    throw err;
  }
};

  const fetchData = async () => {
  // 1. 資源檢查：若已載入或正在載入中，則不重複請求
  if (hasLoaded || loading) return;

  setLoading(true);
  setError(false);

  try {
    // 2. A 請求：嘗試獲取數據，內建自動重試機制
    const data = await fetchWithRetry(`${BASE_API}/ITEM_BY_TYPE?type=${type}`, 2);

    // 3. 資料驗證：確保收到正確格式才進行狀態更新
    if (Array.isArray(data)) {
      setItems(data);
      setHasLoaded(true); 
      // 可以在此處緊接著請求 B (例如：該類別的促銷資訊或庫存狀態)
      // await fetchPromotionData(type); 
    } else {
      throw new Error("Invalid data structure");
    }
  } catch (err) {
    console.error("Final Request Failure:", err);
    setError(true);
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
        <div className="error-container" style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'rgba(178, 150, 107, 0.05)',
          borderRadius: '8px',
          border: '1px dashed #b2966b',
          margin: '20px 0'
        }}>
          <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '2rem', marginBottom: '15px', color: '#b2966b' }}></i>
          <p style={{ color: '#b2966b', fontSize: '1.1rem', fontWeight: '500' }}>伺服器忙碌中，請稍後再試</p>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>系統已嘗試自動修復，若問題持續請點擊下方按鈕</p>
          <button
            onClick={() => fetchData()}
            className="retry-btn"
            style={{
              background: '#b2966b',
              color: '#000',
              border: 'none',
              padding: '10px 25px',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          >
            點擊重試
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