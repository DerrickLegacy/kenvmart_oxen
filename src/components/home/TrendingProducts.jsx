import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from "../product/ProductCard";

const VIEW_MORE_STYLES = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 16px',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#0b1a33',
    background: '#fff',
    border: '1.5px solid #dce0e6',
    borderRadius: '999px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
};

/**
 * TrendingProducts section
 * Renders a grid of product cards for the home page trending section.
 *
 * @param {object} props
 * @param {Array}  props.products - Array of product objects to display
 * @param {boolean} props.loading - Whether data is still loading
 */
export default function TrendingProducts({ products = [], loading = false }) {
  if (!loading && products.length === 0) return null;

  return (
    <section className="trending-products">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div style={VIEW_MORE_STYLES.wrapper}>
              <div className="section-title-categories" style={{ marginBottom: 0 }}>
                <h2>Trending Products.</h2>
              </div>
              <Link to="/products?tag=trending" style={VIEW_MORE_STYLES.button}>
                View More <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="row">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="col-xl-2 col-lg-2 col-md-2 col-6">
                <div className="product-skeleton" aria-hidden="true" />
              </div>
            ))}
          </div>
        ) : (
          <div className="row">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                className="col-xl-2 col-lg-2 col-md-2 col-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
        <hr />
      </div>
    </section>
  );
}
