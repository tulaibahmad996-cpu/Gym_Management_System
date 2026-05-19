function Card({ title, value, subtitle, accent }) {
  return (
    <div className={`metric-card ${accent ? 'accent-card' : ''}`}>
      <div>
        <p className="metric-label">{title}</p>
        <h2>{value}</h2>
      </div>
      {subtitle && <p className="metric-subtitle">{subtitle}</p>}
    </div>
  );
}

export default Card;
