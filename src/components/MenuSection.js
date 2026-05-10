import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';

const MenuSection = ({ type, title, BASE_API, index = 0 }) => {
  // --- 狀態管理擴充 ---
  const [items, setItems] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false); // 是否已完成首次載入
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  // 游標分頁專用狀態
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // --- Refs ---
  const sectionRef = useRef(null); // 用於觀察整個區塊是否進入畫面
  const bottomSentinelRef = useRef(null); // 新增：用於觀察列表底部以觸發下一頁
  const abortControllerRef = useRef(null);

  const formatDescription = (text) => {
    if (!text) return "";
    return text
      .replace(/\{&lt;br\/&gt;\}/g, '\n')
      .replace(/\{br\}/g, '\n')
      .replace(/<br\s*\/?>/gi, '\n');
  };

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

  // --- 核心拉取資料邏輯 (加入游標參數) ---
  const fetchData = useCallback(async (cursorToFetch = null) => {
    if (loading || !hasMore) return;

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(false);

    try {
      // 改為呼叫新的 ITEM_BY_TYPE API，並帶上游標與限制筆數
      const cursorParam = cursorToFetch ? `&cursor=${cursorToFetch}` : '';
      const apiUrl = `${BASE_API}/ITEM_BY_TYPE?type=${encodeURIComponent(type)}&limit=20${cursorParam}`;
      
      const response = await fetchWithRetry(
        apiUrl,
        abortControllerRef.current.signal,
        2
      );

      // 後端回傳格式現在預期是 { data: [...], nextCursor: ... }
      if (response && Array.isArray(response.data)) {
        setIsFadingOut(true);

        setItems(prev => {
          // 過濾重複資料，避免 React 嚴格模式或快速滾動造成的 key 重複
          const newItems = response.data.filter(
            newItem => !prev.some(prevItem => prevItem.ITEM_ID === newItem.ITEM_ID)
          );
          return [...prev, ...newItems];
        });

        setNextCursor(response.nextCursor);
        setHasMore(response.nextCursor !== null); // 如果 nextCursor 是 null，代表沒資料了

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
      console.error("Fetch Failure:", err);
      setError(true);
      setLoading(false);
    }
  }, [BASE_API, type, loading, hasMore]);

  // --- 觀察器 1：負責首次進入畫面的延遲載入 (維持你原本的優秀設計) ---
  useEffect(() => {
    let timeoutId;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded && !loading && items.length === 0) {
          const staggerDelay = index * 200;
          timeoutId = setTimeout(() => {
            fetchData(null); // 首次載入游標為 null
          }, staggerDelay);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px 100px 0px' }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [hasLoaded, loading, index, items.length, fetchData]);

  // --- 觀察器 2：負責無限下拉 (監聽底部元素) ---
  useEffect(() => {
    // 如果還沒首次載入完成，不需要監聽底部
    if (!hasLoaded) return; 

    const bottomObserver = new IntersectionObserver(
      ([entry]) => {
        // 當列表底部進入畫面，且還有更多資料、且沒有正在載入時觸發
        if (entry.isIntersecting && hasMore && !loading) {
          fetchData(nextCursor);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px 200px 0px' } // 提早 200px 觸發下一頁，體驗更滑順
    );

    if (bottomSentinelRef.current) bottomObserver.observe(bottomSentinelRef.current);

    return () => bottomObserver.disconnect();
  }, [hasLoaded, hasMore, loading, nextCursor, fetchData]);

  // 取消請求清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

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
    <div className="menu-section-wrapper" ref={sectionRef} style={{ minHeight: '400px', marginBottom: '40px' }}>
      <div className="section-title text-gradient" style={{ fontSize: '1.8rem', marginBottom: '20px' }}>
        {title}
      </div>

      {(!hasLoaded && loading) && (
        <div className={`loading-placeholder ${isFadingOut ? 'fade-out' : ''}`}>
          <div className="loader-circle-small"></div>
          <p className="loading-text">Crafting {title}...</p>
        </div>
      )}

      {error && items.length === 0 ? (
        <div className="error-container" style={errorContainerStyle}>
          <i className="fa-solid fa-circle-exclamation" style={errorIconStyle}></i>
          <p style={errorTitleStyle}>伺服器忙碌中</p>
          <button onClick={() => fetchData(null)} className="retry-btn" style={retryButtonStyle}>
            點擊重試
          </button>
        </div>
      ) : (
        <>
          <div className="menu-grid content-fade-in">
            {items.map((item) => (
              <div
                className="menu-item"
                key={item.ITEM_ID}
                onClick={(e) => addToCart(e, item)}
              >
                <div className="item-header">
                  <span className="item-name">{item.ITEM_NAME}</span>
                  <span className="item-price">${item.ITEM_PRICE}</span>
                </div>
                {/* 注意：這裡目前吃不到長篇 Description 了 */}
                <div className="item-description" style={{ whiteSpace: 'pre-line' }}>
                  {formatDescription(item.Description)}
                </div>
                <div className="add-hint">+ ADD TO CART</div>
              </div>
            ))}
          </div>
          
          {/* 無限下拉的觀察目標 (Sentinel) */}
          {hasLoaded && (
            <div 
              ref={bottomSentinelRef} 
              style={{ height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}
            >
              {loading && hasMore && <div className="loader-circle-small"></div>}
              {!hasMore && items.length > 0 && <span style={{ color: '#b2966b', fontSize: '0.9rem' }}>已經到底囉</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const errorContainerStyle = { textAlign: 'center', padding: '30px', background: 'rgba(178, 150, 107, 0.05)', borderRadius: '8px', border: '1px dashed #b2966b' };
const errorIconStyle = { fontSize: '1.5rem', marginBottom: '10px', color: '#b2966b' };
const errorTitleStyle = { color: '#b2966b', marginBottom: '15px' };
const retryButtonStyle = { background: '#b2966b', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default MenuSection;