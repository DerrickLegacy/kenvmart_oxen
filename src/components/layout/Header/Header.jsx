import { useState, useEffect } from 'react';
import Topbar from './Topbar';
import HeaderMiddle from './HeaderMiddle';
import HeaderBottom from './HeaderBottom';

export default function Header() {
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 45);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header data-testid="header" className="header navbar-area" style={{ borderBottom: 'none', zIndex: 9999, position: 'relative' }}>
      <Topbar />

      {sticky && <div className="header-sticky-spacer" />}

      <div className={`header-sticky-wrap${sticky ? ' header-sticky-wrap--fixed' : ''}`} style={{ borderBottom: 'none' }}>
        <HeaderMiddle sticky={sticky} />
        <HeaderBottom sticky={sticky} />
      </div>
    </header>
  );
}
