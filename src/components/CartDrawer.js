import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './Cart.css';

const CartDrawer = ({ BASE_API }) => {
    const [cart, setCart] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isBumping, setIsBumping] = useState(false);
    const [isOrderSuccess, setIsOrderSuccess] = useState(false); // 控制成功彈窗
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 讀取 Cookie 資料
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

    // 初始化與監聽（透過 interval 確保跨頁面同步）
    useEffect(() => {
        loadCart();
        const interval = setInterval(loadCart, 1000);
        return () => clearInterval(interval);
    }, []);

    // 當數量改變時觸發按鈕跳動動畫
    useEffect(() => {
        if (cart.length > 0) {
            setIsBumping(true);
            const timer = setTimeout(() => setIsBumping(false), 400);
            return () => clearTimeout(timer);
        }
    }, [cart.reduce((sum, item) => sum + item.quantity, 0)]);

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

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true);

        try {
            const orderData = {
                items: cart,
                seatId: 1, // 建議之後改為動態桌號
                note: "手機點餐"
            };

            const response = await fetch(`${BASE_API}/PLACE_ORDER`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                // --- 關鍵順序 ---
                Cookies.remove('shopping_cart', { path: '/' });
                setCart([]);

                setIsOpen(false);           // 1. 先把側邊欄收起來

                // 延遲一點點顯示成功視窗，讓側欄收回去的動畫跑完，視覺感更好
                setTimeout(() => {
                    setIsOrderSuccess(true);  // 2. 顯示成功視窗
                }, 400);

            } else {
                alert("訂單送出失敗");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* 1. 懸浮按鈕 - 根據 cart.length 顯示數字並觸發 bump 動畫 */}
            <div
                className={`cart-badge ${isBumping ? 'bump' : ''}`}
                onClick={() => setIsOpen(true)}
            >
                <span className="cart-icon">🛒</span>
                {cart.length > 0 && <span className="count">{cart.length}</span>}
            </div>

            {/* 2. 購物車側欄遮罩層 */}
            <div
                className={`cart-overlay ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
            >
                {/* 3. 購物車面板 - 阻止冒泡避免點擊面板時關閉 */}
                <div
                    className={`cart-panel ${isOpen ? 'open' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>

                    <h2 className="text-gradient">YOUR ORDER</h2>

                    {cart.length === 0 ? (
                        <div className="empty-cart-container">
                            <p className="empty-msg">購物車目前是空的</p>
                        </div>
                    ) : (
                        <>
                            <ul className="cart-items">
                                {cart.map((item, index) => (
                                    <li key={`${item.ITEM_ID}-${index}`} style={{ animationDelay: `${index * 0.05}s` }}>
                                        <div className="cart-item-info">
                                            <div className="name">{item.ITEM_NAME}</div>
                                            <div className="price">${item.ITEM_PRICE}</div>
                                        </div>
                                        <div className="qty-control">
                                            <button onClick={() => updateQuantity(item.ITEM_ID, -1)}>−</button>
                                            <span className="qty-number">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.ITEM_ID, 1)}>+</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="cart-footer">
                                <div className="total-row">
                                    <span>TOTAL</span>
                                    <span className="total-price">${totalPrice}</span>
                                </div>
                                <button
                                    className="checkout-btn"
                                    disabled={cart.length === 0 || isSubmitting}
                                    onClick={handleCheckout}
                                >
                                    {isSubmitting ? 'SENDING...' : 'CONFIRM & CHECKOUT'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 4. 訂單成功全螢幕提示彈窗 (獨立於 isOpen) */}
            {isOrderSuccess && (
                <div className="order-success-overlay">
                    <div className="order-success-modal">
                        <div className="success-icon-wrapper">
                            <div className="success-icon">✓</div>
                        </div>
                        <h2>ORDER PLACED!</h2>
                        <p>您的訂單已成功送出</p>
                        <p className="sub-text">請靜候服務人員為您送餐</p>
                        <button
                            className="close-success-btn"
                            onClick={() => setIsOrderSuccess(false)}
                        >
                            我知道了
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default CartDrawer;