import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../../context/WishlistContext';
import { useAuth } from '../../../context/AuthContext';
import CartDropdown from './CartDropdown';
import { siteConfig } from '../../../data/siteConfig';
import { productsApi, imageUrl } from '../../../services/api';

const DROPDOWN_STYLES = {
  container: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    zIndex: 60,
    background: '#fff',
    border: '1px solid #e6e8eb',
    borderRadius: 10,
    boxShadow: '0 12px 32px rgba(10, 22, 50, 0.12)',
    overflow: 'hidden',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    cursor: 'pointer',
    borderBottom: '1px solid #f2f3f5',
    transition: 'background 0.15s ease',
    textDecoration: 'none',
    color: 'inherit',
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    objectFit: 'cover',
    background: '#f6f7f9',
    flexShrink: 0,
    border: '1px solid #eef0f3',
  },
  name: {
    fontSize: 14,
    fontWeight: 600,
    color: '#0b1a33',
    lineHeight: 1.3,
    margin: 0,
  },
  price: {
    fontSize: 13,
    fontWeight: 700,
    color: '#ef2c4a',
    marginTop: 2,
  },
  footer: {
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 600,
    color: '#0b1a33',
    background: '#fafbfd',
    textAlign: 'center',
    cursor: 'pointer',
  },
  empty: {
    padding: '18px 14px',
    fontSize: 13,
    color: '#6c7380',
    textAlign: 'center',
  },
  loading: {
    padding: '14px 14px',
    fontSize: 13,
    color: '#8b929f',
    textAlign: 'center',
  },
};

/**
 * HeaderMiddle — Top bar: logo, search (with live suggestions), auth, wishlist, cart.
 */
export default function HeaderMiddle() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sticky, setSticky] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const { state: wishlistItems } = useWishlist();
  const { user, loading, logout } = useAuth();

  const searchWrapRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 70);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close suggestions dropdown on click outside / Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (!searchWrapRef.current) return;
      if (!searchWrapRef.current.contains(e.target)) setDropdownOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setDropdownOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    const q = searchTerm.trim();
    if (!q) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      setDropdownOpen(false);
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
      } catch (_err) {
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 280);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
    setDropdownOpen(false);
  };

  const onPickSuggestion = (product) => {
    setDropdownOpen(false);
    setSearchTerm('');
    navigate(`/products/${product.id}${product.slug ? `/${product.slug}` : ''}`);
  };

  const seeAllResultsUrl = useMemo(
    () => `/products?q=${encodeURIComponent(searchTerm.trim())}`,
    [searchTerm]
  );

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {sticky && <div className="header-middle-spacer" />}

      <div className={`header-middle${sticky ? ' header-middle-sticky' : ''}`}>
        <div className="container">
          <div className="row align-items-center">

            <div className="col-lg-3 col-md-3 col-7">
              <Link className="navbar-brand" to="/">
                <img src="/assets/images/logo/logo.svg" alt={siteConfig.name} />
              </Link>
            </div>

            <div className="col-lg-5 col-md-7 d-xs-none">
              <div className="main-menu-search" ref={searchWrapRef} style={{ position: 'relative' }}>
                <form className="navbar-search search-style-5" onSubmit={handleSearchSubmit}>
                  <div className="search-input">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={handleSearch}
                      onFocus={() => searchTerm.trim() && setDropdownOpen(true)}
                      data-testid="search-input"
                    />
                  </div>
                  <div className="search-btn">
                    <button type="submit" aria-label="Search"><i className="lni lni-search-alt"></i></button>
                  </div>
                </form>

                {dropdownOpen && searchTerm.trim() && (
                  <div style={DROPDOWN_STYLES.container} role="listbox">
                    {suggestionsLoading && (
                      <div style={DROPDOWN_STYLES.loading}>Searching…</div>
                    )}
                    {!suggestionsLoading && suggestions.length === 0 && (
                      <div style={DROPDOWN_STYLES.empty}>
                        No products match <strong>“{searchTerm.trim()}”</strong>
                      </div>
                    )}
                    {!suggestionsLoading && suggestions.map((p) => (
                      <div
                        key={p.id}
                        style={DROPDOWN_STYLES.item}
                        onClick={() => onPickSuggestion(p)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f6f7f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                        role="option"
                      >
                        <img
                          src={imageUrl(p.images?.[0] || p.image)}
                          alt={p.name}
                          style={DROPDOWN_STYLES.thumb}
                          onError={(e) => { e.currentTarget.src = imageUrl(''); }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={DROPDOWN_STYLES.name} className="truncate">
                            {p.name}
                          </div>
                          <div style={DROPDOWN_STYLES.price}>
                            {p.price_text || `UGX ${(p.price ?? 0).toLocaleString()}`}
                          </div>
                        </div>
                        <i className="lni lni-arrow-right" style={{ color: '#c2c6cc', fontSize: 14 }} />
                      </div>
                    ))}
                    {!suggestionsLoading && (
                      <Link
                        to={seeAllResultsUrl}
                        onClick={() => setDropdownOpen(false)}
                        style={DROPDOWN_STYLES.footer}
                      >
                        See all results for “{searchTerm.trim()}” →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-4 col-md-2 col-5">
              <div className="middle-right-area">
                <div className="nav-hotline">
                  <i className="lni lni-phone"></i>
                  <h3>
                    <span>
                      <a href={`tel:${siteConfig.phoneRaw}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {siteConfig.phone}
                      </a>
                    </span>
                  </h3>
                </div>
{/* 
                {!loading && (
                  <div className="header-auth-links">
                    {user ? (
                      <div className="header-user-menu">
                        <span className="header-username">
                          <i className="lni lni-user"></i>{' '}
                          {user.full_name?.split(' ')[0] ?? 'Account'}
                        </span>
                      </div>
                    ) : (
                      <Link to="/login" className="header-signin-link">
                        <i className="lni lni-enter"></i> Sign In
                      </Link>
                    )}
                  </div>
                )} */}

                <div className="navbar-cart">
                  <div className="wishlist">
                    <Link to="/wishlist">
                      <i className="lni lni-heart"></i>
                      <span className="total-items">{wishlistItems.length}</span>
                    </Link>
                  </div>
                  <CartDropdown />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
