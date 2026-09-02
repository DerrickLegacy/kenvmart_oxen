// CategoryGridBanner.jsx - Fixed dim images and zoom issues
import { useNavigate } from "react-router-dom";

function CategoryGridBanner() {
  const navigate = useNavigate();
  
  const CATEGORIES_DATA = [
    {
      id: 1,
      title: "iAccess",
      image: "/assets/images/categories/iaccess.jpeg",
      bgColor: "#2d1b3d",
    },
    { 
      id: 2, 
      title: "Oraimo", 
      image: "/assets/images/categories/oraimo.png",
      bgColor: "#45d22cff",
    },
    {
      id: 3,
      title: "Excellent",
      image: "/assets/images/categories/execellent.png",
      bgColor: "#8b4513",
    },
    {
      id: 4,
      title: "Floating Ark",
      image: "/assets/images/categories/floating-ark.png",
      bgColor: "#0056b3",
    },
  ];

  // Fallback images for each category if the original fails to load
  const fallbackImages = {
    "iAccess": "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=300&h=300&fit=crop&crop=center",
    "Oraimo": "https://images.unsplash.com/photo-1609599006353-e629aa8fe3c0?w=300&h=300&fit=crop&crop=center",
    "Excellent": "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=300&h=300&fit=crop&crop=center",
    "Floating Ark": "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=300&h=300&fit=crop&crop=center"
  };

  return (
    <section className="category-grid-banner">
      <div className="container">
        <div className="row g-4">
          
          {/* ====== COLUMN 1 - Full Image ====== */}
          <div className="col-lg-6 col-md-12">
            <div style={styles.imageColumn}>
              <div style={styles.imageContainer}>
                <img 
                  src="/assets/images/carousel/floating-ark-charger-1-65W.png" 
                  alt="Featured Brand"
                  style={styles.featuredImage}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&h=500&fit=crop&crop=center';
                  }}
                />
                <div style={styles.imageOverlay}>
                  <h2 style={styles.imageTitle}>Discover Great Brands.</h2>
                  <p style={styles.imageSubtitle}>Shop from your favorite brands</p>
                  <button 
                    style={styles.imageButton}
                    onClick={() => navigate('/products')}
                  >
                    Explore All →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ====== COLUMN 2 - 4 Category Cards (2 up, 2 down) ====== */}
          <div className="col-lg-6 col-md-12">
            <div style={styles.cardsGrid}>
              {/* Row 1 - Cards 1 & 2 */}
              <div style={styles.cardsRow}>
                {CATEGORIES_DATA.slice(0, 2).map((category) => (
                  <div key={category.id} style={styles.cardWrapper}>
                    <div 
                      style={{
                        ...styles.categoryCard,
                        backgroundColor: category.bgColor,
                      }}
                      onClick={() => navigate(`/products?category=${encodeURIComponent(category.title)}`)}
                    >
                      <img 
                        src={category.image} 
                        alt={category.title}
                        style={styles.cardImage}
                        onError={(e) => {
                          e.currentTarget.src = fallbackImages[category.title] || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=300&h=300&fit=crop&crop=center';
                        }}
                      />
                      <div style={styles.cardContent}>
                        <h3 style={styles.cardTitle}>{category.title}</h3>
                        <span style={styles.cardLink}>Shop Now →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 2 - Cards 3 & 4 */}
              <div style={styles.cardsRow}>
                {CATEGORIES_DATA.slice(2, 4).map((category) => (
                  <div key={category.id} style={styles.cardWrapper}>
                    <div 
                      style={{
                        ...styles.categoryCard,
                        backgroundColor: category.bgColor,
                      }}
                      onClick={() => navigate(`/products?category=${encodeURIComponent(category.title)}`)}
                    >
                      <img 
                        src={category.image} 
                        alt={category.title}
                        style={styles.cardImage}
                        onError={(e) => {
                          e.currentTarget.src = fallbackImages[category.title] || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=300&h=300&fit=crop&crop=center';
                        }}
                      />
                      <div style={styles.cardContent}>
                        <h3 style={styles.cardTitle}>{category.title}</h3>
                        <span style={styles.cardLink}>Shop Now →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        .category-grid-banner {
          padding: 40px 0;
          background: #f8f9fc;
        }

        .category-grid-banner .category-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .category-grid-banner .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .category-grid-banner .category-card:hover .card-link {
          background: rgba(255,255,255,0.35);
        }

        @media (max-width: 992px) {
          .category-grid-banner .col-lg-6 {
            margin-bottom: 20px;
          }
        }

        @media (max-width: 576px) {
          .category-grid-banner .category-card {
            min-height: 120px !important;
          }
          .category-grid-banner .category-card .card-title {
            font-size: 16px !important;
          }
        }
      `}</style>
      
    </section>
  );
}

// All styles - UPDATED with better image visibility
const styles = {
  // Column 1 - Image
  imageColumn: {
    height: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '420px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    minHeight: '420px',
    objectFit: 'cover',
    display: 'block',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: '30px',
    left: '30px',
    right: '30px',
    color: '#fff',
    zIndex: 2,
  },
  imageTitle: {
    fontSize: '32px',
    fontWeight: 700,
    margin: 0,
    color: 'white',
    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  imageSubtitle: {
    fontSize: '16px',
    margin: '8px 0 16px',
    opacity: 0.9,
    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  imageButton: {
    padding: '10px 24px',
    backgroundColor: '#fff',
    color: '#0066c0',
    border: 'none',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  
  // Column 2 - Cards Grid - IMPROVED
  cardsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    height: '100%',
    minHeight: '420px',
  },
  cardsRow: {
    display: 'flex',
    gap: '15px',
    flex: '1',
  },
  cardWrapper: {
    flex: '0 0 calc(50% - 7.5px)',
    maxWidth: 'calc(50% - 7.5px)',
  },
  categoryCard: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    color: '#fff',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    height: '100%',
    minHeight: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '20px',
  },
  cardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.5, // Reduced from 0.3 to make image more visible
    zIndex: 0,
  },
  cardContent: {
    position: 'relative',
    zIndex: 1,
    textShadow: '0 2px 8px rgba(0,0,0,0.4)',
  },
  cardTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
    color: '#fff',
  },
  cardLink: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '6px 18px',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'background 0.3s ease',
    color: '#fff',
  },
};

export default CategoryGridBanner;