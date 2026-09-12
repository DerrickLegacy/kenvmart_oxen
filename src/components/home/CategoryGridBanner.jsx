/**
 * CategoryGridBanner — "Main Items"
 *
 * Horizontally scrollable image cards, one per category.
 * Each card: full-bleed product image + dark gradient + label.
 * Matches the reference design (HP / Apple / Canon / Lenovo style cards).
 */
import { useNavigate } from 'react-router-dom';

const ITEMS = [
  {
    id: 1, label: 'Earphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    query: 'earphones',
  },
  {
    id: 2, label: 'Chargers',
    image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=300&fit=crop',
    query: 'charger',
  },
  {
    id: 3, label: 'Power Banks',
    image: 'https://images.unsplash.com/photo-1609599006353-e629aa8fe3c0?w=400&h=300&fit=crop',
    query: 'power+bank',
  },
  {
    id: 4, label: 'Speakers',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop',
    query: 'speaker',
  },
  {
    id: 5, label: 'Earbuds',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop',
    query: 'earbuds',
  },
  {
    id: 6, label: 'Headsets',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
    query: 'headset',
  },
  {
    id: 7, label: 'Cables',
    image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400&h=300&fit=crop',
    query: 'cable',
  },
  {
    id: 8, label: 'Smart Watch',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=300&fit=crop',
    query: 'watch',
  },
  {
    id: 9, label: 'Flash Disks',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f8b6?w=400&h=300&fit=crop',
    query: 'flash+disk',
  },
  {
    id: 10, label: 'Car Audio',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&h=300&fit=crop',
    query: 'car+mp3',
  },
];

export default function CategoryGridBanner() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: '16px 0 20px', background: '#f0f2f8' }}>
      <style>{`
        .cgb-strip { scrollbar-width: none; -ms-overflow-style: none; }
        .cgb-strip::-webkit-scrollbar { display: none; }

        .cgb-card {
          flex-shrink: 0;
          width: 150px;
          height: 110px;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          border: 2px solid transparent;
          transition: transform 0.18s cubic-bezier(0.23,1,0.32,1),
                      box-shadow 0.18s ease,
                      border-color 0.18s ease;
        }
        .cgb-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          border-color: #e18f27;
        }
        .cgb-card:active { transform: scale(0.97); }

        .cgb-card img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.28s ease;
          filter: brightness(0.82);
        }
        .cgb-card:hover img {
          transform: scale(1.06);
          filter: brightness(0.95);
        }

        /* gradient overlay */
        .cgb-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0) 30%,
            rgba(0,0,0,0.65) 100%
          );
          pointer-events: none;
        }

        .cgb-label {
          position: absolute;
          bottom: 8px;
          left: 0; right: 0;
          text-align: center;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.02em;
          z-index: 1;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5);
          pointer-events: none;
        }

        /* mobile: slightly smaller cards */
        @media (max-width: 480px) {
          .cgb-card { width: 120px; height: 88px; }
          .cgb-label { font-size: 11px; bottom: 6px; }
        }
      `}</style>

      <div className="container">
        {/* header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Main Items
          </h3>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: 'none', border: 'none', fontSize: 13,
              fontWeight: 600, color: '#183B9B', cursor: 'pointer',
              padding: '2px 0', transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.65'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            View all
          </button>
        </div>

        {/* scrollable image card strip */}
        <div
          className="cgb-strip"
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 4,
          }}
        >
          {ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="cgb-card"
              aria-label={`Browse ${item.label}`}
              onClick={() => navigate(`/products?q=${item.query}`)}
            >
              <img
                src={item.image}
                alt={item.label}
                onError={e => { e.currentTarget.style.background = '#dde2ec'; }}
              />
              <span className="cgb-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
