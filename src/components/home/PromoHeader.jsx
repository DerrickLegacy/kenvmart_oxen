import { Link } from "react-router-dom";

function PromoHeader() {
  return (
    <section>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="inner todays-deals-card-background-color my-3 p-3">
              {/* Desktop layout: text left, button right */}
              <div className="d-none d-md-flex row align-items-center">
                <div className="col-8">
                  <h2>Shopping orders made easy</h2>
                  <p style={{ color: 'white', marginBottom: 0 }}>
                    Browse our full collection of premium accessories and find
                    the perfect piece for every occasion.
                  </p>
                </div>
                <div className="col-4 d-flex align-items-center justify-content-end">
                  <Link to="/products" className="btn button">
                    Start Now
                  </Link>
                </div>
              </div>

              {/* Mobile layout: 2-col grid, button spans full width below */}
              <div className="d-md-none">
                <div className="row g-2">
                  <div className="col-6">
                    <h5 style={{ color: 'white', fontWeight: 700, marginBottom: 4 }}>
                      Shopping orders made easy
                    </h5>
                  </div>
                  <div className="col-6">
                    <p style={{ color: 'white', fontSize: 13, marginBottom: 0 }}>
                      Browse our full collection of premium accessories and find
                      the perfect piece for every occasion.
                    </p>
                  </div>
                </div>
                {/* Button always in its own row below */}
                <div className="row mt-3">
                  <div className="col-12">
                    <Link to="/products" className="btn button w-100 text-center">
                      Start Now
                    </Link>
                  </div>
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
