import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const AUTOPLAY_DELAY = 5000;
const TRANSITION_MS  = 600;

export default function HeroSlider({ slides = [] }) {
  const [current, setCurrent]   = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((index) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrent(index);
    setTimeout(() => setTransitioning(false), TRANSITION_MS);
  }, [transitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, slides.length, goTo]);

  /* ── Auto-play ── */
  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length);
    }, AUTOPLAY_DELAY);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [slides.length, resetTimer]);

  if (!slides.length) return null;

  return (
    <div className="hero-slider-react" aria-label="Hero slider" role="region">
      {/* Slides */}
      <div className="hero-slider-track">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`single-slider${i === current ? ' active' : ''}`}
            style={{ backgroundImage: `url(${slide.backgroundImage})` }}
            aria-hidden={i !== current}
          >
            <div className="content">
              <h2>{slide.heading}</h2>
              <p>{slide.subheading}</p>
              <h3><span>Now Only</span> {slide.price}</h3>
              <div className="button">
                <Link to="/products" className="btn">Shop Now</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      {slides.length > 1 && (
        <>
          <button
            className="hero-slider-arrow hero-slider-prev"
            onClick={() => { prev(); resetTimer(); }}
            aria-label="Previous slide"
          >
            <i className="lni lni-chevron-left"></i>
          </button>
          <button
            className="hero-slider-arrow hero-slider-next"
            onClick={() => { next(); resetTimer(); }}
            aria-label="Next slide"
          >
            <i className="lni lni-chevron-right"></i>
          </button>
        </>
      )}

      {/* Dot navigation */}
      {slides.length > 1 && (
        <div className="hero-slider-dots" role="tablist">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
              className={`hero-slider-dot${i === current ? ' active' : ''}`}
              onClick={() => { goTo(i); resetTimer(); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
