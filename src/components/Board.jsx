import Card from './Card';

export default function Board({ cards, cols, onCardClick }) {
  return (
    <div
      className="game-board"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {cards.map(card => (
        <Card key={card.id} card={card} onClick={onCardClick} />
      ))}
    </div>
  );
}
