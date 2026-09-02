import { Link } from 'react-router-dom';
import NewsletterForm from './NewsletterForm';
import { siteConfig } from '../../../data/siteConfig';

export default function Footer() {
  return (
    <footer data-testid="footer" className="footer">
      {/* Start Footer Top */}
      <div className="footer-top">
        <div className="container">
          <div className="inner-content">
            <div className="row">
              <div className="col-lg-3 col-md-4 col-12">
                <div className="footer-logo">
                  <Link to="/">
                    <img src="/assets/images/logo/white-logo.svg" alt={siteConfig.name} />
                  </Link>
                </div>
              </div>
              <div className="col-lg-9 col-md-8 col-12">
                <div className="footer-newsletter">
                  <h4 className="title">
                    Subscribe to our Newsletter
                    <span>Get all the latest information, Sales and Offers.</span>
                  </h4>
                  <NewsletterForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Footer Top */}

      {/* Start Footer Middle */}
      <div className="footer-middle">
        <div className="container">
          <div className="bottom-inner">
            <div className="row">

              {/* Contact column */}
              <div className="col-lg-3 col-md-6 col-12">
                <div className="single-footer f-contact">
                  <h3>Get In Touch</h3>
                  <p className="phone">
                    Phone:{' '}
                    <a href={`tel:${siteConfig.phoneRaw}`} style={{ color: 'inherit' }}>
                      {siteConfig.phone}
                    </a>
                  </p>
                  <ul>
                    <li><span>Mon–Fri: </span> 9:00 am – 8:00 pm</li>
                    <li><span>Saturday: </span> 10:00 am – 6:00 pm</li>
                  </ul>
                  <p style={{ color: '#ccc', fontSize: '13px', marginTop: '8px' }}>
                    {siteConfig.address}
                  </p>
                  <p className="mail">
                    <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                  </p>
                </div>
              </div>

              {/* Spacer */}
              <div className="col-lg-3 col-md-6 col-12"></div>

              {/* Information column */}
              <div className="col-lg-3 col-md-6 col-12">
                <div className="single-footer f-link">
                  <h3>Information</h3>
                  <ul>
                    <li><Link to="/about">About Us</Link></li>
                    <li><Link to="/contact">Contact Us</Link></li>
                    <li><Link to="/faq">FAQs</Link></li>
                    <li><Link to="/wishlist">Wishlist</Link></li>
                    <li><Link to="/orders">Orders</Link></li>
                  </ul>
                </div>
              </div>

              {/* Shop Departments column */}
              <div className="col-lg-3 col-md-6 col-12">
                <div className="single-footer f-link">
                  <h3>Shop Departments</h3>
                  <ul>
                    <li><Link to="/products?category=Earphones+%26+Audio">Earphones &amp; Audio</Link></li>
                    <li><Link to="/products?category=Charging">Charging</Link></li>
                    <li><Link to="/products?category=Protection">Protection</Link></li>
                    <li><Link to="/products?category=Smart+Devices">Smart Devices</Link></li>
                    <li><Link to="/products?brand=Oraimo">Oraimo</Link></li>
                    <li><Link to="/products?brand=Iaccess">Iaccess</Link></li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      {/* End Footer Middle */}

      {/* Start Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="inner-content">
            <div className="row align-items-center">
              <div className="col-lg-6 col-12">
                <div style={{ color: '#fff' }}>
                  <p>{siteConfig.copyright}</p>
                </div>
              </div>
              <div className="col-lg-6 col-12">
                <ul className="socila">
                  <li>
                    <span>Follow Us On:</span>
                  </li>
                  <li>
                    <a href={siteConfig.social.facebook} aria-label="Facebook">
                      <i className="lni lni-facebook-filled"></i>
                    </a>
                  </li>
                  <li>
                    <a href={siteConfig.social.twitter} aria-label="Twitter">
                      <i className="lni lni-twitter-original"></i>
                    </a>
                  </li>
                  <li>
                    <a href={siteConfig.social.instagram} aria-label="Instagram">
                      <i className="lni lni-instagram"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Footer Bottom */}
    </footer>
  );
}
