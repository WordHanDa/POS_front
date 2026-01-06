import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

const MenuSection = ({ type, title, BASE_API, index = 0 }) => {
  const [items, setItems] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sectionRef = useRef(null);
  const abortControllerRef = useRef(null); // 用於追蹤請求

  useEffect(() => {
    let timeoutId;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 當元素進入視窗且尚未載入時，發動錯開請求
        if (entry.isIntersecting && !hasLoaded && !loading) {
          const staggerDelay = index * 200; // 每個區塊間隔 200ms

          timeoutId = setTimeout(() => {
            fetchData();
          }, staggerDelay);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    // 清理函數：取消觀察並清除尚未執行的延遲請求
    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [hasLoaded, type, index]);

  const fetchWithRetry = async (url, signal, retries = 2, delay = 1000) => {
    try {
      const res = await fetch(url, { signal });
      
      if (!res.ok) {
        // 針對 500 以上伺服器錯誤進行重試
        if (res.status >= 500 && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, signal, retries - 1, delay * 2);
        }
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      if (err.name === 'AbortError') throw err; // 如果是手動取消，直接拋出不重試
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, signal, retries - 1, delay * 2);
      }
      throw err;
    }
  };

  const fetchData = async () => {
    if (hasLoaded || loading) return;

    // 初始化 AbortController
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(false);

    try {
      const data = await fetchWithRetry(
        `${BASE_API}/ITEM_BY_TYPE?type=${type}`, 
        abortControllerRef.current.signal, 
        2
      );

      if (Array.isArray(data)) {
        setItems(data);
        setHasLoaded(true);
      } else {
        throw new Error("Invalid data structure");
      }
    } catch (err) {
      if (err.name === 'AbortError') return; // 忽略取消請求產生的錯誤
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
    <div className="menu-section-wrapper" ref={sectionRef} style={{ minHeight: '100px' }}>
      <div className="section-title text-gradient">{title}</div>

      {loading && <p className="loading-text">Loading...</p>}

      {error ? (
        <div className="error-container" style={errorContainerStyle}>
          <i className="fa-solid fa-circle-exclamation" style={errorIconStyle}></i>
          <p style={errorTitleStyle}>伺服器忙碌中，請稍後再試</p>
          <p style={errorSubStyle}>系統已嘗試自動修復，若問題持續請點擊下方按鈕</p>
          <button onClick={() => fetchData()} className="retry-btn" style={retryButtonStyle}>
            點擊重試
          </button>
        </div>
      ) : (
        <div className="menu-grid">
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

// 提取樣式以保持主體乾淨
const errorContainerStyle = {
  textAlign: 'center', padding: '40px 20px', background: 'rgba(178, 150, 107, 0.05)',
  borderRadius: '8px', border: '1px dashed #b2966b', margin: '20px 0'
};
const errorIconStyle = { fontSize: '2rem', marginBottom: '15px', color: '#b2966b' };
const errorTitleStyle = { color: '#b2966b', fontSize: '1.1rem', fontWeight: '500' };
const errorSubStyle = { color: '#888', fontSize: '0.9rem', marginBottom: '20px' };
const retryButtonStyle = {
  background: '#b2966b', color: '#000', border: 'none', padding: '10px 25px',
  borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s'
};

export default MenuSection;