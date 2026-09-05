import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../product/ProductCard';
import { productCardVariants, VIEW_MORE_STYLES } from '../../utils/motion';

export default function NewArrivals({ products = [], loading = false }) {
  if (!loading && products.length === 0) return null;

  return (
    <section className="trending-products">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div style={VIEW_MORE_STYLES.wrapper}>
              <div className="section-title-categories" style={{ marginBottom: 0 }}>
                <h2>New Arrivals.</h2>
              </div>
              <Link to="/products?tag=new" style={VIEW_MORE_STYLES.button}>
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
                custom={i}
                variants={productCardVariants}
                initial="hidden"
                animate="visible"
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
