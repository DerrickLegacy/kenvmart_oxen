import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../../context/WishlistContext';
import { useAuth } from '../../../context/AuthContext';
import CartDropdown from './CartDropdown';
import { siteConfig } from '../../../data/siteConfig';
import { productsApi, imageUrl } from '../../../services/api';

const DROP = {
  container: {
    position:    'absolute',
    top:         'calc(100% + 4px)',
    left:        0,
    right:       0,
    zIndex:      1100,          /* must be above sticky header-bottom (999) */
    background:  '#fff',
    border:      '1.5px solid #e18f27',
    borderRadius: 10,
    boxShadow:   '0 12px 32px rgba(10,22,50,0.14)',
    overflow:    'hidden',
  },
  item: {
    display:        'flex',
    alignItems:     'center',
    gap:            12,
    padding:        '10px 14px',
    cursor:         'pointer',
    borderBottom:   '1px solid #f2f3f5',
    transition:     'background 0.15s ease',
    textDecoration: 'none',
    color:          'inherit',
  },
  thumb: {
    width: 44, height: 44,
    borderRadius: 6,
    objectFit:   'cover',
    background:  '#f6f7f9',
    flexShrink:  0,
    border:      '1px solid #eef0f3',
  },
  name:  { fontSize: 14, fontWeight: 600, color: '#0b1a33', lineHeight: 1.3, margin: 0 },
  price: { fontSize: 13, fontWeight: 700, color: '#e18f27', marginTop: 2 },
  footer: {
    padding:    '10px 14px',
    fontSize:   13,
    fontWeight: 600,
    color:      '#183B9B',
    background: '#fafbfd',
    textAlign:  'center',
    cursor:     'pointer',
    display:    'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  empty:   { padding: '18px 14px', fontSize: 13, color: '#6c7380', textAlign: 'center' },
  loading: { padding: '14px',      fontSize: 13, color: '#8b929f', textAlign: 'center' },
};

export default function HeaderMiddle() {
  const [searchTerm,        setSearchTerm]        = useState('');
  const [sticky,            setSticky]            = useState(false);
  const [suggestions,       setSuggestions]       = useState([]);
  const [suggestionsLoading,setSuggestionsLoading]= useState(false);
  const [dropdownOpen,      setDropdownOpen]      = useState(false);
  const navigate = useNavigate();

  const { state: wishlistItems } = useWishlist();

  const searchWrapRef = useRef(null);
  const debounceRef   = useRef(null);

  /* sticky on scroll */
  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 70);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close on outside click or Escape */
  useEffect(() => {
    const onDocClick = (e) => {
      if (!searchWrapRef.current?.contains(e.target)) setDropdownOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setDropdownOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown',   onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown',   onKey);
    };
  }, []);

  /* fetch suggestions */
  useEffect(() => {
    const q = searchTerm.trim();
    if (!q) {
      setSuggestions([]); setSuggestionsLoading(false); setDropdownOpen(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }
    setSuggestionsLoading(true);
    setDropdownOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await productsApi.list({ q, limit: 6 });
        setSuggestions(res?.products || []);
      } catch { setSuggestions([]); }
      finally  { setSuggestionsLoading(false); }
    }, 280);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchTerm]);

  const handleSearch      = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit= (e) => {
    e.preventDefault();
    navigate(searchTerm.trim()
      ? `/products?q=${encodeURIComponent(searchTerm.trim())}`
      : '/products');
    setDropdownOpen(false);
  };
  const onPickSuggestion  = (p) => {
    setDropdownOpen(false); setSearchTerm('');
    navigate(`/product/${p.id}`);
  };
  const seeAllUrl = useMemo(
    () => `/products?q=${encodeURIComponent(searchTerm.trim())}`,
    [searchTerm]
  );

  /* ── Suggestions dropdown ──────────────────────────────────────── */
  const SuggestionsPanel = () =>
    dropdownOpen && searchTerm.trim() ? (
      <div style={DROP.container} role="listbox">
        {suggestionsLoading && <div style={DROP.loading}>Searching…</div>}

        {!suggestionsLoading && suggestions.length === 0 && (
          <div style={DROP.empty}>
            No products match <strong>"{searchTerm.trim()}"</strong>
          </div>
        )}

        {!suggestionsLoading && suggestions.map((p) => (
          <div
            key={p.id}
            style={DROP.item}
            role="option"
            onClick={() => onPickSuggestion(p)}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f6f7f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '')}
          >
            <img
              src={imageUrl(p.images?.[0] || p.image)}
              alt={p.name}
              style={DROP.thumb}
              onError={(e) => { e.currentTarget.src = imageUrl(''); }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={DROP.name} className="truncate">{p.name}</div>
              <div style={DROP.price}>
                {p.price_text || `UGX ${(p.price ?? 0).toLocaleString()}`}
              </div>
            </div>
            <i className="lni lni-chevron-right" style={{ color: '#c2c6cc', fontSize: 13 }} />
          </div>
        ))}

        {!suggestionsLoading && (
          <Link
            to={seeAllUrl}
            onClick={() => setDropdownOpen(false)}
            style={DROP.footer}
          >
            See all results for "{searchTerm.trim()}"
          </Link>
        )}
      </div>
    ) : null;

  /* ── Search form (reused in desktop + tablet) ──────────────────── */
  const SearchForm = ({ testId = 'search-input' }) => (
    <form className="navbar-search search-style-5" onSubmit={handleSearchSubmit}>
      <div className="search-input">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => searchTerm.trim() && setDropdownOpen(true)}
          data-testid={testId}
          style={{ border: '1.5px solid #e18f27', borderRight: 'none' }}
        />
      </div>
      <div className="search-btn">
        {/* yellow/orange bg, blue icon */}
        <button
          type="submit"
          aria-label="Search"
          style={{ background: '#e18f27', borderColor: '#e18f27' }}
        >
          <i className="lni lni-search-alt" style={{ color: '#183B9B' }} />
        </button>
      </div>
    </form>
  );

  return (
    <>
      {sticky && <div className="header-middle-spacer" />}

      <div className={`header-middle${sticky ? ' header-middle-sticky' : ''}`}>
        <div className="container">

          {/* ── DESKTOP lg+ ─────────────────────────────────── */}
          <div
            className="d-none d-lg-flex align-items-center"
            style={{ gap: 20, padding: '8px 0' }}
          >
            <Link className="navbar-brand" to="/" style={{ flexShrink: 0, lineHeight: 1 }}>
              <img src="/assets/images/logo/logo.svg" alt={siteConfig.name}
                style={{ height: 36, display: 'block' }} />
            </Link>

            {/* Search — overflow visible so dropdown is not clipped */}
            <div
              className="main-menu-search"
              ref={searchWrapRef}
              style={{ flex: 1, position: 'relative', overflow: 'visible' }}
            >
              <SearchForm testId="search-input" />
              <SuggestionsPanel />
            </div>

            <div className="middle-right-area" style={{ flexShrink: 0 }}>
              <div className="nav-hotline">
                <i className="lni lni-phone" />
                <h3>
                  <span>
                    <a href={`tel:${siteConfig.phoneRaw}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}>
                      {siteConfig.phone}
                    </a>
                  </span>
                </h3>
              </div>
              <div className="navbar-cart">
                <div className="wishlist">
                  <Link to="/wishlist">
                    <i className="lni lni-heart" />
                    <span className="total-items">{wishlistItems.length}</span>
                  </Link>
                </div>
                <CartDropdown />
              </div>
            </div>
          </div>

          {/* ── TABLET md–lg ────────────────────────────────── */}
          <div
            className="d-none d-md-flex d-lg-none align-items-center"
            style={{ gap: 12, padding: '8px 0' }}
          >
            <Link className="navbar-brand" to="/" style={{ flexShrink: 0, lineHeight: 1 }}>
              <img src="/assets/images/logo/logo.svg" alt={siteConfig.name}
                style={{ height: 32, display: 'block' }} />
            </Link>

            <div className="main-menu-search"
              ref={searchWrapRef}
              style={{ flex: 1, position: 'relative', overflow: 'visible' }}>
              <SearchForm testId="search-input-md" />
              <SuggestionsPanel />
            </div>

            <div className="navbar-cart" style={{ flexShrink: 0 }}>
              <div className="wishlist">
                <Link to="/wishlist">
                  <i className="lni lni-heart" />
                  <span className="total-items">{wishlistItems.length}</span>
                </Link>
              </div>
              <CartDropdown />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
