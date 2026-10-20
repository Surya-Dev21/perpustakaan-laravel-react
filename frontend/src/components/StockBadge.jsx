import './style/StockBadge.css';

export default function StockBadge({ stokTersedia, stokTotal, status }) {
  const isAvailable = status === 'Tersedia' || Number(stokTersedia) > 0;

  return (
    <div className="stock-badge-container">
      <span className={`stock-badge ${isAvailable ? 'stock-badge-available' : 'stock-badge-empty'}`}>
        <span className="stock-dot" />
        {isAvailable ? 'Tersedia' : 'Habis'}
      </span>
      <span className="stock-count">
        {stokTersedia} / {stokTotal}
      </span>
    </div>
  );
}
