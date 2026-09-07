/**
 * CarouselImage — consistent slide background image.
 * Does NOT render any text overlay — captions live only in Carousel.Caption.
 * Fixed height: 380px desktop, 240px mobile (set via CSS).
 */
function CarouselImage({ imageUrl, altText, text }) {
  return (
    <div className="promo-carousel-img-wrap">
      <img
        src={imageUrl || '/assets/images/placeholder.png'}
        alt={altText || text || 'Slide'}
        className="promo-carousel-img"
        onError={e => { e.currentTarget.src = '/assets/images/placeholder.png'; }}
      />
      {/* Subtle dark overlay for text legibility */}
      <div className="promo-carousel-overlay" />
    </div>
  );
}

export default CarouselImage;
