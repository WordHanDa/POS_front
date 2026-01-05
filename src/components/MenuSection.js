import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

const MenuSection = ({ type, title, BASE_API }) => {
  const [items, setItems] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          fetchData();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasLoaded]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API}/ITEM_BY_TYPE?type=${type}`);
      const data = await res.json();
      setItems(data);
      setHasLoaded(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
        quantity: 1
      });
    }
    Cookies.set('shopping_cart', JSON.stringify(cart), { expires: 7, path: '/' });
  };

  return (
    <div className="menu-section-wrapper" ref={sectionRef}>
      <div className="section-title text-gradient">{title}</div>
      {loading && <p className="loading-text">Loading...</p>}
      <div className="menu-grid">
        {items.map((item) => (
          <div className="menu-item" key={item.ITEM_ID} onClick={() => addToCart(item)}>
            <div className="item-header">
              <span className="item-name">{item.ITEM_NAME}</span>
              <span className="item-price">${item.ITEM_PRICE}</span>
            </div>
            <div className="item-description">{item.Description}</div>
            <div className="add-hint">+ ADD TO CART</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuSection;