import { useState, useRef, useCallback, useEffect } from 'react';

const ZOOM_FACTOR = 3;      // magnification level
const LENS_SIZE   = 130;    // px — diameter of the circular lens on the image
const PREVIEW_SIZE = 340;   // px — size of the zoomed preview box

/**
 * ProductGallery — main image + thumbnails + hover zoom lens.
 *
 * How it works:
 * - A circular lens follows the cursor on the main image showing a 3× crop.
 * - A large preview panel appears FIXED to the viewport (right side on desktop,
 *   never cut off) showing the same zoomed region.
 * - Both track cursor position in real-time so the user always sees exactly
 *   the part they are pointing at, even when hovering the bottom of the image.
 * - On touch / small screens the zoom is hidden entirely.
 */
export default function ProductGallery({ images = [], productName = '' }) {
  const [current, setCurrent]       = useState(0);
  const [zoom, setZoom]             = useState(false);
  const [lensPos, setLensPos]       = useState({ x: 0, y: 0 });
  const [previewPos, setPreviewPos] = useState({ top: 0, left: 0 });
  const [bgPos, setBgPos]           = useState('50% 50%');
  const imgRef                      = useRef(null);

  const safeIndex  = current < images.length ? current : 0;
  const currentSrc = images[safeIndex] || '/assets/images/placeholder.jpg';

  // ── Mouse tracking ─────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const img = imgRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();

    // Position of cursor inside the image
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Clamp lens centre so it never overflows the image
    const half = LENS_SIZE / 2;
    const cx   = Math.max(half, Math.min(x, rect.width  - half));
    const cy   = Math.max(half, Math.min(y, rect.height - half));

    setLensPos({ x: cx, y: cy });

    // background-position for zoomed preview (0–100% tracks cursor across image)
    const xPct = ((cx / rect.width)  * 100).toFixed(2);
    const yPct = ((cy / rect.height) * 100).toFixed(2);
    setBgPos(`${xPct}% ${yPct}%`);

    // Position the fixed preview box next to the cursor, keeping it in viewport
    const previewLeft = rect.right + 16;                     // default: right of image
    const previewTop  = e.clientY - PREVIEW_SIZE / 2;        // vertically centered on cursor

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // If not enough room on the right, show it on the left
    const fitsRight = previewLeft + PREVIEW_SIZE < vw - 8;
    const finalLeft = fitsRight
      ? previewLeft
      : rect.left - PREVIEW_SIZE - 16;

    // Clamp vertically so it never goes off-screen
    const finalTop = Math.max(8, Math.min(previewTop, vh - PREVIEW_SIZE - 8));

    setPreviewPos({ top: finalTop, left: finalLeft });
  }, []);

  const handleMouseEnter = () => setZoom(true);
  const handleMouseLeave = () => setZoom(false);

  // Hide zoom if user scrolls (avoids stale position)
  useEffect(() => {
    const hide = () => setZoom(false);
    window.addEventListener('scroll', hide, { passive: true });
    return () => window.removeEventListener('scroll', hide);
  }, []);

  return (
    <div className="product-images">
      <main id="gallery" style={{ position: 'relative' }}>

        {/* ── Main image with lens overlay ─────────────────────────── */}
        <div
          className="main-img gallery-main-wrap"
          style={{ position: 'relative', cursor: zoom ? 'crosshair' : 'default' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          <img
            ref={imgRef}
            data-testid="main-image"
            src={currentSrc}
            id="current"
            alt={productName}
            className="gallery-main-img"
            draggable={false}
            style={{ display: 'block', width: '100%', userSelect: 'none' }}
            onError={e => { e.currentTarget.src = '/assets/images/placeholder.jpg'; }}
          />

          {/* Circular magnifying lens that follows cursor */}
          {zoom && (
            <div
              aria-hidden="true"
              className="gallery-zoom-lens"
              style={{
                position:           'absolute',
                left:               lensPos.x - LENS_SIZE / 2,
                top:                lensPos.y - LENS_SIZE / 2,
                width:              LENS_SIZE,
                height:             LENS_SIZE,
                borderRadius:       '50%',
                border:             '2.5px solid rgba(255,255,255,0.9)',
                boxShadow:          '0 2px 16px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(0,0,0,0.1)',
                backgroundImage:    `url(${currentSrc})`,
                backgroundSize:     `${ZOOM_FACTOR * 100}%`,
                backgroundPosition: bgPos,
                backgroundRepeat:   'no-repeat',
                pointerEvents:      'none',
                zIndex:             10,
                // Slight brightness boost so zoomed area pops
                filter:             'brightness(1.05) contrast(1.02)',
              }}
            />
          )}

          {/* Semi-transparent vignette ring around lens for focus */}
          {zoom && (
            <div
              aria-hidden="true"
              style={{
                position:      'absolute',
                left:          lensPos.x - LENS_SIZE / 2 - 4,
                top:           lensPos.y - LENS_SIZE / 2 - 4,
                width:         LENS_SIZE + 8,
                height:        LENS_SIZE + 8,
                borderRadius:  '50%',
                border:        '3px solid rgba(59, 177, 243, 0.6)',
                pointerEvents: 'none',
                zIndex:        9,
              }}
            />
          )}
        </div>

        {/* ── Fixed zoomed preview panel ─────────────────────────────
            position: fixed — always in viewport regardless of scroll  */}
        {zoom && (
          <div
            aria-hidden="true"
            className="gallery-zoom-preview"
            style={{
              position:           'fixed',
              top:                previewPos.top,
              left:               previewPos.left,
              width:              PREVIEW_SIZE,
              height:             PREVIEW_SIZE,
              backgroundImage:    `url(${currentSrc})`,
              backgroundSize:     `${ZOOM_FACTOR * 100}%`,
              backgroundPosition: bgPos,
              backgroundRepeat:   'no-repeat',
              border:             '1px solid #d0d0d0',
              borderRadius:       10,
              boxShadow:          '0 8px 32px rgba(0,0,0,0.18)',
              zIndex:             9999,
              pointerEvents:      'none',
              overflow:           'hidden',
              // Crosshair overlay in center for precision reference
              backgroundBlendMode: 'normal',
            }}
          >
            {/* Crosshair centre mark */}
            <div style={{
              position:   'absolute',
              top:        '50%',
              left:       '50%',
              transform:  'translate(-50%, -50%)',
              width:      12,
              height:     12,
              pointerEvents: 'none',
            }}>
              <div style={{ position: 'absolute', top: 5, left: 0, width: 12, height: 2, background: 'rgba(59,177,243,0.7)', borderRadius: 1 }} />
              <div style={{ position: 'absolute', top: 0, left: 5, width: 2, height: 12, background: 'rgba(59,177,243,0.7)', borderRadius: 1 }} />
            </div>

            {/* "Zoomed ×3" label */}
            <div style={{
              position:   'absolute',
              bottom:     8,
              right:      10,
              fontSize:   11,
              fontWeight: 600,
              color:      'rgba(0,0,0,0.45)',
              background: 'rgba(255,255,255,0.75)',
              borderRadius: 4,
              padding:    '2px 6px',
              backdropFilter: 'blur(4px)',
            }}>
              ×{ZOOM_FACTOR}
            </div>
          </div>
        )}

        {/* ── Thumbnail strip ───────────────────────────────────────── */}
        {images.length > 1 && (
          <div className="images" style={{ marginTop: 8 }}>
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
                  onError={e => { e.currentTarget.src = '/assets/images/placeholder.jpg'; }}
                />
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Zoom hint — desktop only */}
      <p style={{
        fontSize:  12,
        color:     '#aaa',
        marginTop: 6,
        textAlign: 'center',
      }}>
        <i className="lni lni-zoom-in" style={{ marginRight: 4 }} />
        Hover over image to zoom
      </p>

      <style>{`
        /* Hide everything zoom-related on touch / small screens */
        @media (hover: none), (max-width: 991px) {
          .gallery-zoom-lens,
          .gallery-zoom-preview {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
