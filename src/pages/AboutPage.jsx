import { Link } from 'react-router-dom';
import Breadcrumb from '../components/layout/Breadcrumb';
import { aboutWhyCards } from '../data/homeData';

export default function AboutPage() {
  return (
    <div data-testid="about-page">

      {/* Breadcrumb */}
      <Breadcrumb crumbs={[{ label: 'Home', to: '/' }, { label: 'About Us' }]} />

      {/* Hero Section */}
      <section className="about-hero section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-12">
              <h2 className="about-hero-heading">
                Kenvies Investments Ltd.
              </h2>
              <p className="about-hero-tagline">
                Your Home of Quality Accessories — premium phone accessories crafted for
                performance, durability, and modern lifestyle.
              </p>
            </div>
            <div className="col-lg-6 col-12">
              <img
                src="/assets/images/hero/slider-bg1.jpg"
                alt="Kenvies Investments Ltd. store"
                className="img-fluid"
                style={{ borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-12 text-center">
              <h3 style={{ marginBottom: '20px', fontWeight: 700 }}>Our Story</h3>
              <p style={{ color: '#555', lineHeight: '1.8', marginBottom: '16px' }}>
                Kenvies Investments Ltd. was founded with a clear mission: to give every
                smartphone user in Uganda access to high-quality, affordable phone accessories.
                From true wireless earbuds and fast chargers to power banks, screen protectors,
                and smartwatches, we stock only the best from trusted brands — Oraimo, Iaccess,
                Excellent, and Floating Ark.
              </p>
              <p style={{ color: '#555', lineHeight: '1.8' }}>
                Based at Kisa Kya Maria Building, Shop B115 William Street, Kampala, we have
                built a reputation for genuine products and outstanding customer service. We
                believe your phone deserves accessories that are reliable, durable, and built
                for real life. That commitment drives everything we do — from the products we
                stock to the way we handle every order and every customer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section">
        <div className="container">
          <div className="row justify-content-center" style={{ marginBottom: '40px' }}>
            <div className="col-12 text-center">
              <h3 style={{ fontWeight: 700 }}>Why Choose Us</h3>
            </div>
          </div>
          <div className="about-why-grid">
            {aboutWhyCards.map((card) => (
              <div key={card.title} className="about-why-card">
                <i className={`lni ${card.icon}`}></i>
                <h4>{card.title}</h4>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8 col-12">
              <h3>Ready to Shop?</h3>
              <p>Explore our full range of premium phone accessories.</p>
              <Link to="/products" className="btn">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
