import './menu.css';

function BaseMenu() {
    const spirits = [
        { zh: '經典調酒', en: 'CLASSIC', link: '/classic' },
        { zh: '特調', en: 'SPECIAL', link: '/special' },
        { zh: '琴酒', en: 'GIN', link: '/spirits/gin' },
        { zh: '威士忌', en: 'WHISKEY', link: '/spirits/whiskey' },
    ];

    return (
        <div className="spirit-page">
            <h1>單杯品飲 / Spirits</h1>
            <div className="button-container">
                {spirits.map((spirit, index) => (
                    <a key={index} href={spirit.link} className="spirit-button">
                        <span className="zh">{spirit.zh}</span>
                        <span className="en">{spirit.en}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}

export default BaseMenu;