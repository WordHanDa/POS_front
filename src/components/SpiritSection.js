import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

const SpiritSection = ({ type, title, BASE_API }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    // 1. 封裝具備重試機制的請求 (指數退避策略)
    const fetchWithRetry = useCallback(async (url, retries = 2, delay = 1000) => {
        try {
            const res = await fetch(url);
            // 處理 500+ 伺服器錯誤：進行 A -> B 的重試邏輯
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

    // 2. 核心抓取邏輯：循序漸進處理
    const fetchData = useCallback(async () => {
        // 節省資源：避免併發請求與無效請求
        if (loading || !type) return;

        setLoading(true);
        setError(false);

        try {
            const apiType = type.toUpperCase();
            const apiUrl = `${BASE_API}/ITEM_GROUPED?type=${apiType}`;
            
            // 請求 A：與伺服器通訊獲取數據
            const data = await fetchWithRetry(apiUrl);

            // 請求 A 成功獲得回覆後，才執行請求 B：處理數據與渲染狀態
            if (Array.isArray(data)) {
                setItems(data);
                // 成功載入後的後續動作：平滑捲動到頂部
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                throw new Error('Data format error');
            }
        } catch (err) {
            console.error("Final Fetch Error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [type, BASE_API, loading, fetchWithRetry]);

    // 3. 單一生命週期管理：僅在必要時觸發
    useEffect(() => {
        fetchData();
    }, [type]); // 僅當 type 改變時重新抓取數據

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
                quantity: 1,
                note: ""
            });
        }
        Cookies.set('shopping_cart', JSON.stringify(cart), { expires: 7, path: '/' });
    };

    // 4. 錯誤處理 UI 邏輯
    if (error) return (
        <div style={{ textAlign: 'center', padding: '50px', color: '#b2966b' }}>
            <p>伺服器忙碌中，請稍候再試</p>
            <button onClick={fetchData} className="variant-price-btn" style={{ margin: '0 auto', display: 'block' }}>重試</button>
        </div>
    );

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#8b6f47' }}>Loading {title}...</div>;

    return (
        <div className="spirit-section-wrapper">
            {items.length === 0 && !loading && (
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#8b6f47' }}>此類別目前沒有品項</p>
            )}

            <div className="spirit-grid">
                {items.map((group, index) => (
                    <div className="spirit-card" key={index}>
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
                                    loading="lazy" /* 瀏覽器原生延遲載入以節省頻寬 */
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150x220?text=No+Image' }}
                                />
                                <p className="description">{group.description}</p>
                            </div>
                            <div className="price-box-grouped">
                                {group.variants.map(v => (
                                    <button
                                        key={v.item_id}
                                        className="variant-price-btn"
                                        onClick={() => addToCart({
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
                ))}
            </div>
        </div>
    );
};

export default SpiritSection;