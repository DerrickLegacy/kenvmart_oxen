import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../../context/WishlistContext';
import CartDropdown from './CartDropdown';
import { siteConfig } from '../../../data/siteConfig';
import { productsApi, imageUrl } from '../../../services/api';

/* ── styles for the suggestions dropdown ───────────────────────── */
const D = {
  wrap: {
    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
    zIndex: 1100, background: '#fff',
    border: '1.5px solid #e18f27', borderRadius: 10,
    boxShadow: '0 12px 32px rgba(10,22,50,0.14)',
    overflow: 'hidden',
  },
  list: {
    maxHeight: 300, overflowY: 'auto',
    scrollbarWidth: 'none', msOverflowStyle: 'none',
  },
  item: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 14px', cursor: 'pointer',
    borderBottom: '1px solid #f2f3f5', transition: 'background 0.12s ease',
  },
  thumb: {
    width: 44, height: 44, borderRadius: 6,
    objectFit: 'cover', background: '#f6f7f9',
    flexShrink: 0, border: '1px solid #eef0f3',
  },
  name: { fontSize: 14, fontWeight: 600, color: '#0b1a33', margin: 0 },
  price: { fontSize: 13, fontWeight: 700, color: '#e18f27', marginTop: 2 },
  footer: {
    padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#183B9B',
    background: '#fafbfd', textAlign: 'center', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderTop: '1px solid #f0f2f5',
  },
  empty: { padding: '18px 14px', fontSize: 13, color: '#6c7380', textAlign: 'center' },
  loading: { padding: '14px', fontSize: 13, color: '#8b929f', textAlign: 'center' },
};

/* ── input + button shared styles ──────────────────────────────── */
const inputStyle = {
  border: '1.5px solid #e18f27',
  borderRight: 'none',
};
const btnStyle = {
  background: '#e18f27',
  borderColor: '#e18f27',
};
const iconStyle = { color: '#183B9B' };

export default function HeaderMiddle({ sticky = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const { state: wishlistItems } = useWishlist();
  const searchWrapRef = useRef(null);
  const debounceRef = useRef(null);

  /* close dropdown on outside click / Escape */
  useEffect(() => {
    const click = (e) => {
      if (!searchWrapRef.current?.contains(e.target)) setDropdownOpen(false);
    };
    const key = (e) => { if (e.key === 'Escape') setDropdownOpen(false); };
    document.addEventListener('mousedown', click);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', key); };
  }, []);

  /* fetch suggestions — debounced */
  useEffect(() => {
    const q = searchTerm.trim();
    if (!q) {
      setSuggestions([]); setSuggestionsLoading(false); setDropdownOpen(false);
      clearTimeout(debounceRef.current); return;
    }
    setSuggestionsLoading(true); setDropdownOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await productsApi.list({ q, limit: 20 });
        setSuggestions(res?.products || []);
      } catch { setSuggestions([]); }
      finally { setSuggestionsLoading(false); }
    }, 280);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(searchTerm.trim() ? `/products?q=${encodeURIComponent(searchTerm.trim())}` : '/products');
    setDropdownOpen(false);
  };
  const pickSuggestion = (p) => { setDropdownOpen(false); setSearchTerm(''); navigate(`/product/${p.id}`); };
  const seeAllUrl = useMemo(() => `/products?q=${encodeURIComponent(searchTerm.trim())}`, [searchTerm]);

  /* ── dropdown JSX — inline, NOT a sub-component, so focus is never stolen ── */
  const dropdown = dropdownOpen && searchTerm.trim() ? (
    <div style={D.wrap} role="listbox">
      <style>{`.hm-drop-list::-webkit-scrollbar{display:none}`}</style>
      <div className="hm-drop-list" style={D.list}>
        {suggestionsLoading && <div style={D.loading}>Searching…</div>}
        {!suggestionsLoading && suggestions.length === 0 && (
          <div style={D.empty}>No products match <strong>"{searchTerm.trim()}"</strong></div>
        )}
        {!suggestionsLoading && suggestions.map((p) => (
          <div key={p.id} style={D.item} role="option"
            onClick={() => pickSuggestion(p)}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f6f7f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '')}
          >
            <img src={imageUrl(p.images?.[0] || p.image)} alt={p.name} style={D.thumb}
              onError={(e) => { e.currentTarget.src = imageUrl(''); }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={D.name} className="truncate">{p.name}</div>
              <div style={D.price}>{p.price_text || `Shs. ${(p.price ?? 0).toLocaleString()}`}</div>
            </div>
          </div>
        ))}
      </div>
      {!suggestionsLoading && (
        <Link to={seeAllUrl} onClick={() => setDropdownOpen(false)} style={D.footer}>
          See all results for "{searchTerm.trim()}"
        </Link>
      )}
    </div>
  ) : null;

  return (
    <div className={`header-middle${sticky ? ' header-middle--stuck' : ''}`}>
      <div className="container">

        {/* ── DESKTOP lg+ ── */}
        <div className="d-none d-lg-flex align-items-center" style={{ gap: 20, padding: '8px 0' }}>

          <Link className="navbar-brand" to="/" style={{ flexShrink: 0, lineHeight: 1 }}>
            <img src="/assets/images/logo/logo.svg" alt={siteConfig.name} style={{ height: 36, display: 'block' }} />
          </Link>

          {/* search wrapper — overflow visible so dropdown isn't clipped */}
          <div className="main-menu-search" ref={searchWrapRef}
            style={{ flex: 1, position: 'relative', overflow: 'visible' }}>
            <form className="navbar-search search-style-5" onSubmit={handleSubmit}>
              <div className="search-input">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onFocus={() => searchTerm.trim() && setDropdownOpen(true)}
                  data-testid="search-input"
                  style={inputStyle}
                />
              </div>
              <div className="search-btn">
                <button type="submit" aria-label="Search" style={btnStyle}>
                  <i className="lni lni-search-alt" style={iconStyle} />
                </button>
              </div>
            </form>
            {dropdown}
          </div>

          <div className="middle-right-area" style={{ flexShrink: 0 }}>
            <div className="nav-hotline">
              <i className="lni lni-phone" />
              <h3><span>
                <a href={`tel:${siteConfig.phoneRaw}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {siteConfig.phone}
                </a>
              </span></h3>
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

        {/* ── TABLET md–lg ── */}
        <div className="d-none d-md-flex d-lg-none align-items-center" style={{ gap: 12, padding: '8px 0' }}>
          <Link className="navbar-brand" to="/" style={{ flexShrink: 0, lineHeight: 1 }}>
            <img src="/assets/images/logo/logo.svg" alt={siteConfig.name} style={{ height: 32, display: 'block' }} />
          </Link>

          <div className="main-menu-search" ref={searchWrapRef}
            style={{ flex: 1, position: 'relative', overflow: 'visible' }}>
            <form className="navbar-search search-style-5" onSubmit={handleSubmit}>
              <div className="search-input">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onFocus={() => searchTerm.trim() && setDropdownOpen(true)}
                  data-testid="search-input-md"
                  style={inputStyle}
                />
              </div>
              <div className="search-btn">
                <button type="submit" aria-label="Search" style={btnStyle}>
                  <i className="lni lni-search-alt" style={iconStyle} />
                </button>
              </div>
            </form>
            {dropdown}
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
  );
}
