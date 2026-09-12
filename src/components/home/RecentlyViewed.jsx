import { useRef } from 'react';
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

        <div className="position-relative">
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
        </div>
      </div>
      <hr />
    </section>
  );
}
