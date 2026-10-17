// StarRating.jsx - Fixed horizontal stars
export default function StarRating({ rating = 0, showLabel = true }) {
  // Round to nearest 0.5
  const rounded = Math.round(rating * 2) / 2;

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars.push(
        <li key={i}>
          <i className="lni lni-star-filled"></i>
        </li>
      );
    } else if (i - 0.5 === rounded) {
      stars.push(
        <li key={i}>
          <i className="lni lni-star-half"></i>
        </li>
      );
    } else {
      stars.push(
        <li key={i}>
          <i className="lni lni-star"></i>
        </li>
      );
    }
  }

  const list = (
    <ul
      className="review"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        listStyle: 'none',
        padding: 0,
        margin: 0,
        color: '#FF9410'
      }}
      aria-label={`Rating: ${rating} out of 5`}
    >
      {stars}
    </ul>
  );

  if (!showLabel) {
    return list;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {list}
      <span style={{ fontSize: '13px', color: '#888' }}>
        {rating.toFixed(1)} Review(s)
      </span>
    </div>
  );
}