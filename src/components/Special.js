import React from 'react';
import { Link } from 'react-router-dom';
import './menu.css'; // 使用你 components 內的 menu.css

function Special() {
  const specialDrinks = [
    { name: "The " + "G" + "arden", price: "350", desc: "Gin, Elderflower, Cucumber", zh: "琴酒、接骨木花、小黃瓜" },
    { name: "Island Oasis", price: "380", desc: "Rum, Pineapple, Coconut", zh: "蘭姆酒、鳳梨、椰子" }
    // 請根據 spical.html 內容補齊其他品項
  ];

  return (
    <div className="menu-container dark-theme">
      <Link to="/" className="back-link">← Back</Link>
      <div className="section-title text-gradient">SPECIAL SELECTION</div>
      <div className="menu-grid">
        {specialDrinks.map((drink, index) => (
          <div className="menu-item" key={index}>
            <div className="item-header">
              <span className="item-name">{drink.name}</span>
              <span className="item-price">{drink.price}</span>
            </div>
            <div className="item-description">{drink.desc}</div>
            <div className="item-description-zh">{drink.zh}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Special;