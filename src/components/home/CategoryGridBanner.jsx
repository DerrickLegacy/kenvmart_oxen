/**
 * CategoryGridBanner — horizontally scrollable category chips
 *
 * Layout matches the reference image:
 * - Row of pill/icon chips, scrollable on all screen sizes
 * - First chip (or active one) gets a coloured highlight
 * - Smooth momentum scroll, hidden scrollbar
 */
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { id: 1,  label: "Earphones",   icon: "🎧", query: "earphones" },
  { id: 2,  label: "Chargers",    icon: "⚡", query: "charger" },
  { id: 3,  label: "Power Banks", icon: "🔋", query: "power+bank" },
  { id: 4,  label: "Speakers",    icon: "🔊", query: "speaker" },
  { id: 5,  label: "Earbuds",     icon: "🎵", query: "earbuds" },
  { id: 6,  label: "Headsets",    icon: "🎤", query: "headset" },
  { id: 7,  label: "Cables",      icon: "🔌", query: "cable" },
  { id: 8,  label: "Smart Watch", icon: "⌚", query: "watch" },
  { id: 9,  label: "Flash Disks", icon: "💾", query: "flash+disk" },
  { id: 10, label: "Car Audio",   icon: "🚗", query: "car+mp3" },
];

function CategoryChip({ cat, isFirst, onClick }) {
  const active = isFirst; // first chip gets the accent colour — pure visual hint

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Browse ${cat.label}`}
      style={{
        flexShrink:     0,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            8,
        background:     active ? '#EEF2FF' : '#fff',
        border:         active ? '1.5px solid #183B9B' : '1.5px solid #e8ecf4',
        borderRadius:   14,
        padding:        '14px 18px 12px',
        cursor:         'pointer',
        transition:     'transform 0.15s ease, box-shadow 0.15s ease',
        minWidth:       80,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform  = 'translateY(-2px)';
        e.currentTarget.style.boxShadow  = '0 4px 14px rgba(24,59,155,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform  = '';
        e.currentTarget.style.boxShadow  = '';
      }}
    >
      {/* Icon circle */}
      <span style={{
        width:          52,
        height:         52,
        borderRadius:   '50%',
        background:     active ? '#183B9B' : '#f0f2f8',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       24,
        transition:     'background 0.15s ease',
      }}>
        {cat.icon}
      </span>

      {/* Label */}
      <span style={{
        fontSize:    12,
        fontWeight:  active ? 700 : 500,
        color:       active ? '#183B9B' : '#374151',
        whiteSpace:  'nowrap',
        letterSpacing: '0.01em',
      }}>
        {cat.label}
      </span>
    </button>
  );
}

export default function CategoryGridBanner() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: '14px 0 18px', background: '#f8f9fc' }}>
      <div className="container">

        {/* Header row */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginBottom:   12,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Shop by Category
          </h3>
          <button
            onClick={() => navigate('/products')}
            style={{
              background:  'none',
              border:      'none',
              fontSize:    13,
              fontWeight:  600,
              color:       '#183B9B',
              cursor:      'pointer',
              padding:     '2px 0',
              opacity:     1,
              transition:  'opacity 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.65'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            View all →
          </button>
        </div>

        {/* Webkit scrollbar hidden — scoped to this component's strip */}
        <style>{`
          .cgb-strip { scrollbar-width: none; -ms-overflow-style: none; }
          .cgb-strip::-webkit-scrollbar { display: none; }
        `}</style>

        {/* Scrollable chip strip */}
        <div
          className="cgb-strip"
          style={{
            display:                 'flex',
            gap:                     10,
            overflowX:               'auto',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior:          'smooth',
            paddingBottom:           6,
          }}
        >
          {CATEGORIES.map((cat, i) => (
            <CategoryChip
              key={cat.id}
              cat={cat}
              isFirst={i === 0}
              onClick={() => navigate(`/products?q=${cat.query}`)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
