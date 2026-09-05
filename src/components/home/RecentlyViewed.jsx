import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../product/ProductCard';

const STORAGE_KEY = 'kenvies_recently_viewed';
const MAX_ITEMS = 8;

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function RecentlyViewed() {
  const products = getRecentlyViewed();
  const scrollRef = useRef(null);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 5);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [products.length]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === 'left' ? -(el.clientWidth * 0.8) : el.clientWidth * 0.8,
      behavior: 'smooth'
    });
  };

  if (!products.length) return null;

  return (
    <section className="trending-products" style={{ paddingTop: '1.5rem' }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section-title-categories">
              <h2>Recently Viewed.</h2>
            </div>
          </div>
        </div>

        {/* Carousel wrapper with relative positioning */}
        <div className="position-relative" style={{ padding: '0 40px' }}>
          {/* Left Arrow */}
          {showLeft && (
            <button
              className="rv-arrow rv-arrow-left"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              style={{
                position: 'absolute',
                left: '0',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s'
              }}
            >
              ‹
            </button>
          )}

          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="d-flex overflow-auto"
            style={{
              gap: '1rem',
              padding: '0.5rem 0',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              overflowX: 'auto',
              scrollBehavior: 'smooth'
            }}
          >
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                className="col-xl-2 col-lg-2 col-md-2 col-6 flex-shrink-0"
                custom={i}
                initial={{ opacity: 0, transform: 'translateY(12px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                transition={{
                  delay: Math.min(i, 5) * 0.04,
                  duration: 0.25,
                  ease: [0.23, 1, 0.32, 1],
                }}
                style={{ minWidth: '150px' }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {/* Right Arrow */}
          {showRight && (
            <button
              className="rv-arrow rv-arrow-right"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              style={{
                position: 'absolute',
                right: '0',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s'
              }}
            >
              ›
            </button>
          )}
        </div>
      </div>
      <hr />
    </section>
  );
}