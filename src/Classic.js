// Classic.js
import React from 'react';
import './Classic.css'; // 將原本 classic.html 的 CSS 放入此檔

function Classic() {
  const cocktails = [
    { name: "Martini 馬丁尼", price: "250", desc: "Gin, Dry Vermouth, Olive", zh: "琴酒、辛辣苦艾酒、橄欖" },
    { name: "Negroni 內格羅尼", price: "300", desc: "Gin, Campari, Sweet Vermouth", zh: "琴酒、金巴利、甜苦艾酒" },
    // ...以此類推
  ];

  return (
    <div className="menu-container">
      <div className="section-title text-gradient">CLASSIC COCKTAILS</div>
      <div className="menu-grid">
        {cocktails.map((item, index) => (
          <div className="menu-item" key={index}>
            <div className="item-header">
              <span className="item-name">{item.name}</span>
              <span className="item-price">{item.price}</span>
            </div>
            <div className="item-description">{item.desc}</div>
            <div className="item-description-zh">{item.zh}</div>
          </div>
        ))}
      </div>
      {/* 這裡可以依照您的 classic.html 內容繼續加入 Food section */}
    </div>
  );
}

export default Classic;