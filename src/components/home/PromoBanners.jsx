import { Link } from 'react-router-dom';
import { promoBanners } from '../../data/homeData';

export default function PromoBanners() {
  return (
    <section className="banner">
      <div className="container">
        <div className="row">
          {promoBanners.map((banner, index) => (
            <div key={banner.id} className="col-lg-6 col-md-6 col-12">
              <div
                className={`single-banner${index > 0 ? ' custom-responsive-margin' : ''}`}
                style={{ backgroundImage: `url('${banner.backgroundImage}')` }}
              >
                <div className="content">
                  <h2>{banner.heading}</h2>
                  <p>
                    {banner.subtext.split('\n').map((line, i, arr) => (
                      <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                  <div className="button">
                    <Link to={banner.linkTo} className="btn">
                      {banner.linkLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
