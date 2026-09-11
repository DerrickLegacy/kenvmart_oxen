/**
 * BrandShowcase — hero image left | 2×2 brand chips right
 *
 * Restored from the original CategoryGridBanner design.
 * Placed between HotProducts and SaleProducts on the home page.
 */
import { useNavigate } from 'react-router-dom';

const BRANDS = [
  {
    id:    1,
    title: 'iAccess',
    image: '/assets/images/categories/iaccess.jpeg',
    bg:    '#1a1640',
  },
  // {
  //   id:    2,
  //   title: 'Oraimo',
  //   image: '/assets/images/categories/oraimo.png',
  //   bg:    '#155a10',
  // },
  // {
  //   id:    3,
  //   title: 'Excellent',
  //   image: '/assets/images/categories/execellent.png',
  //   bg:    '#6b1208',
  // },
  {
    id:    4,
    title: 'Floating Ark',
    image: '/assets/images/categories/floating-ark.png',
    bg:    '#0a2a5e',
  },
];

/* ── Individual brand chip ─────────────────────────────────────────── */
function BrandChip({ brand, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Shop ${brand.title}`}
      style={{
        position:   'relative',
        overflow:   'hidden',
        borderRadius: 8,
        border:     'none',
        padding:    0,
        cursor:     'pointer',
        background: brand.bg,
        height:     '100%',
        display:    'block',
        width:      '100%',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.025)';
        e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <img
        src={brand.image}
        alt={brand.title}
        style={{
          display:        'block',
          width:          '100%',
          height:         '100%',
          objectFit:      'cover',
          objectPosition: 'center',
          position:       'absolute',
          inset:          0,
        }}
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />

      {/* gradient overlay */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0) 55%)',
        zIndex:     1,
      }} />

      {/* label row */}
      <div style={{
        position:       'absolute',
        bottom:         0,
        left:           0,
        right:          0,
        padding:        '8px 10px',
        zIndex:         2,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize:   12,
          fontWeight: 700,
          color:      '#fff',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }}>
          {brand.title}
        </span>
        <span style={{
          fontSize:      10,
          fontWeight:    600,
          color:         '#fff',
          opacity:       0.85,
          letterSpacing: '0.02em',
        }}>
          Shop
        </span>
      </div>
    </button>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */
export default function BrandShowcase() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: '16px 0 20px', background: '#f0f2f8' }}>
      <div className="container">

        {/* section header */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginBottom:   12,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Shop by Brand
          </h3>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: 'none',
              border:     'none',
              fontSize:   13,
              fontWeight: 600,
              color:      '#183B9B',
              cursor:     'pointer',
              padding:    '2px 0',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            View all
          </button>
        </div>

        {/* hero left + 2×2 chip grid right */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:                 10,
          height:              220,
        }}>

          {/* Hero panel */}
          <div style={{
            position:     'relative',
            borderRadius: 10,
            overflow:     'hidden',
            background:   '#0a1628',
            height:       '100%',
          }}>
            <img
              src="/assets/images/carousel/floating-ark-charger-1-65W.png"
              alt="Featured Brand"
              style={{
                display:        'block',
                width:          '100%',
                height:         '100%',
                objectFit:      'cover',
                objectPosition: 'center',
              }}
              onError={e => { e.currentTarget.src = '/assets/images/placeholder.png'; }}
            />

            <div style={{
              position:   'absolute',
              inset:      0,
              background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%)',
            }} />

            <div style={{ position: 'absolute', bottom: 18, left: 18, zIndex: 2 }}>
              <p style={{
                fontSize:      11,
                fontWeight:    600,
                color:         'rgba(255,255,255,0.8)',
                margin:        '0 0 4px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                Featured
              </p>
              <h4 style={{
                fontSize:   16,
                fontWeight: 800,
                color:      '#fff',
                margin:     '0 0 10px',
                lineHeight: 1.2,
                textShadow: '0 1px 6px rgba(0,0,0,0.4)',
              }}>
                Discover Great<br />Brands
              </h4>
              <button
                onClick={() => navigate('/products')}
                style={{
                  background:   '#183B9B',
                  color:        '#fff',
                  border:       'none',
                  borderRadius: 6,
                  padding:      '6px 16px',
                  fontSize:     12,
                  fontWeight:   600,
                  cursor:       'pointer',
                  transition:   'background 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#122e7a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#183B9B'; }}
              >
                Explore All
              </button>
            </div>
          </div>

          {/* 2×2 brand chips */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: '1fr 1fr',
            // gridTemplateRows:    '1fr 1fr',
            gap:                 10,
            height:              '100%',
          }}>
            {BRANDS.map(brand => (
              <BrandChip
                key={brand.id}
                brand={brand}
                onClick={() => navigate(`/products?category=${encodeURIComponent(brand.title)}`)}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
