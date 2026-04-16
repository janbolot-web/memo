export default function MenuPage({ onSelectGame }) {
  const games = [
    {
      id: 'memo',
      icon: '🃏',
      title: 'МЕМО',
      desc: 'Найди все пары одинаковых карточек. Тренируй память!',
      color: '#7c3aed',
      glow: 'rgba(124, 58, 237, 0.5)',
    },
    {
      id: 'filvordy',
      icon: '🔤',
      title: 'ФИЛВОРДЫ',
      desc: 'Найди все спрятанные слова в сетке букв. Выделяй мышкой или пальцем!',
      color: '#0891b2',
      glow: 'rgba(8, 145, 178, 0.5)',
    },
    {
      id: 'stroop',
      icon: '🧠',
      title: 'СТРУП ТЕСТ',
      desc: 'Называй ЦВЕТ слова, а не само слово. Проверь своё внимание!',
      color: '#ec4899',
      glow: 'rgba(236, 72, 153, 0.5)',
    },
  ];

  return (
    <div className="menu-container">
      <div className="menu-hero">
        <div className="menu-logo">
          <span className="menu-logo-emoji">🎮</span>
          <h1 className="menu-title">ИГРЫ</h1>
          <p className="menu-subtitle">Выбери игру и начни играть</p>
        </div>
      </div>

      <div className="menu-grid">
        {games.map(game => (
          <button
            key={game.id}
            className="menu-card"
            style={{ '--card-color': game.color, '--card-glow': game.glow }}
            onClick={() => onSelectGame(game.id)}
          >
            <div className="menu-card-icon">{game.icon}</div>
            <div className="menu-card-body">
              <h2 className="menu-card-title">{game.title}</h2>
              <p className="menu-card-desc">{game.desc}</p>
            </div>
            <div className="menu-card-arrow">→</div>
          </button>
        ))}
      </div>

      <p className="menu-footer">Больше игр скоро появятся...</p>
    </div>
  );
}
