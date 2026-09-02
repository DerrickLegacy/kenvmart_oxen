import { Link } from "react-router-dom";
function PromoHeader() {
  return (
    <section>
      <div className="container">
        <div className="row">
          <div className="col-12 ">
            <div className="inner todays-deals-card-background-color my-3 p-3">
              <div className="row">
                <div className="col-6">
                  <h2 >Shopping orders made easy</h2>
                  <p style={{color:'white'}}>
                    Browse our full collection of premium accessories and find
                    the perfect piece for every occasion.
                  </p>
                </div>
                <div className="col-6 d-flex align-items-center justify-content-end">
                  <div className="button">
                    <Link to="/products" className="btn button">
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
