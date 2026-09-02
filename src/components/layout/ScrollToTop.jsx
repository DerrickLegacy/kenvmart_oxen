import { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      data-testid="scroll-to-top"
      onClick={handleClick}
      style={{ display: visible ? 'block' : 'none', backgroundColor: '#3fb1f3' }}
      className="scroll-top"
      aria-label="Scroll to top"
    >
      <i className="lni lni-chevron-up"></i>
    </button>
  );
}
