import { Link } from "react-router-dom";

export default function CallToAction() {
  return (
    <section className="call-action section">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 offset-lg-2 col-12">
            <div className="inner">
              <div className="content">
                <h2>Shop Premium Phone Accessories — Up to 30% Off</h2>
                <p>
                  Browse chargers, earbuds, screen protectors, power banks and more
                  from trusted brands.
                </p>
                <div className="button">
                  <Link to="/products" className="btn">
                    Shop Now
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
