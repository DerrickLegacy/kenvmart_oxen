import { useState } from 'react';

export default function ProductGallery({ images = [], productName = '' }) {
  const [current, setCurrent] = useState(0);
  const safeIndex = current < images.length ? current : 0;

  return (
    <div className="product-images">
      <main id="gallery">

        {/* ── Main image — fixed height, object-fit cover ── */}
        <div className="main-img gallery-main-wrap">
          <img
            data-testid="main-image"
            src={images[safeIndex]}
            id="current"
            alt={productName}
            className="gallery-main-img"
            onError={e => { e.currentTarget.src = '/assets/images/product-details/01.jpg'; }}
          />
        </div>

        {/* ── Thumbnail strip — uniform height ── */}
        {images.length > 1 && (
          <div className="images">
            {images.map((img, i) => (
              <div
                key={i}
                className={`gallery-thumb-wrap${i === safeIndex ? ' active' : ''}`}
                onClick={() => setCurrent(i)}
                role="button"
                tabIndex={0}
                aria-label={`View image ${i + 1}`}
                onKeyDown={e => e.key === 'Enter' && setCurrent(i)}
              >
                <img
                  data-testid={`thumbnail-${i}`}
                  src={img}
                  className="img"
                  alt={`${productName} view ${i + 1}`}
                  onError={e => { e.currentTarget.src = '/assets/images/product-details/01.jpg'; }}
                />
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
