import { useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import CarouselImage from "../reusables/CarouselImage";
import { Link } from "react-router-dom";

function PromoCarousel() {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  return (
    <section>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div
              className="inner my-3 promo-card-background-color"
              style={{ borderRadius: "10px" }}
            >
              <Carousel
                activeIndex={index}
                onSelect={handleSelect}
                interval={5000}
                style={{ borderRadius: "10px" }}
              >
                {/* SLIDE 1 */}
                <Carousel.Item>
                  <CarouselImage
                    text="Enjoy Your Music"
                    imageUrl="/assets/images/carousel/listen-to-music.png"
                  />

                  <Carousel.Caption className="custom-carousel-caption">
                    <h3>Turn Up the Joy 🎧</h3>
                    <p>
                      Feel every beat with quality earphones and headsets made
                      for your everyday listening experience.
                    </p>

                    <Link
                      to="/products?category=audio"
                      className="btn btn-primary"
                    >
                      Explore Audio
                    </Link>
                  </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                  <CarouselImage
                    text="Durable Charging Cables"
                    imageUrl="/assets/images/carousel/C-toC.png"
                    textAlign="left"
                  />

                  <Carousel.Caption className="carousel-caption-left">
                    <div className="text-left">
                      <h3 style={{ color: "#9be7eb" }}>
                        Built to Keep You Connected ⚡
                      </h3>

                      <p>
                        Charge faster. Stay connected longer. Discover durable
                        cables designed for everyday life.
                      </p>

                      <Link
                        to="/products?category=charger"
                        className="btn btn-primary"
                      >
                        Explore Charging
                      </Link>
                    </div>
                  </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                  <CarouselImage
                    text="Premium Sound"
                    imageUrl="/assets/images/carousel/earphones-black-bg.jpg"
                  />

                  <Carousel.Caption
                    className="carousel-caption-left"
                    style={{ color: "#fff" }}
                  >
                    <h3 style={{ color: "#9be7eb" }}>
                      Experience Sound Differently 🎧
                    </h3>

                    <p>
                      From deep bass to crystal-clear audio, find the perfect
                      sound for every moment.
                    </p>

                    <Link
                      to="/products?category=earphones"
                      className="btn btn-primary"
                    >
                      Explore Audio
                    </Link>
                  </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                  <div className="custom-promo-slide">
                    {/* LEFT CONTENT */}
                    <div className="promo-slide-content">
                      <h1>
                        Power up your
                        <br />
                        everyday life
                      </h1>

                      <p>
                        Discover chargers, power banks and accessories designed
                        to keep you connected.
                      </p>

                      <Link to="/products" className="promo-shop-button">
                        Shop now
                      </Link>
                    </div>

                    <div className="promo-slide-categories">
                      <Link to="/products?q=charger" className="promo-category">
                        <div className="promo-category-image">
                          <img
                            src="assets/images/carousel/floating-ark-charger-2-65W.png"
                            alt="Chargers"
                            style={{
                              height: "180px",
                              width: "180px",
                              borderRadius: "50%",
                              hover: { transform: "scale(1.05)" },
                            }}
                          />
                        </div>

                        <h3
                          className="promo-category-title"
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            textDecoration: "underline",
                          }}
                        >
                          Chargers
                          <span>›</span>
                        </h3>
                      </Link>

                      <Link
                        to="/products?q=power bank"
                        className="promo-category"
                      >
                        <div className="promo-category-image">
                          <img
                            src="assets/images/carousel/floating-ark-power-bank.png"
                            alt="Power Banks"
                            style={{
                              height: "180px",
                              width: "180px",
                              borderRadius: "50%",
                              hover: { transform: "scale(1.05)" },
                            }}
                          />
                        </div>

                        <h3
                          className="promo-category-title"
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            textDecoration: "underline",
                          }}
                        >
                          Power Banks
                          <span>›</span>
                        </h3>
                      </Link>

                      <Link to="/products?q=headset" className="promo-category">
                        <div className="promo-category-image">
                          <img
                            src="assets/images/carousel/floating-ark-earbuds.png"
                            alt="Headsets"
                            style={{
                              height: "180px",
                              width: "180px",
                              borderRadius: "50%",
                              hover: { transform: "scale(1.05)" },
                            }}
                          />
                        </div>

                        <h3
                          className="promo-category-title"
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            textDecoration: "underline",
                          }}
                        >
                          Headsets
                          <span>›</span>
                        </h3>
                      </Link>
                    </div>
                  </div>
                </Carousel.Item>
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PromoCarousel;
