export default function CategorySelector({ categories, current, onChange, onOpenCustomModal }) {
  return (
    <div className="category-selector">
      {Object.entries(categories).map(([key, { label, icon }]) => (
        <button
          key={key}
          className={`cat-btn ${current === key ? 'active' : ''}`}
          onClick={() => onChange(key)}
          title={label}
        >
          <span className="cat-icon">{icon}</span>
        </button>
      ))}
      <button
        className="cat-btn"
        onClick={onOpenCustomModal}
        title="Создать свой список"
        style={{ border: '2px dashed var(--border)', background: 'transparent' }}
      >
        <span className="cat-icon">➕</span>
      </button>
    </div>
  );
}
