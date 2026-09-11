/**
 * CategoryGridBanner — "Main Items" horizontally scrollable chip strip
 * Sits immediately after the carousel.
 * Each chip: circular icon + label, first one highlighted in brand blue.
 */
import { useNavigate } from 'react-router-dom';

const ITEMS = [
  { id: 1,  label: 'Earphones',   icon: '🎧', query: 'earphones'  },
  { id: 2,  label: 'Chargers',    icon: '⚡', query: 'charger'    },
  { id: 3,  label: 'Power Banks', icon: '🔋', query: 'power+bank' },
  { id: 4,  label: 'Speakers',    icon: '🔊', query: 'speaker'    },
  { id: 5,  label: 'Earbuds',     icon: '🎵', query: 'earbuds'    },
  { id: 6,  label: 'Headsets',    icon: '🎤', query: 'headset'    },
  { id: 7,  label: 'Cables',      icon: '🔌', query: 'cable'      },
  { id: 8,  label: 'Smart Watch', icon: '⌚', query: 'watch'      },
  { id: 9,  label: 'Flash Disks', icon: '💾', query: 'flash+disk' },
  { id: 10, label: 'Car Audio',   icon: '🚗', query: 'car+mp3'    },
];

function ItemChip({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Browse ${item.label}`}
      style={{
        flexShrink:    0,
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           8,
        background:    active ? '#EEF2FF' : '#fff',
        border:        `1.5px solid ${active ? '#183B9B' : '#e8ecf4'}`,
        borderRadius:  14,
        padding:       '14px 18px 12px',
        cursor:        'pointer',
        minWidth:      76,
        transition:    'transform 0.15s ease, box-shadow 0.15s ease',
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
      {/* circular icon */}
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
        {item.icon}
      </span>

      {/* label */}
      <span style={{
        fontSize:      12,
        fontWeight:    active ? 700 : 500,
        color:         active ? '#183B9B' : '#374151',
        whiteSpace:    'nowrap',
        letterSpacing: '0.01em',
      }}>
        {item.label}
      </span>
    </button>
  );
}

export default function CategoryGridBanner() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: '14px 0 18px', background: '#f8f9fc' }}>
      <style>{`
        .cgb-strip { scrollbar-width: none; -ms-overflow-style: none; }
        .cgb-strip::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="container">

        {/* header row */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginBottom:   12,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Main Items
          </h3>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: 'none', border: 'none',
              fontSize: 13, fontWeight: 600,
              color: '#183B9B', cursor: 'pointer',
              padding: '2px 0', transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.65'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            View all <i className="lni lni-arrow-right" style={{ fontSize: 11, marginLeft: 3 }} />
          </button>
        </div>

        {/* scrollable chip strip */}
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
          {ITEMS.map((item, i) => (
            <ItemChip
              key={item.id}
              item={item}
              active={i === 0}
              onClick={() => navigate(`/products?q=${item.query}`)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
