import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './Cart.css';

const CartDrawer = ({ BASE_API }) => {
    const [cart, setCart] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isBumping, setIsBumping] = useState(false);
    const [isOrderSuccess, setIsOrderSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

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
        const interval = setInterval(loadCart, 1000);
        return () => clearInterval(interval);
    }, []);

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

    const totalPrice = cart.reduce((sum, item) => sum + (item.ITEM_PRICE * item.quantity), 0);

    // 在 CartDrawer.js 內部
    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            // 從 Cookie 讀取桌號，若不存在則預設為 "1"
            const savedSeat = Cookies.get('customer_seat_ID') || '0';
            let orderGeneralNote = '手機自助點餐';
            const cartJson = Cookies.get('shopping_cart');
            if (cartJson) {
                const parsedCart = JSON.parse(cartJson);
                // 2. 取得第一個品項的 note (如果存在的話)
                if (parsedCart.length > 0 && parsedCart[0].note) {
                    orderGeneralNote = parsedCart[0].note;
                }
            }
            const orderData = {
                items: cart.map(item => ({
                    ITEM_ID: item.ITEM_ID,
                    quantity: item.quantity,
                    ITEM_PRICE: item.ITEM_PRICE,
                    note: item.note || "" // 每個品項的個別要求
                })),
                note: orderGeneralNote // 整筆訂單的來源或總結
            };

            // 將 SEAT_ID 作為 Query Parameter 傳送
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
                {cart.length > 0 && <span className="count">{cart.length}</span>}
            </div>

            {/* 2. 購物車側欄 */}
            <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                <div className={`cart-panel ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    <div className="seat-display">
                        SEAT: {Cookies.get('customer_seat_name') || '未設定'}
                    </div>
                    <h2 className="text-gradient">YOUR ORDER</h2>

                    {cart.length === 0 ? (
                        <div className="empty-cart-container"><p className="empty-msg">購物車目前是空的</p></div>
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
                                        {/* 新增：個別品項備註輸入框 */}
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
                                <div className="total-row"><span>TOTAL</span><span className="total-price">${totalPrice}</span></div>
                                <button className="checkout-btn" onClick={() => setIsConfirming(true)}>CONFIRM & CHECKOUT</button>
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

            {/* 4. 成功提示 (略，與之前相同) */}
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