import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './Cart.css';

const CartDrawer = ({ BASE_API }) => {
    const [cart, setCart] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]); // 儲存資料庫中已送出的訂單
    const [isOpen, setIsOpen] = useState(false);
    const [isBumping, setIsBumping] = useState(false);
    const [isOrderSuccess, setIsOrderSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    // 1. 讀取該桌已送出但尚未結帳的訂單 (從 API)
    const loadActiveOrders = async () => {
        const savedSeat = Cookies.get('customer_seat_ID');
        if (!savedSeat) return;

        try {
            const response = await fetch(`${BASE_API}/ACTIVE_ORDERS_BY_SEAT/${savedSeat}`);
            if (response.ok) {
                const data = await response.json();
                setActiveOrders(data);
            }
        } catch (error) {
            console.error("無法獲取已點訂單:", error);
        }
    };

    // 2. 讀取本地購物車緩存 (從 Cookie)
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

    useEffect(() => {
        loadCart();
        // 當側欄開啟時，更新已送出的訂單狀態
        if (isOpen) {
            loadActiveOrders();
        }
        const interval = setInterval(loadCart, 1000);
        return () => clearInterval(interval);
    }, [isOpen]); // 加入 isOpen 依賴

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

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            const savedSeat = Cookies.get('customer_seat_ID') || '0';
            let orderGeneralNote = '手機自助點餐';
            
            if (cart.length > 0 && cart[0].note) {
                orderGeneralNote = cart[0].note;
            }

            const orderData = {
                items: cart.map(item => ({
                    ITEM_ID: item.ITEM_ID,
                    quantity: item.quantity,
                    ITEM_PRICE: item.ITEM_PRICE,
                    note: item.note || ""
                })),
                note: orderGeneralNote
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
                // 送出成功後清空已點清單緩存，下次開啟會重新抓取
                setActiveOrders([]);
            } else {
                const errData = await response.json();
                alert(`訂單送出失敗: ${errData.error || '未知錯誤'}`);
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            alert("網路連線異常，請聯繫服務人員");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* 1. 懸浮按鈕 */}
            <div className={`cart-badge ${isBumping ? 'bump' : ''}`} onClick={() => setIsOpen(true)}>
                <div className="menu-icon">
                    <i className="fa-solid fa-cart-shopping"></i>
                </div>
                {totalQuantity > 0 && <span className="count">{totalQuantity}</span>}
            </div>

            {/* 2. 購物車側欄 */}
            <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                <div className={`cart-panel ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    
                    <div className="seat-display">
                        SEAT: {Cookies.get('customer_seat_name') || '未設定'}
                    </div>
                    
                    <h2 className="text-gradient">YOUR ORDER</h2>

                    {/* A. 已送出清單區塊 (續點顯示) */}
                    {activeOrders.length > 0 && (
                        <div className="active-orders-section">
                            <p className="section-title">已下單 (製作中)</p>
                            <ul className="active-items-list">
                                {activeOrders.map((item, idx) => (
                                    <li key={idx} className="active-item-row">
                                        <div className="active-item-info">
                                            <span className="name">{item.ITEM_NAME} x {item.QUANTITY}</span>
                                            {item.ITEM_NOTE && <span className="note-text">({item.ITEM_NOTE})</span>}
                                        </div>
                                        <span className="status-badge">已收單</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="list-divider"></div>
                        </div>
                    )}

                    {/* B. 購物車加點區塊 */}
                    {cart.length === 0 ? (
                        <div className="empty-cart-container">
                            <p className="empty-msg">
                                {activeOrders.length > 0 ? "尚無加點品項" : "購物車目前是空的"}
                            </p>
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
                                                placeholder="備註 (如：少冰、少糖...)"
                                                value={item.note || ''}
                                                onChange={(e) => updateNote(item.ITEM_ID, e.target.value)}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="cart-footer">
                                <div className="total-row">
                                    <span>SUBTOTAL</span>
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

            {/* 3. 二次確認視窗 */}
            {isConfirming && (
                <div className="order-success-overlay">
                    <div className="order-success-modal confirm-modal">
                        <h2>確認訂單內容</h2>
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
                        <div className="confirm-total">本次預計加點：${totalPrice}</div>
                        <div className="confirm-buttons">
                            <button className="btn-cancel" onClick={() => setIsConfirming(false)}>返回修改</button>
                            <button className="btn-confirm" onClick={handleFinalSubmit} disabled={isSubmitting}>
                                {isSubmitting ? '送出中...' : '確認加點'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. 成功提示 */}
            {isOrderSuccess && (
                <div className="order-success-overlay">
                    <div className="order-success-modal">
                        <div className="success-icon-wrapper"><div className="success-icon">✓</div></div>
                        <h2>ORDER PLACED!</h2>
                        <p>您的訂單已成功送出</p>
                        <button className="close-success-btn" onClick={() => setIsOrderSuccess(false)}>我知道了</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default CartDrawer;