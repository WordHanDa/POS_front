import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

const MenuSection = ({ type, title, BASE_API, index = 0 }) => {
  const [items, setItems] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false); // 控制淡出動畫 class
  const sectionRef = useRef(null);
  const abortControllerRef = useRef(null);

  const formatDescription = (text) => {
    if (!text) return "";
    return text
      .replace(/\{&lt;br\/&gt;\}/g, '\n') // 處理您之前提到的奇怪格式
      .replace(/\{br\}/g, '\n')          // 處理常見的自定義換行符
      .replace(/<br\s*\/?>/gi, '\n');    // 處理標準 HTML 換行標籤
  };

  const isItemActive = (item) => {
    if (!item) return false;
    return item.is_active === 1 || item.is_active === true || item.is_active === '1' || item.is_active === 'true';
  };

  useEffect(() => {
    let timeoutId;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 當元素進入視窗且尚未載入時
        if (entry.isIntersecting && !hasLoaded && !loading) {
          // 增加錯開時間，根據 index 排序 (0ms, 200ms, 400ms...)
          const staggerDelay = index * 200;

          timeoutId = setTimeout(() => {
            fetchData();
          }, staggerDelay);
        }
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px 100px 0px' // 提前一點點觸發
      }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLoaded, type, index]);

  const fetchWithRetry = async (url, signal, retries = 2, delay = 1000) => {
    try {
      const res = await fetch(url, { signal });
      if (!res.ok) {
        if (res.status >= 500 && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, signal, retries - 1, delay * 2);
        }
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, signal, retries - 1, delay * 2);
      }
      throw err;
    }
  };

  const fetchData = async () => {
    if (hasLoaded || loading) return;

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(false);

    try {
      const apiUrl = `${BASE_API}/ITEM?type=${encodeURIComponent(type)}&is_active=1`;
      const data = await fetchWithRetry(
        apiUrl,
        abortControllerRef.current.signal,
        2
      );

      if (Array.isArray(data)) {
        const typeFilter = String(type).toUpperCase();
        const activeItems = data.filter(item =>
          isItemActive(item) && String(item.Type || '').toUpperCase() === typeFilter
        );

        setItems(activeItems);
        setIsFadingOut(true);
        setTimeout(() => {
          setHasLoaded(true);
          setLoading(false);
          setIsFadingOut(false);
        }, 500);
      } else {
        throw new Error("Invalid data structure");
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error("Final Request Failure:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (e, item) => {
    e.stopPropagation();
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
    window.dispatchEvent(new CustomEvent('ADD_TO_CART_ANIMATION', {
      detail: { originEvent: e }
    }));
  };

  return (
    // 重點：minHeight 改為 400px，防止頁面初始長度太短
    <div className="menu-section-wrapper" ref={sectionRef} style={{ minHeight: '400px', marginBottom: '40px' }}>
      <div className="section-title text-gradient" style={{ fontSize: '1.8rem', marginBottom: '20px' }}>
        {title}
      </div>

      {(loading || isFadingOut) && !hasLoaded && (
        <div className={`loading-placeholder ${isFadingOut ? 'fade-out' : ''}`}>
          <div className="loader-circle-small"></div>
          <p className="loading-text">Crafting {title}...</p>
        </div>
      )}

      {error ? (
        <div className="error-container" style={errorContainerStyle}>
          <i className="fa-solid fa-circle-exclamation" style={errorIconStyle}></i>
          <p style={errorTitleStyle}>伺服器忙碌中</p>
          <button onClick={() => fetchData()} className="retry-btn" style={retryButtonStyle}>
            點擊重試
          </button>
        </div>
      ) : (
        hasLoaded && (
          <div className="menu-grid content-fade-in">
            {items.map((item) => (
              <div
                className="menu-item"
                key={item.ITEM_ID}
                onClick={(e) => addToCart(e, item)} // 關鍵：一定要寫 (e) => ... 並把 e 傳進去
              >
                <div className="item-header">
                  <span className="item-name">{item.ITEM_NAME}</span>
                  <span className="item-price">${item.ITEM_PRICE}</span>
                </div>
                <div className="item-description" style={{ whiteSpace: 'pre-line' }}>
                  {formatDescription(item.Description)}
                </div>
                <div className="add-hint">+ ADD TO CART</div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

const errorContainerStyle = { textAlign: 'center', padding: '30px', background: 'rgba(178, 150, 107, 0.05)', borderRadius: '8px', border: '1px dashed #b2966b' };
const errorIconStyle = { fontSize: '1.5rem', marginBottom: '10px', color: '#b2966b' };
const errorTitleStyle = { color: '#b2966b', marginBottom: '15px' };
const retryButtonStyle = { background: '#b2966b', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default MenuSection;