import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="home-page">
      <div className="overlay"></div>

      <div className="header-content">
        <h1>TENDER's BAR</h1>
        <p className="header-subtitle">長庚大學飲料調製研究社</p>
        <h2>Cocktail Week Special Event</h2>
      </div>

      <div className="scrolling-content">
        <div className="container">
          <p className="story">
            雞尾酒不僅色彩繽紛、滋味迷人，<br />
            更像是一種無聲的語言，<br />
            傳遞情緒與心意。<br /><br />
            如同花語訴說愛與思念，<br />
            每一杯酒都藏著一段故事。<br /><br />
            今晚屬於你的，<br />
            是哪一杯呢？
          </p>
          <p className="story-small">
            Cocktails are not only colorful and delicious,<br />
            but also a silent language,<br />
            conveying emotions and sentiments.<br /><br />
            Like the language of flowers expressing love and longing,<br />
            each drink holds a story.<br /><br />
            So, which one belongs to you tonight?
          </p>
          <p className="story-small">
            カクテルは色とりどりで美味しいだけでなく、<br />
            感情や気持ちを伝える無言の言語でもあります。<br /><br />
            愛と憧れを表現する花言葉のように、<br />
            それぞれのドリンクには物語が込められています。<br /><br />
            今夜、あなたにぴったりなのはどれですか？
          </p>

          <div className="separator"></div>

          <h2>本週菜單 MENU</h2>

          <div className="menu-buttons">
            <Link to="/classic" className="menu-button">
              <div className="menu-icon">
                <i className="fas fa-glass-martini-alt"></i>
              </div>
              <span className="menu-label">經典調酒</span>
              <span className="menu-sublabel">Classic Cocktails</span>
            </Link>

            <Link to="/special" className="menu-button">
              <div className="menu-icon">
                <i className="fas fa-cocktail"></i>
              </div>
              <span className="menu-label">本週特調</span>
              <span className="menu-sublabel">Special Cocktails</span>
            </Link>

            <Link to="/spirits" className="menu-button">
              <div className="menu-icon">
                <i className="fas fa-wine-glass"></i>
              </div>
              <span className="menu-label">單杯品飲</span>
              <span className="menu-sublabel">Single Serve</span>
            </Link>
          </div>


          <p className="description">探索本週最精緻的調酒作品，由我們專業的調酒師精心調製，為您帶來獨特的味覺體驗。</p>
          <p className="description">Explore this week's finest cocktail creations, meticulously crafted by our professional bartenders to bring you a unique taste experience.</p>

          <div className="separator"></div>

          <div className="social-links">
            <a href="https://www.instagram.com/cgu_bartend/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i> cgu_bartend
            </a>
          </div>

          <div className="warming-section">
            <p className="warming">未成年請勿飲酒<br />喝酒不開車，開車不喝酒</p>
            <p className="warming">No drinking under the age of 18.<br />Don't drink and drive.</p>
            <p className="warming">未成年者の饮酒を禁止する<br />お酒を飲んだら運転しないでください</p>
          </div>
        </div>

        <footer className="footer">
          &copy; 2025 <a href="https://www.instagram.com/cgu_bartend/" target="_blank" rel="noopener noreferrer">CGU Tender's Bar</a> | All Rights Reserved
        </footer>
      </div>
    </div>
  );
}

export default Home;