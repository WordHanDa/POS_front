import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

const SpiritSection = ({ type, title, BASE_API }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false); // 控制加載提示淡出
    const [hasLoaded, setHasLoaded] = useState(false);   // 控制內容淡入
    const [error, setError] = useState(false);

    const fetchWithRetry = useCallback(async (url, retries = 2, delay = 1000) => {
        try {
            const res = await fetch(url);
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
    }, []);

    const fetchData = useCallback(async () => {
        if (!type) return;

        // 重置狀態，開始新的一輪載入
        setLoading(true);
        setIsFadingOut(false);
        setHasLoaded(false);
        setError(false);

        try {
            const apiType = type.toUpperCase();
            const apiUrl = `${BASE_API}/ITEM_GROUPED?type=${apiType}&is_active=1`;
            const data = await fetchWithRetry(apiUrl);

            if (Array.isArray(data)) {
                setItems(data);

                // 觸發淡出 Loading
                setIsFadingOut(true);

                // 增加延遲，確保外層 SpiritDetail 的進場動畫已經跑了一半以上
                setTimeout(() => {
                    setLoading(false);
                    setIsFadingOut(false);
                    setHasLoaded(true);
                }, 700); // 將時間從 500ms 提高到 700ms
            } else {
                throw new Error('Data format error');
            }
        } catch (err) {
            console.error("Final Fetch Error:", err);
            setError(true);
            setLoading(false);
        }
    }, [type, BASE_API, fetchWithRetry]);

    useEffect(() => {
        fetchData();
    }, [type, fetchData]);

    const addToCart = (e, item) => {
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
                quantity: 1,
                note: ""
            });
        }
        Cookies.set('shopping_cart', JSON.stringify(cart), { expires: 7, path: '/' });
        window.dispatchEvent(new CustomEvent('ADD_TO_CART_ANIMATION', {
            detail: { originEvent: e }
        }));
    };

    // 錯誤 UI
    if (error) return (
        <div style={{ textAlign: 'center', padding: '50px', color: '#b2966b' }}>
            <p>伺服器忙碌中，請稍候再試</p>
            <button onClick={fetchData} className="variant-price-btn" style={{ margin: '0 auto', display: 'block' }}>重試</button>
        </div>
    );

    return (
        <div className="spirit-section-wrapper">
            {/* 1. 加載中提示：包含淡出 class */}
            {(loading || isFadingOut) && !hasLoaded && (
                <div className={`loading-placeholder ${isFadingOut ? 'fade-out' : ''}`}>
                    <div className="loader-circle" style={{ width: '30px', height: '30px' }}></div>
                    <p className="loading-text">Selecting {title}...</p>
                </div>
            )}

            {/* 2. 數據內容：當載入完成後顯示，並觸發 Stagger 動畫 */}
            {hasLoaded && (
                <div className="spirit-grid">
                    {items.length === 0 ? (
                        <p className="no-item-text">此類別目前沒有品項</p>
                    ) : (
                        items.map((group, index) => (
                            <div
                                className="spirit-card"
                                key={index}
                                style={{ animationDelay: `${index * 0.1}s` }} // 每個卡片間隔 0.1s 出現
                            >
                                <div className="item-content">
                                    <div className="card-header">
                                        <span className="item-name">{group.display_name}</span>
                                        {group.display_abv && <span className="abv-tag">{group.display_abv}% ABV</span>}
                                    </div>
                                    <div className="divider">
                                        <img
                                            src={group.picture_url?.startsWith('/') ? group.picture_url : `/${group.picture_url}`}
                                            className="item-image"
                                            alt={group.display_name}
                                            loading="lazy"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150x220?text=No+Image' }}
                                        />
                                        <p className="description">{group.description}</p>
                                    </div>
                                    <div className="price-box-grouped">
                                        {group.variants.map(v => (
                                            <button
                                                key={v.item_id}
                                                className="variant-price-btn"
                                                onClick={(e) => addToCart(e, { // 確保傳入 e
                                                    ITEM_ID: v.item_id,
                                                    ITEM_NAME: v.original_name,
                                                    ITEM_PRICE: v.price
                                                })}
                                            >
                                                <span className="v-size">{v.size}</span>
                                                <span className="v-price">${v.price}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SpiritSection;