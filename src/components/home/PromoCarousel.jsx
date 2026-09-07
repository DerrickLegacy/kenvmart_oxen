import { useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import CarouselImage from "../reusables/CarouselImage";
import { Link } from "react-router-dom";

function PromoCarousel() {
  const [index, setIndex] = useState(0);

  return (
    <section className="promo-carousel-section">
      <div className="container">
        <Carousel
          activeIndex={index}
          onSelect={setIndex}
          interval={5000}
          className="promo-carousel"
          prevIcon={<span className="promo-carousel-arrow promo-carousel-arrow--prev">&#8249;</span>}
          nextIcon={<span className="promo-carousel-arrow promo-carousel-arrow--next">&#8250;</span>}
        >

          {/* ── Slide 1 — Earphones ─────────────────────────────────── */}
          <Carousel.Item>
            <CarouselImage
              imageUrl="/assets/images/carousel/listen-to-music.png"
              altText="Enjoy Your Music"
            />
            <Carousel.Caption className="promo-caption promo-caption--center">
              <h2>Turn Up the Joy 🎧</h2>
              <p>Feel every beat with quality earphones made for everyday life.</p>
              <Link to="/products?category=audio" className="promo-cta-btn">
                Explore Audio
              </Link>
            </Carousel.Caption>
          </Carousel.Item>

          {/* ── Slide 2 — Charging Cables ───────────────────────────── */}
          <Carousel.Item>
            <CarouselImage
              imageUrl="/assets/images/carousel/C-toC.png"
              altText="Durable Charging Cables"
            />
            <Carousel.Caption className="promo-caption promo-caption--left">
              <h2>Built to Keep You<br />Connected ⚡</h2>
              <p>Charge faster. Stay connected longer.</p>
              <Link to="/products?category=charger" className="promo-cta-btn">
                Explore Charging
              </Link>
            </Carousel.Caption>
          </Carousel.Item>

          {/* ── Slide 3 — Premium Sound ─────────────────────────────── */}
          <Carousel.Item>
            <CarouselImage
              imageUrl="/assets/images/carousel/earphones-black-bg.jpg"
              altText="Premium Sound"
            />
            <Carousel.Caption className="promo-caption promo-caption--center">
              <h2>Experience Sound<br />Differently 🎧</h2>
              <p>From deep bass to crystal-clear audio.</p>
              <Link to="/products?category=earphones" className="promo-cta-btn">
                Explore Audio
              </Link>
            </Carousel.Caption>
          </Carousel.Item>

          {/* ── Slide 4 — Power Up (simple layout, no giant circles) ── */}
          <Carousel.Item>
            <div className="promo-power-slide">
              <div className="promo-power-content">
                <p className="promo-power-eyebrow">Featured</p>
                <h2 className="promo-power-heading">Power up your<br />everyday life</h2>
                <p className="promo-power-sub">
                  Chargers, power banks &amp; accessories designed to keep you connected.
                </p>
                <Link to="/products" className="promo-cta-btn promo-cta-btn--dark">
                  Shop Now
                </Link>
              </div>
              <div className="promo-power-chips">
                {[
                  { href: '/products?q=charger',    img: 'assets/images/carousel/floating-ark-charger-2-65W.png',  label: 'Chargers' },
                  { href: '/products?q=power+bank', img: 'assets/images/carousel/floating-ark-power-bank.png',    label: 'Power Banks' },
                  { href: '/products?q=headset',    img: 'assets/images/carousel/floating-ark-earbuds.png',       label: 'Headsets' },
                ].map(({ href, img, label }) => (
                  <Link key={label} to={href} className="promo-power-chip">
                    <img src={img} alt={label} />
                    <span>{label} ›</span>
                  </Link>
                ))}
              </div>
            </div>
          </Carousel.Item>

        </Carousel>
      </div>
    </section>
  );
}

export default PromoCarousel;
