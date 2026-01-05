import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const SpiritSection = ({ type, title, BASE_API }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // 定義抓取資料的函式
    const fetchData = async () => {
        if (!type) return;
        setLoading(true);
        try {
            const apiType = type.toUpperCase();
            const apiUrl = `${BASE_API}/ITEM_GROUPED?type=${apiType}`;
            console.log("Fetching from API:", apiUrl);

            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // 滾動到最上方，優化切換類別時的體驗
        window.scrollTo(0, 0);
    }, [type, BASE_API]);

    // 加入購物車邏輯
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

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#8b6f47' }}>Loading {title}...</div>;

    return (
        <div className="spirit-section-wrapper">

            {items.length === 0 && !loading && (
                <p style={{ textAlign: 'center', marginTop: '20px' }}>此類別目前沒有品項</p>
            )}

            <div className="menu-grid">
                {items.map((group, index) => (
                    <div className="item" key={index}>
                        {/* 左側圖片：確保路徑正確 */}
                        <img
                            src={group.picture_url?.startsWith('/') ? group.picture_url : `/${group.picture_url}`}
                            className="item-image"
                            alt={group.display_name}
                        />

                        {/* 右側內容區 */}
                        <div className="item-content">
                            {/* 頂部：酒名與靠右對齊的 ABV */}
                            <div className="item-header">
                                <div className="name-wrapper">
                                    <span className="item-name">{group.display_name}</span>
                                </div>
                                {group.display_abv && (
                                    <span className="abv-tag">{group.display_abv}% ABV</span>
                                )}
                            </div>

                            {/* 中間：描述 */}
                            <p className="description">{group.description}</p>

                            {/* 底部：15ml/30ml 價格按鈕橫向排列 */}
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