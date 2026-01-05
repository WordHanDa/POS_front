import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const SpiritSection = ({ type, title, BASE_API }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // 抓取後端分組資料
    const fetchData = async () => {
        if (!type) return;
        setLoading(true);
        try {
            const apiType = type.toUpperCase();
            const apiUrl = `${BASE_API}/ITEM_GROUPED?type=${apiType}`;

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
        window.scrollTo(0, 0);
    }, [type, BASE_API]);

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
        // 可選：加入提示效果
        console.log(`已加入購物車: ${item.ITEM_NAME}`);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#8b6f47' }}>Loading {title}...</div>;

    return (
        <div className="spirit-section-wrapper">
            {items.length === 0 && !loading && (
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#8b6f47' }}>此類別目前沒有品項</p>
            )}

            {/* 使用 CSS 定義的 spirit-grid 網格佈局 */}
            <div className="spirit-grid">
                {items.map((group, index) => (
                    <div className="spirit-card" key={index}>



                        {/* 2. 右側內容區 */}
                        <div className="item-content">

                            {/* 內容區頂部：酒名與 ABV 標籤 */}
                            <div className="card-header">
                                <div className="name-wrapper">
                                    <span className="item-name">{group.display_name}</span>
                                </div>
                                {group.display_abv && (
                                    <span className="abv-tag">{group.display_abv}% ABV</span>
                                )}
                            </div>
                            <div className="divider">
                                {/* 1. 左側圖片：使用絕對路徑修正 */}
                                <img
                                    src={group.picture_url?.startsWith('/') ? group.picture_url : `/${group.picture_url}`}
                                    className="item-image"
                                    alt={group.display_name}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150x220?text=No+Image' }}
                                />

                                {/* 內容區中間：口感與故事描述 */}
                                <p className="description">{group.description}</p>
                            </div>
                            {/* 內容區底部：15ml/30ml 選擇按鈕 (推至底部) */}
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