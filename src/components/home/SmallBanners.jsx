import { Link } from 'react-router-dom';
import { heroSlides } from '../../data/homeData';

export default function SmallBanners() {
  const [slide1, slide2] = heroSlides;

  const heroSlides2 = [

  {
    id: "slide-2",
    backgroundImage: "/assets/images/carousel/1b66912783f9e5f4eb26dd46edc03ace.webp",
    heading: "4-Socket Extension Cable",
    subheading: "Equipped with 4 UK AC outlets and 4 USB charging ports (including 20W USB-C Power Delivery), it safely powers up to 8 devices simultaneously. B",
    prodId: "prod-002",
    price: "UGX 60,000",
    textColor:"#E18F27"
  }]

  return (
    <div className="col-lg-4 col-12 small-banners-wrapper">
      <div className="row g-3 g-lg-3">
        {/* Product-image banner — first slide */}
        <div className="col-lg-12 col-md-6 col-12">
          <div
            className="hero-small-banner"
            style={{ backgroundImage: `url('${heroSlides2[0].backgroundImage}')` }}
          >
          </div>
        </div>

        {/* Weekly sale promotional banner (style2) — second slide */}
        <div className="col-lg-12 col-md-6 col-12">
          <div className="hero-small-banner style2">
            <div className="content">
              <h2>{heroSlides2[0].heading}</h2>
              <p>{heroSlides2[0].subheading}</p>
              <div className="button">
                <Link className="btn btn-orange" to={`/product/${slide2.prodId}`}>
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
