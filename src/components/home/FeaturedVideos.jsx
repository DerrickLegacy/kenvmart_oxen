// FeaturedVideos.jsx - With adjustable card heights
import { color } from 'framer-motion';
import React, { useRef, useState } from 'react';

const videos = [
  {
    id: 1,
    src: '/assets/videos/best_portable_charger.mp4',
    title: "Lights, inflatables & porch picks",
    subtitle: "Make long journeys never like before",
    buttonText: "Shop now",
    bgColor: "#2d1b3d",
  },
  {
    id: 2,
    src: '/assets/videos/Unleash_your.mp4',
    title: "From snacks to meals",
    subtitle: "Easy & affordable eats for college students",
    buttonText: "Shop now",
    bgColor: "#1a3a4a",
  },
  {
    id: 3,
    src: '/assets/videos/quick_power_ups.mp4',
    title: "Durable fit",
    subtitle: "",
    buttonText: "Shop now",
    bgColor: "#8b4513",
  },
  {
    id: 4,
    src: '/assets/videos/just_droped.mp4',
    title: "65W Charge Adapter",
    subtitle: "",
    buttonText: "Shop now",
    bgColor: "#e60012",
  },
  {
    id: 5,
    src: '/assets/videos/smash_charger_get_new_stuff.mp4',
    title: "Virtual support with Telehealth",
    subtitle: "",
    buttonText: "Learn more",
    bgColor: "#0056b3",
  },
];

const FeaturedVideos = () => {
  const [hovered, setHovered] = useState(null);

  // 🎯 ADJUST THESE HEIGHTS AS NEEDED
  const CARD_HEIGHTS = {
    card1: '615px',      // Tall card on left
    card2: '300px',      // Top right card
    card3: '300px',      // Bottom left card
    card4: '300px',      // Bottom right card
    card5: '615px',      // Tall card on right
  };

  return (
    <section className="trending-products mt-2">
      <div className="container">
        <h2 style={styles.heading}>Featured in videos</h2>
        <small style={styles.small}>Comfort unmatched</small>

        {/* Main Row Layout */}
        <div style={styles.row}>
          {/* Column 1 - Takes 5 columns (Card 1) */}
          <div style={styles.col5}>
            <VideoCard
              video={videos[0]}
              isHovered={hovered === videos[0].id}
              onHover={() => setHovered(videos[0].id)}
              onLeave={() => setHovered(null)}
              height={CARD_HEIGHTS.card1}
            />
          </div>

          {/* Column 2 - Takes 4 columns */}
          <div style={styles.col4}>
            <div style={styles.nestedRow}>
              {/* Card 2 - Full width of column 2 */}
              <div style={styles.col12}>
                <VideoCard
                  video={videos[1]}
                  isHovered={hovered === videos[1].id}
                  onHover={() => setHovered(videos[1].id)}
                  onLeave={() => setHovered(null)}
                  height={CARD_HEIGHTS.card2}
                />
              </div>

              {/* Row for Cards 3 & 4 */}
              <div style={styles.nestedRow}>
                <div style={styles.col6}>
                  <VideoCard
                    video={videos[2]}
                    isHovered={hovered === videos[2].id}
                    onHover={() => setHovered(videos[2].id)}
                    onLeave={() => setHovered(null)}
                    height={CARD_HEIGHTS.card3}
                  />
                </div>
                <div style={styles.col6}>
                  <VideoCard
                    video={videos[3]}
                    isHovered={hovered === videos[3].id}
                    onHover={() => setHovered(videos[3].id)}
                    onLeave={() => setHovered(null)}
                    height={CARD_HEIGHTS.card4}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 3 - Takes 3 columns (Card 5) */}
          <div style={styles.col3}>
            <VideoCard
              video={videos[4]}
              isHovered={hovered === videos[4].id}
              onHover={() => setHovered(videos[4].id)}
              onLeave={() => setHovered(null)}
              height={CARD_HEIGHTS.card5}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// Video Card Component
const VideoCard = ({ video, isHovered, onHover, onLeave, height }) => {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    onHover();
    if (videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  };

  const handleMouseLeave = () => {
    onLeave();
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      style={{
        ...styles.card,
        backgroundColor: video.bgColor,
        height: height,
        transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: isHovered
          ? '0 10px 30px rgba(0,0,0,0.2)'
          : '0 2px 8px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        src={video.src}
        style={{
          ...styles.video,
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
        muted
        loop
        playsInline
        preload="metadata"
      />

      {/* Dark Overlay */}
      <div style={styles.overlay} />

      {/* Play/Pause Button */}
      <div style={styles.playButton}>
        <i className={isHovered ? 'lni lni-pause' : 'lni lni-play'} />
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h3 style={styles.cardTitle}>{video.title}</h3>
        {video.subtitle && <p style={styles.cardSubtitle}>{video.subtitle}</p>}
        {video.buttonText && (
          <div style={styles.cardButton}>
            {video.buttonText} →
          </div>
        )}
      </div>
    </div>
  );
};

// All styles
const styles = {
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#111',
  },
  small: {
    display: 'block',
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px',
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
  },
  nestedRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    width: '100%',
  },
  col5: {
    flex: '0 0 calc(41.666% - 15px)',
    maxWidth: 'calc(41.666% - 15px)',
  },
  col4: {
    flex: '0 0 calc(33.333% - 15px)',
    maxWidth: 'calc(33.333% - 15px)',
  },
  col3: {
    flex: '0 0 calc(25% - 15px)',
    maxWidth: 'calc(25% - 15px)',
  },
  col12: {
    flex: '0 0 100%',
    maxWidth: '100%',
  },
  col6: {
    flex: '0 0 calc(50% - 7.5px)',
    maxWidth: 'calc(50% - 7.5px)',
  },
  card: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    color: '#fff',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    minHeight: '150px',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.5s ease',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 70%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  content: {
    position: 'absolute',
    left: '20px',
    right: '20px',
    bottom: '20px',
    color: '#fff',
    zIndex: 2,
  },
  cardTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '1.25',
    color: '#fff',
  },
  cardSubtitle: {
    margin: '4px 0 0',
    fontSize: '13px',
    opacity: 0.9,
  },
  cardButton: {
    display: 'inline-block',
    marginTop: '12px',
    padding: '6px 16px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'background 0.3s ease',
    width: 'fit-content',
  },
  playButton: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.4)',
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(5px)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    fontSize: '14px',
    transition: 'all 0.3s ease',
  },
};

export default FeaturedVideos;