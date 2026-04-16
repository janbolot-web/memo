import { useState, useEffect } from 'react';

export default function CategoryModal({ isOpen, onClose, onSave, initialPool = [] }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setText(initialPool.join(', '));
    }
  }, [isOpen, initialPool]);

  if (!isOpen) return null;

  const handleSave = () => {
    const pool = text.split(',').map(s => s.trim()).filter(Boolean);
    if (pool.length > 0) {
      onSave(pool);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2 className="modal-title" style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Мой список</h2>
        <p className="modal-subtitle" style={{ marginBottom: '16px' }}>
          Введите слова или эмодзи через запятую
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'яблоко, груша, 🚗, 🚀\nДаже если слов мало, они будут повторяться.'}
          style={{
            width: '100%',
            height: '100px',
            background: 'rgba(17, 17, 40, 0.7)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '12px',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            fontSize: '1rem',
            resize: 'none',
            marginBottom: '20px'
          }}
        />
        <button className="modal-btn modal-btn-primary" onClick={handleSave}>
          💾 Сохранить
        </button>
        <button className="modal-btn modal-btn-secondary" onClick={onClose}>
          ✕ Отмена
        </button>
      </div>
    </div>
  );
}
