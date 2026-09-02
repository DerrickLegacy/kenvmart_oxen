// CategoryDeals.jsx - Accessories website with 4 cards (4 images per card)
// Each image has its own bottom header label - Accessories themed
// Gray borders, clickable images, smaller cards, horizontal scroll on mobile

import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryDeals = () => {
  const navigate = useNavigate();

  // 4 cards data - each with 4 accessories images and labels
  const cards = [
    {
      id: 1,
      title: "Power & Charge",
      images: [
        { src: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=400&fit=crop&crop=center", label: "Chargers", link: "/products/chargers" },
        { src: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400&h=400&fit=crop&crop=center", label: "Batteries", link: "/products/batteries" },
        { src: "https://images.unsplash.com/photo-1609599006353-e629aa8fe3c0?w=400&h=400&fit=crop&crop=center", label: "Powerbanks", link: "/products/powerbanks" },
        { src: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400&h=400&fit=crop&crop=center", label: "USB Cables", link: "/products/usb-cables" }
      ]
    },
    {
      id: 2,
      title: "Audio & Sound",
      images: [
        { src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center", label: "Wireless Speakers", link: "/products/wireless-speakers" },
        { src: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop&crop=center", label: "Earphones", link: "/products/earphones" },
        { src: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop&crop=center", label: "Earpods", link: "/products/earpods" },
        { src: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center", label: "Headsets", link: "/products/headsets" }
      ]
    },
    {
      id: 3,
      title: "Wearables & More",
      images: [
        { src: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop&crop=center", label: "Smart Watches", link: "/products/smart-watches" },
        { src: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop&crop=center", label: "Earbuds", link: "/products/earbuds" },
        { src: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop&crop=center", label: "Neck Band", link: "/products/neck-band" },
        { src: "https://images.unsplash.com/photo-1558618666-fcd25c85f8b6?w=400&h=400&fit=crop&crop=center", label: "Flash Disks", link: "/products/flash-disks" }
      ]
    },
    {
      id: 4,
      title: "Connectivity & Car",
      images: [
        { src: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop&crop=center", label: "Extension Cables", link: "/products/extension-cables" },
        { src: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&h=400&fit=crop&crop=center", label: "Car MP3", link: "/products/car-mp3" },
        { src: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop&crop=center", label: "USB Cables", link: "/products/usb-cables" },
        { src: "https://images.unsplash.com/photo-1591079819507-1d10e0ca5b7b?w=400&h=400&fit=crop&crop=center", label: "Car Accessories", link: "/products/car-accessories" }
      ]
    }
  ];

  return (
    <section className="categosry-deals">
      <div className="container">
        {/* Section Header */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Accessories Store</h2>
          <span style={styles.sectionSub}>Top picks for you</span>
        </div>

        {/* ====== 4 CARDS ROW - scrollable on mobile ====== */}
        <div className="cards-scroll-wrapper">
          <div className="cards-row">
            {cards.map((card) => (
              <div key={card.id} className="card-col">
                <div className="card-4img" style={styles.card}>
                  {/* Card Title */}
                  <div style={styles.cardHeader}>{card.title}</div>
                  {/* 2x2 Image Grid with labels */}
                  <div className="img-grid-4" style={styles.imageGrid}>
                    {card.images.map((img, idx) => (
                      <a 
                        key={idx} 
                        href={img.link} 
                        style={styles.gridItemLink}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(img.link);
                        }}
                      >
                        <div style={styles.gridItem}>
                          <img 
                            src={img.src} 
                            alt={img.label} 
                            style={styles.gridImage} 
                          />
                          <div style={styles.imageLabel}>{img.label}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====== STYLES ====== */}
      <style>{`
        .category-deals {
          padding: 16px 0 30px;
          background: #f8f9fc;
          font-family: 'Inter', 'Arial', sans-serif;
        }
        .category-deals .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 16px;
        }

        /* ===== SCROLLABLE CARDS ON MOBILE ===== */
        .cards-scroll-wrapper {
          overflow-x: auto;
          overflow-y: visible;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #c1c7d0 #f0f2f6;
          padding: 4px 0 12px 0;
          margin: 0 -8px;
        }
        .cards-scroll-wrapper::-webkit-scrollbar {
          height: 6px;
        }
        .cards-scroll-wrapper::-webkit-scrollbar-track {
          background: #f0f2f6;
          border-radius: 10px;
        }
        .cards-scroll-wrapper::-webkit-scrollbar-thumb {
          background: #c1c7d0;
          border-radius: 10px;
        }

        .cards-row {
          display: flex;
          gap: 12px;
          padding: 0 8px;
          min-width: max-content;
        }

        .card-col {
          flex: 0 0 auto;
          width: 180px;
        }

        /* ===== CARD STYLES ===== */
        .card-4img {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border-radius: 12px;
          background: white;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          height: 100%;
          border: 2px solid #9aa2b0;
        }
        .card-4img:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
          border-color: #7a8290;
        }

        .img-grid-4 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          aspect-ratio: 1 / 1;
          gap: 2px;
          background: #f2f4f8;
          padding: 2px;
        }
        .img-grid-4 .grid-item {
          position: relative;
          overflow: hidden;
          border-radius: 4px;
          background: #eaeef3;
          width: 100%;
          height: 100%;
        }
        .img-grid-4 .grid-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          cursor: pointer;
        }
        .img-grid-4 .grid-item .image-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
          color: #fff;
          font-size: 0.55rem;
          font-weight: 600;
          padding: 8px 4px 4px;
          text-align: center;
          letter-spacing: 0.02em;
          text-shadow: 0 1px 4px rgba(0,0,0,0.3);
          pointer-events: none;
        }
        .card-4img .card-header {
          padding: 6px 8px 4px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #0b1a33;
          letter-spacing: -0.01em;
          border-bottom: 1px solid #e2e6ed;
          background: #fafbfc;
        }

        /* ===== RESPONSIVE: cards get smaller and scrollable ===== */
        @media (min-width: 769px) {
          .cards-scroll-wrapper {
            overflow-x: visible;
            margin: 0;
            padding: 0;
          }
          .cards-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            min-width: unset;
            padding: 0;
          }
          .card-col {
            width: 100%;
            flex: 1;
          }
          .card-col {
            width: 100%;
            flex: 1;
          }
          .img-grid-4 .grid-item .image-label {
            font-size: 0.6rem;
            padding: 10px 6px 5px;
          }
          .card-4img .card-header {
            font-size: 0.75rem;
            padding: 8px 10px 5px;
          }
        }

        @media (max-width: 768px) {
          .card-col {
            width: 160px;
          }
          .img-grid-4 .grid-item .image-label {
            font-size: 0.5rem;
            padding: 6px 4px 3px;
          }
          .card-4img .card-header {
            font-size: 0.65rem;
            padding: 5px 6px 3px;
          }
        }

        @media (max-width: 576px) {
          .card-col {
            width: 140px;
          }
          .img-grid-4 .grid-item .image-label {
            font-size: 0.45rem;
            padding: 5px 3px 2px;
          }
          .card-4img .card-header {
            font-size: 0.6rem;
            padding: 4px 5px 3px;
          }
          .card-4img {
            border-width: 2px;
            border-radius: 10px;
          }
          .img-grid-4 {
            gap: 2px;
            padding: 2px;
          }
        }
      `}</style>
    </section>
  );
};

// ============================================
// STYLES (React inline)
// ============================================
const styles = {
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '4px',
    borderBottom: '2px solid #e2e6ed',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#0b1a33',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  sectionSub: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: 500,
  },
  card: {
    borderRadius: '5px',
    overflow: 'hidden',
    background: '#fff',
    height: '100%',
    border: '1px solid #9aa2b0',
    padding:'1px'
  },
  cardHeader: {
    padding: '6px 8px 4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#0b1a33',
    letterSpacing: '-0.01em',
    borderBottom: '1px solid #e2e6ed',
    background: '#fafbfc',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    aspectRatio: '1 / 1',
    gap: '2px',
    background: '#f2f4f8',
    padding: '2px',
  },
  gridItemLink: {
    display: 'block',
    textDecoration: 'none',
    width: '100%',
    height: '100%',
  },
  gridItem: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '4px',
    background: '#eaeef3',
    width: '100%',
    height: '100%',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    cursor: 'pointer',
  },
  imageLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    color: '#fff',
    fontSize: '0.55rem',
    fontWeight: 600,
    padding: '8px 4px 4px',
    textAlign: 'center',
    letterSpacing: '0.02em',
    textShadow: '0 1px 4px rgba(0,0,0,0.3)',
    pointerEvents: 'none',
  },
};

export default CategoryDeals;