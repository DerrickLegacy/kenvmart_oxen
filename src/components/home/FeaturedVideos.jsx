import React, { useRef, useState, useEffect } from 'react';

const videos = [
  {
    id: 1,
    src: '/public/videos/best_portable_charger.mp4',
    title: "Lights, inflatables & porch picks",
    subtitle: "Make long journeys never like before",
    buttonText: "Shop now",
    bgColor: "#2d1b3d",
  },
  {
    id: 2,
    src: '/public/videos/Unleash_your.mp4',
    title: "Unleash your style",
    subtitle: "Easy & affordable accessories",
    buttonText: "Shop now",
    bgColor: "#1a3a4a",
  },
  {
    id: 3,
    src: '/public/videos/quick_power_ups.mp4',
    title: "Quick power ups",
    subtitle: "Never run out of charge",
    buttonText: "Shop now",
    bgColor: "#8b4513",
  },
  {
    id: 4,
    src: '/public/videos/just_droped.mp4',
    title: "65W Charge Adapter",
    subtitle: "Just dropped",
    buttonText: "Shop now",
    bgColor: "#e60012",
  },
  {
    id: 5,
    src: '/public/videos/smash_charger_get_new_stuff.mp4',
    title: "New arrivals",
    subtitle: "Fresh gear just in",
    buttonText: "Shop now",
    bgColor: "#0056b3",
  },
];

// Single video card
const VideoCard = ({ video, height, isMobile }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  // On mobile, autoplay on mount
  useEffect(() => {
    if (isMobile && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }, [isMobile]);

  const handleMouseEnter = () => {
    if (!isMobile && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setPlaying(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: video.bgColor,
        height: height,
        minHeight: isMobile ? 200 : 150,
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        flexShrink: 0,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={video.src}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        muted
        loop
        playsInline
        preload="metadata"
      />

      {/* Lighter overlay — just enough for text readability, not blocking the video */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Play button top-right */}
      <div style={{
        position: 'absolute', top: 10, right: 10,
        width: 34, height: 34, borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.5)',
        background: 'rgba(0,0,0,0.3)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 3, fontSize: 13,
      }}>
        <i className={playing ? 'lni lni-pause' : 'lni lni-play'} />
      </div>

      {/* Content bottom */}
      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14, zIndex: 2, color: '#fff' }}>
        <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>
          {video.title}
        </div>
        {video.subtitle && (
          <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>{video.subtitle}</div>
        )}
        <span style={{
          display: 'inline-block',
          padding: '4px 14px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          color: '#fff',
        }}>
          {video.buttonText} →
        </span>
      </div>
    </div>
  );
};

const FeaturedVideos = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <section className="trending-products mt-2">
      <div className="container">
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: '#111' }}>
          Featured in videos
        </h2>
        <small style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: 20 }}>
          Comfort unmatched
        </small>

        {/* ── Mobile layout: vertical scroll row ── */}
        {isMobile ? (
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory' }}>
            {videos.map(v => (
              <div key={v.id} style={{ flex: '0 0 72vw', scrollSnapAlign: 'start' }}>
                <VideoCard video={v} height="260px" isMobile={true} />
              </div>
            ))}
          </div>
        ) : (
          /* ── Desktop layout: masonry-style grid ── */
          <div style={{ display: 'flex', gap: 14 }}>
            {/* Col 1 — tall card */}
            <div style={{ flex: '0 0 calc(41% - 7px)' }}>
              <VideoCard video={videos[0]} height="600px" isMobile={false} />
            </div>

            {/* Col 2 — top card + 2 smaller */}
            <div style={{ flex: '0 0 calc(33% - 7px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <VideoCard video={videos[1]} height="290px" isMobile={false} />
              <div style={{ display: 'flex', gap: 14, flex: 1 }}>
                <div style={{ flex: 1 }}>
                  <VideoCard video={videos[2]} height="290px" isMobile={false} />
                </div>
                <div style={{ flex: 1 }}>
                  <VideoCard video={videos[3]} height="290px" isMobile={false} />
                </div>
              </div>
            </div>

            {/* Col 3 — tall card */}
            <div style={{ flex: '0 0 calc(26% - 7px)' }}>
              <VideoCard video={videos[4]} height="600px" isMobile={false} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedVideos;
