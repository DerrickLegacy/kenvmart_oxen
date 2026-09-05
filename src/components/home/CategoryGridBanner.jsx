import { useNavigate } from "react-router-dom";

const CATEGORIES_DATA = [
  { id: 1, title: "iAccess",      image: "/assets/images/categories/iaccess.jpeg",      bgColor: "#2d1b3d" },
  { id: 2, title: "Oraimo",       image: "/assets/images/categories/oraimo.png",         bgColor: "#1a7a0a" },
  { id: 3, title: "Excellent",    image: "/assets/images/categories/execellent.png",     bgColor: "#7a2010" },
  { id: 4, title: "Floating Ark", image: "/assets/images/categories/floating-ark.png",  bgColor: "#0a3a7a" },
];

const FALLBACKS = {
  "iAccess":      "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=300&h=300&fit=crop",
  "Oraimo":       "https://images.unsplash.com/photo-1609599006353-e629aa8fe3c0?w=300&h=300&fit=crop",
  "Excellent":    "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=300&h=300&fit=crop",
  "Floating Ark": "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=300&h=300&fit=crop",
};

function CategoryCard({ category, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
        minHeight: 175,
        backgroundColor: category.bgColor,
        display: 'flex',
        alignItems: 'flex-end',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Brand image — contained so nothing is cropped */}
      <img
        src={category.image}
        alt={category.title}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
          padding: 12,
          opacity: 0.9,
          zIndex: 0,
        }}
        onError={e => { e.currentTarget.src = FALLBACKS[category.title] || ''; }}
      />

      {/* Bottom gradient so text is always readable */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0) 100%)',
      }} />

      {/* Text content pinned to bottom */}
      <div style={{ position: 'relative', zIndex: 2, padding: '0 14px 14px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)', marginBottom: 6 }}>
          {category.title}
        </div>
        <span style={{
          display: 'inline-block',
          padding: '4px 14px',
          backgroundColor: 'rgba(255,255,255,0.22)',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 500,
          color: '#fff',
        }}>
          Shop Now →
        </span>
      </div>
    </div>
  );
}

function CategoryGridBanner() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: '40px 0', background: '#f8f9fc' }}>
      <div className="container">
        <div className="row g-4">

          {/* Left — featured image */}
          <div className="col-lg-6 col-12">
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', minHeight: 380, background: '#1a1a2e' }}>
              <img
                src="/assets/images/carousel/floating-ark-charger-1-65W.png"
                alt="Featured Brand"
                style={{ width: '100%', height: '100%', minHeight: 380, objectFit: 'cover', display: 'block' }}
                onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&h=500&fit=crop'; }}
              />
              <div style={{ position: 'absolute', bottom: 28, left: 28, right: 28, color: '#fff', zIndex: 2 }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
                  Discover Great Brands.
                </h2>
                <p style={{ fontSize: 15, margin: '8px 0 16px', opacity: 0.9 }}>
                  Shop from your favorite brands
                </p>
                <button
                  style={{ padding: '10px 24px', backgroundColor: '#fff', color: '#0066c0', border: 'none', borderRadius: 25, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => navigate('/products')}
                >
                  Explore All →
                </button>
              </div>
            </div>
          </div>

          {/* Right — 2×2 brand cards */}
          <div className="col-lg-6 col-12">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', minHeight: 380 }}>
              {/* Row 1 */}
              <div style={{ display: 'flex', gap: 14, flex: 1 }}>
                {CATEGORIES_DATA.slice(0, 2).map(cat => (
                  <div key={cat.id} style={{ flex: 1 }}>
                    <CategoryCard category={cat} onClick={() => navigate(`/products?category=${encodeURIComponent(cat.title)}`)} />
                  </div>
                ))}
              </div>
              {/* Row 2 */}
              <div style={{ display: 'flex', gap: 14, flex: 1 }}>
                {CATEGORIES_DATA.slice(2, 4).map(cat => (
                  <div key={cat.id} style={{ flex: 1 }}>
                    <CategoryCard category={cat} onClick={() => navigate(`/products?category=${encodeURIComponent(cat.title)}`)} />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* View More — always right-aligned */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button
            onClick={() => navigate('/products')}
            style={{ padding: '8px 22px', border: '1px solid #ccc', borderRadius: 20, background: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            View More →
          </button>
        </div>
      </div>
    </section>
  );
}

export default CategoryGridBanner;
