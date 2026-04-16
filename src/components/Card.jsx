export default function Card({ card, onClick }) {
  return (
    <div
      className="card-wrapper"
      onClick={() => !card.isFlipped && !card.isMatched && onClick(card.id)}
      role="button"
      aria-label={card.isFlipped || card.isMatched ? card.emoji : 'Закрытая карточка'}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(card.id)}
    >
      <div className={`card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}>
        {/* Back side */}
        <div className="card-face card-back">
          <div className="card-back-pattern" />
        </div>
        {/* Front side */}
        <div className={`card-face card-front ${card.isMatched ? 'is-matched' : ''}`}>
          <span 
            className="card-emoji"
            style={card.emoji.length > 2 ? { fontSize: 'clamp(1rem, 3vw, 1.8rem)' } : {}}
          >
            {card.emoji}
          </span>
        </div>
      </div>
    </div>
  );
}
