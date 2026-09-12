import { Link } from "react-router-dom";

function PromoHeader() {
  return (
    <section>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="inner todays-deals-card-background-color promo-header-card my-3 p-3 p-md-4">
              {/* Desktop layout: text left, button right */}
              <div className="d-none d-md-flex row align-items-center g-0">
                <div className="col-8">
                  <h2 className="promo-heading-orange mb-2">Shopping orders made easy</h2>
                  <p className="promo-subtext mb-0">
                    Browse our full collection of premium accessories and find
                    the perfect piece for every occasion.
                  </p>
                </div>
                <div className="col-4 d-flex align-items-center justify-content-end">
                  <Link to="/products" className="btn btn-orange">
                    Start Now
                  </Link>
                </div>
              </div>

              {/* Mobile layout: stacked, premium look */}
              <div className="d-md-none">
                <div className="text-center mb-3">
                  <h5 className="promo-heading-orange mb-2" style={{ fontWeight: 700 }}>
                    Shopping orders made easy
                  </h5>
                  <p className="promo-subtext mb-0" style={{ fontSize: 13 }}>
                    Browse our full collection of premium accessories and find
                    the perfect piece for every occasion.
                  </p>
                </div>
                {/* Button full width below */}
                <div className="d-grid">
                  <Link to="/products" className="btn btn-orange">
                    Start Now
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

export default PromoHeader;
