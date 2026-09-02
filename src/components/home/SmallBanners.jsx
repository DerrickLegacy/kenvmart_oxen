import { Link } from 'react-router-dom';
import { heroSlides } from '../../data/homeData';

export default function SmallBanners() {
  const [slide1, slide2] = heroSlides;

  return (
    <div className="col-lg-4 col-12">
      <div className="row">
        {/* Product-image banner — first slide */}
        <div className="col-lg-12 col-md-6 col-12 md-custom-padding">
          <div
            className="hero-small-banner"
            style={{ backgroundImage: `url('${slide1.backgroundImage}')` }}
          >
            <div className="content">
              <h2>{slide1.heading}</h2>
              <h3>{slide1.price}</h3>
            </div>
          </div>
        </div>

        {/* Weekly sale promotional banner (style2) — second slide */}
        <div className="col-lg-12 col-md-6 col-12">
          <div className="hero-small-banner style2">
            <div className="content">
              <h2>{slide2.heading}</h2>
              <p>{slide2.subheading}</p>
              <div className="button">
                <Link className="btn" to={`/products/${slide2.prodId}`}>
                  Shop Now — {slide2.price}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
