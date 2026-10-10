import { Link } from "react-router-dom";

export default function PromotionalBanner() {
  return (
    <section className="promotional-banner-section">
      <div className="container">
        <div className="row g-3">
          {/* Large Banner */}
          <div className="col-lg-4">
            <div className="promo-banner-card promo-banner-large">
              <img
                src="/assets/images/banner/advertise1.webp"
                alt="Spring Valley products"
                className="promo-banner-bg-image"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="promo-banner-content">
                <Link to="/products" className="promo-link">
                  Shop now
                </Link>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="promo-banner-card promo-banner-large">
              <img
                src="/assets/images/banner/1313a05055b6aa99e38531634fa97ddc.webp"
                alt="Spring Valley products"
                className="promo-banner-bg-image"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="promo-banner-content">
                <Link to="/products" className="promo-link">
                  Shop now
                </Link>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="promo-banner-card promo-banner-large">
              <img
                src="/assets/images/banner/c9bc893397882a949e57d9f23fa5b208.webp"
                alt="Spring Valley products"
                className="promo-banner-bg-image"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="promo-banner-content">
                <Link to="/products" className="promo-link">
                  Shop now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
