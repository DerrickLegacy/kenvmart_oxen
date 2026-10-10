import { Link } from 'react-router-dom';

export default function PromotionalBanner() {
  return (
    <section className="promotional-banner-section">
      <div className="container">
        <div className="row g-4">
          {/* Large Banner */}
          <div className="col-lg-6">
            <div className="promo-banner-card promo-banner-large">
              <div className="promo-banner-content">
                <h3>Feel better from the inside out</h3>
                <h2>Add Spring Valley to your routine</h2>
                <Link to="/products" className="promo-banner-btn">
                  Shop now
                </Link>
              </div>
              <div className="promo-banner-image">
                <img 
                  src="/assets/images/banners/promo-1.jpg" 
                  alt="Spring Valley products" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Small Banners Grid */}
          <div className="col-lg-6">
            <div className="row g-4">
              <div className="col-6">
                <div className="promo-banner-card promo-banner-small promo-banner-pink">
                  <h4>Men's wellness goals, simplified</h4>
                  <Link to="/products?category=Batteries" className="promo-link">
                    Shop now
                  </Link>
                </div>
              </div>
              <div className="col-6">
                <div className="promo-banner-card promo-banner-small promo-banner-blue">
                  <h4>Women's supplements for any life stage</h4>
                  <Link to="/products?category=Watches" className="promo-link">
                    Shop now
                  </Link>
                </div>
              </div>
              <div className="col-6">
                <div className="promo-banner-card promo-banner-small promo-banner-purple">
                  <h4>Kids' gummies & more</h4>
                  <Link to="/products?category=Sound" className="promo-link">
                    Shop now
                  </Link>
                </div>
              </div>
              <div className="col-6">
                <div className="promo-banner-card promo-banner-small promo-banner-indigo">
                  <h4>Better sleep starts here</h4>
                  <Link to="/products?category=Chargers" className="promo-link">
                    Shop now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
