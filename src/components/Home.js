import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home({ BASE_API }) {

  const [latestEvent, setLatestEvent] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const observerOptions = {
      threshold: 0.2 // 當元素出現 20% 時觸發
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible'); // 加入 visible 啟動動畫
        }
      });
    }, observerOptions);

    const storyElements = document.querySelectorAll('.story');
    storyElements.forEach(el => observer.observe(el));

    const eventElement = document.querySelector('.Event');
    if (eventElement) observer.observe(eventElement);

    const conditionElement = document.querySelector('.condition');
    if (conditionElement) observer.observe(conditionElement);

    const formatDate = (dateString) => {
  if (!dateString) return '';
  // 如果是 ISO 格式，先擷取日期部分 (YYYY-MM-DD)
  const datePart = dateString.split('T')[0]; 
  const [year, month, day] = datePart.split('-');
  return `${year}/${month}/${day}`;
};

    const fetchLatestEvent = async () => {
  try {
    // 使用傳入的 BASE_API，確保路徑正確
    const url = `${BASE_API}/EVENT`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error("網路請求失敗");

    const data = await response.json();
    if (data && data.length > 0) {
      // 確保陣列有資料才取用
      setLatestEvent(data[data.length - 1]);
    }
  } catch (err) {
    console.error("無法取得最新活動:", err);
  }
};

    fetchLatestEvent();
    console.log("正在請求的完整路徑:", `${BASE_API}/EVENT`);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [BASE_API ]);

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
          <div className="small-story-container">
            <p className="story">
              Cocktails are not only colorful and delicious,<br />
              but also a silent language,<br />
              conveying emotions and sentiments.<br /><br />
              Like the language of flowers expressing love and longing,<br />
              each drink holds a story.<br /><br />
              So, which one belongs to you tonight?
            </p>
            <p className="story">
              カクテルは色とりどりで美味しいだけでなく、<br />
              感情や気持ちを伝える無言の言語でもあります。<br /><br />
              愛と憧れを表現する花言葉のように、<br />
              それぞれのドリンクには物語が込められています。<br /><br />
              今夜、あなたにぴったりなのはどれですか？
            </p>
          </div>

          <div className="separator"></div>

          <h3>本週菜單 MENU</h3>

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

          <div className="separator"></div>

          <p className="description">探索本週最精緻的調酒作品，由我們專業的調酒師精心調製，為您帶來獨特的味覺體驗。</p>
          <p className="description">Explore this week's finest cocktail creations, meticulously crafted by our professional bartenders to bring you a unique taste experience.</p>

          <div className="small-container">
            <div className="Event">
          <div className="event-title-container">
            <h3 className="event-subtitle">Special Offer</h3>
            <h3>今日特別優惠</h3>
          </div>
          <div className="Event-container">
            {latestEvent ? (
              <>
                <p className='event-text'>【活動說明】</p>
                <table>
                  <tbody>
                    <tr>
                      <th>活動期間：</th>
                      <td className='event-text'>{formatDate(latestEvent.EVENT_START_DATE)} - {formatDate(latestEvent.EVENT_END_DATE)}</td>
                    </tr>
                    <tr>
                      <th>注意事項：</th>
                      <td className='event-text'>{latestEvent.EVENT_NOTE}</td>
                    </tr>
                    <tr>
                      <th>注意事項：</th>
                      <td className='event-text'>{latestEvent.EVENT_NOTE}</td>
                    </tr>
                  </tbody>
                </table>
              </>
            ) : (
              <p className='event-text'>目前暫無特別優惠活動。</p>
            )}
            <p className='hint'>※ 本社團保留所有解釋權。</p>
          </div>
        </div>

            <div className='condition'>
              <div className='condition-container'>
                <div className="condition-title-container">
                  <p className="condition-title">社團規約 </p>
                  <p className="condition-subtitle">Club Regulations</p>
                </div>
                <ul>
                  <li className="condition-text">理性飲酒，嘔吐酌收清潔費 $2000元/人<br />Drink responsibly. A cleaning fee of NT$2000 per person will be charged for vomiting.<br />節度ある飲酒を心がけ、嘔吐した場合はお一人様2000元の清掃費がかかります。</li>
                  <li className="condition-text">攜帶外食則酌收服務費 $2000/桌<br />A service fee of NT$2000 per table will be charged for bringing outside food.<br />外部からの飲食物の持ち込みには、テーブルごとに2000元のサービス料がかかります。</li>
                  <li className="condition-text">自帶酒水則酌收開瓶費 $500/瓶<br />A corkage fee of NT$500 per bottle will be charged for bringing your own alcohol.<br />持ち込みの酒類には、ボトルごとに500元のコルケージ料がかかります。</li>
                  <li className="condition-text">嚴禁性騷擾，若您遇到請向工作人員打PASS<br />Sexual harassment is strictly prohibited. If you encounter it, please inform the staff by saying "PASS".<br />セクシャルハラスメントは厳禁です。遭遇した場合は、スタッフに「PASS」と伝えてください。</li>
                  <li className="condition-text">全店禁止吸菸<br />Smoking is prohibited throughout the venue.<br />店内は全面禁煙です。</li>
                </ul>
              </div>

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
          </div>
        </div>

        <footer className="footer">
          &copy; 2026 <a href="https://www.instagram.com/cgu_bartend/" target="_blank" rel="noopener noreferrer">CGU Tender's Bar</a> | Designed by Y.S Chen
        </footer>
      </div>
    </div>
  );
}

export default Home;