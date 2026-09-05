/**
 * ProductGallery — product details page only
 *
 * Features:
 * 1. PAN   — moving cursor pans the 115%-zoomed image so tall/wide images
 *            reveal hidden parts without scrolling.
 * 2. ZOOM  — circular 3× magnifying lens follows cursor + a fixed viewport
 *            preview panel shows the zoomed region.
 * 3. LIGHTBOX — ⛶ button top-right opens the full image fullscreen.
 *
 * Zoom/pan turns OFF automatically while cursor is over the ⛶ button,
 * and turns back ON the moment the cursor moves back onto the image.
 *
 * Desktop only (hover:hover pointer:fine). Respects prefers-reduced-motion.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

const PAN_SCALE   = 1.15;
const ZOOM_FACTOR = 3;
const LENS_SIZE   = 120;
const PREVIEW_W   = 320;
const PREVIEW_H   = 320;

// ─── Lightbox ─────────────────────────────────────────────────────────────
function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Full view: ${alt}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, cursor: 'zoom-out',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '50%', width: 42, height: 42,
          color: '#fff', fontSize: 22, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2,
        }}
      >×</button>

      <img
        src={src}
        alt={alt}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '92vw', maxHeight: '92vh',
          objectFit: 'contain', borderRadius: 8,
          boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
          cursor: 'default', userSelect: 'none',
        }}
        onError={e => { e.currentTarget.src = '/assets/images/placeholder.jpg'; }}
      />

      <p style={{
        position: 'absolute', bottom: 14, left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.4)', fontSize: 12,
        margin: 0, pointerEvents: 'none',
      }}>
        Click outside or press Esc to close
      </p>
    </div>,
    document.body
  );
}

// ─── Gallery ───────────────────────────────────────────────────────────────
export default function ProductGallery({ images = [], productName = '' }) {
  const [current,       setCurrent]       = useState(0);
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [zoomActive,    setZoomActive]    = useState(false);
  const [lensPos,       setLensPos]       = useState({ x: 0, y: 0 });
  const [panTransform,  setPanTransform]  = useState('scale(1)');
  const [bgPos,         setBgPos]         = useState('50% 50%');
  const [previewPos,    setPreviewPos]    = useState({ top: 0, left: 0 });

  const wrapRef    = useRef(null);
  // ref that tracks whether the cursor is currently over the expand button
  // using a ref (not state) so it never triggers a re-render on its own
  const overBtnRef = useRef(false);

  const safeIndex  = current < images.length ? current : 0;
  const currentSrc = images[safeIndex] || '/assets/images/placeholder.jpg';

  // ── Single mousemove handler drives everything ──────────────────────
  const handleMouseMove = useCallback((e) => {
    // If cursor is over the expand button, keep zoom off and reset pan
    if (overBtnRef.current) {
      setZoomActive(false);
      setPanTransform('scale(1) translate(0px, 0px)');
      return;
    }

    const wrap = wrapRef.current;
    if (!wrap) return;

    const r  = wrap.getBoundingClientRect();
    const x  = e.clientX - r.left;
    const y  = e.clientY - r.top;

    // Turn zoom on as soon as cursor moves over the image area
    setZoomActive(true);

    // ── Pan ──────────────────────────────────────────────────────────
    const overflowX = r.width  * PAN_SCALE - r.width;
    const overflowY = r.height * PAN_SCALE - r.height;
    const rx        = Math.max(0, Math.min(x / r.width,  1));
    const ry        = Math.max(0, Math.min(y / r.height, 1));
    const tx        = -(rx * overflowX) / PAN_SCALE;
    const ty        = -(ry * overflowY) / PAN_SCALE;
    setPanTransform(`scale(${PAN_SCALE}) translate(${tx}px, ${ty}px)`);

    // ── Zoom lens ────────────────────────────────────────────────────
    const half = LENS_SIZE / 2;
    const cx   = Math.max(half, Math.min(x, r.width  - half));
    const cy   = Math.max(half, Math.min(y, r.height - half));
    setLensPos({ x: cx, y: cy });

    const xPct = ((cx / r.width)  * 100).toFixed(2);
    const yPct = ((cy / r.height) * 100).toFixed(2);
    setBgPos(`${xPct}% ${yPct}%`);

    // ── Preview panel position (fixed to viewport) ───────────────────
    const vw        = window.innerWidth;
    const vh        = window.innerHeight;
    const defaultL  = r.right + 16;
    const fitsRight = defaultL + PREVIEW_W < vw - 8;
    setPreviewPos({
      left: fitsRight ? defaultL : r.left - PREVIEW_W - 16,
      top:  Math.max(8, Math.min(e.clientY - PREVIEW_H / 2, vh - PREVIEW_H - 8)),
    });
  }, []);

  const handleMouseLeave = () => {
    setZoomActive(false);
    setPanTransform('scale(1) translate(0px, 0px)');
  };

  // Hide on scroll
  useEffect(() => {
    const hide = () => { setZoomActive(false); setPanTransform('scale(1)'); };
    window.addEventListener('scroll', hide, { passive: true });
    return () => window.removeEventListener('scroll', hide);
  }, []);

  return (
    <div className="product-images">
      <main id="gallery" style={{ position: 'relative' }}>

        {/* ── Main image wrap ──────────────────────────────────────── */}
        <div
          ref={wrapRef}
          className="main-img gallery-main-wrap"
          style={{
            position: 'relative',
            overflow: 'hidden',
            cursor:   zoomActive ? 'crosshair' : 'default',
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <img
            data-testid="main-image"
            src={currentSrc}
            id="current"
            alt={productName}
            className="gallery-main-img"
            draggable={false}
            style={{
              display:         'block',
              width:           '100%',
              userSelect:      'none',
              transformOrigin: '0 0',
              transition:      'transform 0.08s ease',
              willChange:      'transform',
              transform:       panTransform,
              pointerEvents:   'none',
            }}
            onError={e => { e.currentTarget.src = '/assets/images/placeholder.jpg'; }}
          />

          {/* Circular zoom lens */}
          {zoomActive && (
            <div aria-hidden="true" style={{
              position:           'absolute',
              left:               lensPos.x - LENS_SIZE / 2,
              top:                lensPos.y - LENS_SIZE / 2,
              width:              LENS_SIZE,
              height:             LENS_SIZE,
              borderRadius:       '50%',
              border:             '2.5px solid rgba(255,255,255,0.9)',
              boxShadow:          '0 2px 16px rgba(0,0,0,0.25)',
              backgroundImage:    `url(${currentSrc})`,
              backgroundSize:     `${ZOOM_FACTOR * 100}%`,
              backgroundPosition: bgPos,
              backgroundRepeat:   'no-repeat',
              pointerEvents:      'none',
              zIndex:             10,
              filter:             'brightness(1.05)',
            }} />
          )}

          {/* Blue ring around lens */}
          {zoomActive && (
            <div aria-hidden="true" style={{
              position:      'absolute',
              left:          lensPos.x - LENS_SIZE / 2 - 3,
              top:           lensPos.y - LENS_SIZE / 2 - 3,
              width:         LENS_SIZE + 6,
              height:        LENS_SIZE + 6,
              borderRadius:  '50%',
              border:        '2px solid rgba(59,177,243,0.5)',
              pointerEvents: 'none',
              zIndex:        9,
            }} />
          )}

          {/* ⛶ Expand / lightbox button */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setLightboxOpen(true); }}
            aria-label="View full image"
            title="View full image"
            // Set overBtnRef when cursor enters/leaves the button
            // This is read synchronously inside handleMouseMove
            onMouseEnter={() => { overBtnRef.current = true; }}
            onMouseLeave={() => { overBtnRef.current = false; }}
            style={{
              position:       'absolute',
              top:            10,
              right:          10,
              width:          34,
              height:         34,
              borderRadius:   '50%',
              border:         '1px solid rgba(255,255,255,0.6)',
              background:     'rgba(255,255,255,0.92)',
              color:          '#333',
              fontSize:       16,
              cursor:         'pointer',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              zIndex:         12,
              boxShadow:      '0 1px 6px rgba(0,0,0,0.15)',
              transition:     'background-color 0.15s ease, color 0.15s ease',
            }}
          >
            <i className="lni lni-frame-expand" />
          </button>
        </div>

        {/* ── Fixed zoomed preview panel ───────────────────────────── */}
        {zoomActive && (
          <div aria-hidden="true" style={{
            position:           'fixed',
            top:                previewPos.top,
            left:               previewPos.left,
            width:              PREVIEW_W,
            height:             PREVIEW_H,
            backgroundImage:    `url(${currentSrc})`,
            backgroundSize:     `${ZOOM_FACTOR * 100}%`,
            backgroundPosition: bgPos,
            backgroundRepeat:   'no-repeat',
            border:             '1px solid #d0d7de',
            borderRadius:       10,
            boxShadow:          '0 8px 32px rgba(0,0,0,0.18)',
            zIndex:             9999,
            pointerEvents:      'none',
            overflow:           'hidden',
          }}>
            {/* Centre crosshair */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: 5, left: 0, width: 12, height: 2, background: 'rgba(59,177,243,0.7)', borderRadius: 1 }} />
              <div style={{ position: 'absolute', top: 0, left: 5, width: 2, height: 12, background: 'rgba(59,177,243,0.7)', borderRadius: 1 }} />
            </div>
            <div style={{
              position: 'absolute', bottom: 8, right: 10,
              fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.4)',
              background: 'rgba(255,255,255,0.75)', borderRadius: 4, padding: '2px 6px',
            }}>×{ZOOM_FACTOR}</div>
          </div>
        )}

        {/* ── Thumbnails ───────────────────────────────────────────── */}
        {images.length > 1 && (
          <div className="images" style={{ marginTop: 8 }}>
            {images.map((img, i) => (
              <div
                key={i}
                className={`gallery-thumb-wrap${i === safeIndex ? ' active' : ''}`}
                onClick={() => { setCurrent(i); setZoomActive(false); }}
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

      {/* Hint */}
      <p style={{ fontSize: 12, color: '#aaa', marginTop: 6, textAlign: 'center' }}>
        <i className="lni lni-zoom-in" style={{ marginRight: 4 }} />
        Hover to pan &amp; zoom · Click <i className="lni lni-frame-expand" style={{ fontSize: 11 }} /> for full view
      </p>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          src={currentSrc}
          alt={productName}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <style>{`
        @media (hover: none), (max-width: 991px) {
          .gallery-zoom-lens { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gallery-main-wrap img { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
