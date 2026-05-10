import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import './Cart.css';

const CartDrawer = ({ BASE_API }) => {
    const [cart, setCart] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isBumping, setIsBumping] = useState(false);
    const [isOrderSuccess, setIsOrderSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [activeOrders, setActiveOrders] = useState([]); // 存放已送出但未結帳的訂單
    const [viewingHistory, setViewingHistory] = useState(false); // 控制歷史紀錄彈窗
    const [flyingParticles, setFlyingParticles] = useState([]);

    const triggerFlyAnimation = (e) => {
        // 取得點擊位置
        const startX = e.clientX;
        const startY = e.clientY;

        // 取得購物車按鈕位置 (右下角)
        const cartButton = document.querySelector('.cart-badge');
        const rect = cartButton.getBoundingClientRect();
        const endX = rect.left + rect.width / 2;
        const endY = rect.top + rect.height / 2;

        const id = Date.now();
        const newParticle = { id, startX, startY, endX, endY };

        setFlyingParticles(prev => [...prev, newParticle]);

        // 動畫結束後移除 (0.8s 為動畫時間)
        setTimeout(() => {
            setFlyingParticles(prev => prev.filter(p => p.id !== id));
            // 動畫結束時觸發購物車震動
            setIsBumping(true);
            setTimeout(() => setIsBumping(false), 400);
        }, 800);
    };
    useEffect(() => {
        loadCart();
        // 監聽加入事件：同時執行「動畫」與「更新數字」
        const handleAddEvent = (event) => {
            if (event.detail?.originEvent) {
                triggerFlyAnimation(event.detail.originEvent);
                loadCart(); // 立即更新數量，不等待 setInterval
            }
        };
        window.addEventListener('ADD_TO_CART_ANIMATION', handleAddEvent);

        return () => window.removeEventListener('ADD_TO_CART_ANIMATION', handleAddEvent);
    }, []);

    const loadCart = () => {
        const savedCart = Cookies.get('shopping_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("解析購物車失敗", e);
            }
        }
    };

    // 將 fetchActiveOrders 包裝成 useCallback 以便在 effect 中安全使用
    const fetchActiveOrders = useCallback(async () => {
        const seatId = Cookies.get('customer_seat_id');
        if (!seatId) return;
        try {
            const response = await fetch(`${BASE_API}/ACTIVE_ORDERS_BY_SEAT/${seatId}`);
            const data = await response.json();
            if (response.ok) {
                setActiveOrders(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("無法獲取進行中訂單:", error);
        }
    }, [BASE_API]);

    useEffect(() => {
        loadCart();
        // 修改：只要開啟側欄或開啟歷史視窗，就更新一次數據
        if (isOpen || viewingHistory) {
            fetchActiveOrders();
        }
        const interval = setInterval(loadCart, 1000);
        return () => clearInterval(interval);
    }, [isOpen, viewingHistory, fetchActiveOrders]);

    // 新增：處理備註更動
    const updateNote = (itemId, noteValue) => {
        const newCart = cart.map(item => {
            if (item.ITEM_ID === itemId) {
                return { ...item, note: noteValue };
            }
            return item;
        });
        setCart(newCart);
        Cookies.set('shopping_cart', JSON.stringify(newCart), { expires: 7, path: '/' });
    };

    const updateQuantity = (itemId, delta) => {
        const newCart = cart.map(item => {
            if (item.ITEM_ID === itemId) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0);

        setCart(newCart);
        Cookies.set('shopping_cart', JSON.stringify(newCart), { expires: 7, path: '/' });
    };

    const { totalPrice, totalQuantity } = React.useMemo(() => {
        return cart.reduce((acc, item) => {
            acc.totalPrice += item.ITEM_PRICE * item.quantity;
            acc.totalQuantity += item.quantity;
            return acc;
        }, { totalPrice: 0, totalQuantity: 0 });
    }, [cart]);

    // 在 CartDrawer.js 內部
    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            const savedSeat = Cookies.get('customer_seat_id') || '0';
            const orderData = {
                items: cart.map(item => ({
                    ITEM_ID: item.ITEM_ID,
                    quantity: item.quantity,
                    ITEM_PRICE: item.ITEM_PRICE,
                    note: item.note || ""
                })),
                note: cart[0]?.note || '手機自助點餐'
            };
            const response = await fetch(`${BASE_API}/PLACE_ORDER?SEAT_ID=${savedSeat}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            if (response.ok) {
                Cookies.remove('shopping_cart', { path: '/' });
                setCart([]);
                setIsOpen(false);
                setIsConfirming(false);
                setTimeout(() => setIsOrderSuccess(true), 400);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* 動畫粒子渲染 */}
            {flyingParticles.map(p => (
                <div
                    key={p.id}
                    className="fly-particle"
                    style={{
                        '--startX': `${p.startX}px`,
                        '--startY': `${p.startY}px`,
                        '--endX': `${p.endX}px`,
                        '--endY': `${p.endY}px`
                    }}
                />
            ))}
            {/* 1. 懸浮按鈕：點擊開啟側欄 */}
            <div className={`cart-badge ${isBumping ? 'bump' : ''}`} onClick={() => setIsOpen(true)}>
                <div className="menu-icon">
                    <i className="fa-solid fa-cart-shopping"></i>
                </div>
                {totalQuantity > 0 && <span className="count">{totalQuantity}</span>}
            </div>

            {/* 2. 購物車側欄：處理當前點餐內容 */}
            <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                <div className={`cart-panel ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>

                    <div className="seat-display">
                        SEAT: {Cookies.get('customer_seat_name') || '未設定'}
                    </div>

                    <h2 className="text-gradient">YOUR ORDER</h2>

                    {/* 查看進行中訂單按鈕 */}
                    <button
                        className="view-history-btn"
                        onClick={() => {
                            setViewingHistory(true);
                            fetchActiveOrders();
                        }}
                    >
                        <i className="fa-solid fa-clock-rotate-left"></i> 查看已點品項
                    </button>

                    {cart.length === 0 ? (
                        <div className="empty-cart-container">
                            <p className="empty-msg">購物車目前是空的</p>
                        </div>
                    ) : (
                        <>
                            <ul className="cart-items">
                                {cart.map((item, index) => (
                                    <li key={`${item.ITEM_ID}-${index}`} className="cart-item-li">
                                        <div className="item-main-row">
                                            <div className="cart-item-info">
                                                <div className="name">{item.ITEM_NAME}</div>
                                                <div className="price">${item.ITEM_PRICE}</div>
                                            </div>
                                            <div className="qty-control">
                                                <button onClick={() => updateQuantity(item.ITEM_ID, -1)}>−</button>
                                                <span className="qty-number">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.ITEM_ID, 1)}>+</button>
                                            </div>
                                        </div>
                                        <div className="item-note-row">
                                            <input
                                                type="text"
                                                placeholder="備註欄(請將您的需求告訴我們)"
                                                value={item.note || ''}
                                                onChange={(e) => updateNote(item.ITEM_ID, e.target.value)}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="cart-footer">
                                <div className="total-row">
                                    <span>TOTAL</span>
                                    <span className="total-price">${totalPrice}</span>
                                </div>
                                <button className="checkout-btn" onClick={() => setIsConfirming(true)}>
                                    CONFIRM & CHECKOUT
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 3. 進行中訂單彈窗：獨立於側欄外，避免疊加干擾 */}
            {viewingHistory && (
                <div className="order-success-overlay" onClick={() => setViewingHistory(false)}>
                    <div className="order-success-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>CURRENT ORDERS</h2>
                        <hr className="history-divider" />

                        <div className="history-scroll-area">
                            {activeOrders.length === 0 ? (
                                <div className="empty-history-msg">
                                    <p>目前尚無未結帳訂單</p>
                                </div>
                            ) : (
                                <ul className="confirm-list">
                                    {activeOrders.map((item, idx) => (
                                        <li key={`active-${idx}`}>
                                            <div className="confirm-item-detail">
                                                <div className="item-title-row">
                                                    <strong>{item.ITEM_NAME} x {item.QUANTITY}</strong>
                                                </div>
                                                {item.ITEM_NOTE && (
                                                    <span className="confirm-note">({item.ITEM_NOTE})</span>
                                                )}
                                                <div className="history-time">
                                                    點餐時間: {new Date(item.ORDER_DATE).toLocaleTimeString('zh-TW', { timeZone: 'UTC' }, [], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div className="history-item-price">
                                                ${item.PRICE_AT_SALE * item.QUANTITY}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {activeOrders.length > 0 && (
                            <div className="history-summary-row">
                                <span>總計</span>
                                <span className="gold-text">
                                    ${activeOrders.reduce((sum, i) => sum + (i.PRICE_AT_SALE * i.QUANTITY), 0)}
                                </span>
                            </div>
                        )}

                        <button className="close-success-btn" onClick={() => setViewingHistory(false)}>
                            關閉
                        </button>
                    </div>
                </div>
            )}

            {/* 4. 二次確認視窗 */}
            {isConfirming && (
                <div className="order-success-overlay" onClick={() => setIsConfirming(false)}>
                    <div className="order-success-modal confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>確認訂單內容</h2>
                        <div className="history-scroll-area">
                            <ul className="confirm-list">
                                {cart.map(item => (
                                    <li key={item.ITEM_ID}>
                                        <div className="confirm-item-detail">
                                            <span>{item.ITEM_NAME} x {item.quantity}</span>
                                            {item.note && <span className="confirm-note">({item.note})</span>}
                                        </div>
                                        <span>${item.ITEM_PRICE * item.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="confirm-total">總計：${totalPrice}</div>
                        <div className="confirm-buttons">
                            <button className="btn-cancel" onClick={() => setIsConfirming(false)}>返回修改</button>
                            <button className="btn-confirm" onClick={handleFinalSubmit} disabled={isSubmitting}>
                                {isSubmitting ? '送出中...' : '下單'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. 成功下單提示 */}
            {isOrderSuccess && (
                <div className="order-success-overlay">
                    <div className="order-success-modal">
                        <div className="success-icon-wrapper">
                            <div className="success-icon">✓</div>
                        </div>
                        <h2>ORDER PLACED!</h2>
                        <p>您的訂單已成功送出</p>
                        <button className="close-success-btn" onClick={() => setIsOrderSuccess(false)}>
                            我知道了
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default CartDrawer;