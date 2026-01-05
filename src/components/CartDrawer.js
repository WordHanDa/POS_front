import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './Cart.css';

const CartDrawer = ({BASE_API}) => {
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
            // 1. 準備發送給後端的資料格式
            const orderData = {
                items: cart,
                totalPrice: cart.reduce((sum, item) => sum + item.ITEM_PRICE * item.quantity, 0),
                orderTime: new Date().toISOString(),
            };

            // 2. 呼叫後端 API (假設路徑為 /PLACE_ORDER)
            const response = await fetch(`${BASE_API}/PLACE_ORDER`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                // 3. 結帳成功後的處理
                Cookies.remove('shopping_cart', { path: '/' }); // 移除 Cookie
                setCart([]);                                   // 清空本地 State
                setIsOrderSuccess(true);                       // 顯示成功提示
                setIsOpen(false);                              // 關閉側選單
            } else {
                alert("結帳失敗，請稍後再試。");
            }
        } catch (error) {
            console.error("Order Error:", error);
            alert("網路錯誤，無法送出訂單。");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className={`cart-badge ${isBumping ? 'bump' : ''}`} onClick={() => setIsOpen(true)}>
                🛒 <span className="count">{cart.length}</span>
            </div>

            <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                <div className={`cart-panel ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    <h2 className="text-gradient">YOUR ORDER</h2>

                    {cart.length === 0 ? <p className="empty-msg">購物車目前是空的</p> : (
                        <ul className="cart-items">
                            {cart.map(item => (
                                <li key={item.ITEM_ID}>
                                    <div className="cart-item-info">
                                        <div className="name">{item.ITEM_NAME}</div>
                                        <div className="price">${item.ITEM_PRICE}</div>
                                    </div>
                                    <div className="qty-control">
                                        <button onClick={() => updateQuantity(item.ITEM_ID, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.ITEM_ID, 1)}>+</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="cart-footer">
                        <div className="total-row">
                            <span>總計</span>
                            <span>${totalPrice}</span>
                        </div>
                        <button
                            className="checkout-btn"
                            disabled={cart.length === 0 || isSubmitting}
                            onClick={handleCheckout}
                        >
                            {isSubmitting ? 'PROCESSING...' : 'CONFIRM & CHECKOUT'}
                        </button>
                        {isOrderSuccess && (
                            <div className="order-success-overlay">
                                <div className="order-success-modal">
                                    <div className="success-icon">✓</div>
                                    <h2>ORDER PLACED!</h2>
                                    <p>您的訂單已成功送出，請靜候服務人員。</p>
                                    <button onClick={() => setIsOrderSuccess(false)}>關閉</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CartDrawer;