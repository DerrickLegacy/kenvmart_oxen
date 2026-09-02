import React, { useState } from 'react';
import HeroSlider from './HeroSlider';
import { heroSlides } from '../../data/homeData';
import SmallBanners from './SmallBanners';


function Hero() {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  return (
    <section className="hero-area">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 col-12 custom-padding-right">
            <div className="slider-head">
              {/* Added activeIndex and onSelect props */}
              <HeroSlider 
                slides={heroSlides} 
                activeIndex={index} 
                onSelect={handleSelect} 
              />
            </div>
          </div>
          <SmallBanners />
        </div>
        <hr />
      </div>
    </section>
  );
}

export default Hero;
