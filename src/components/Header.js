import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { getProductCategories } from '../firebase/products.js';
import logo from '../assets/veladoLogo.png';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const { isAuthenticated } = useAuth();
  const { getItemCount, toggleCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      const data = await getProductCategories();

      if (isMounted) {
        setCategories(data);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/urunler?arama=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <button
          className="header-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menü"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link to="/" className="header-logo" aria-label="Velado ana sayfa">
          <img src={logo} alt="Velado" className="header-logo-image" />
        </Link>

        <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/urunler?kategori=${cat.slug}`}
              className="header-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="header-action-btn"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Ara"
          >
            <Search size={20} />
          </button>

{isAuthenticated ? (
            <Link to="/hesabim" className="header-action-btn header-profile-btn" aria-label="Hesabım">
              <User size={20} />
            </Link>
          ) : (
            <Link to="/giris" className="header-login-btn">
              Giriş Yap
            </Link>
          )}

          <button
            className="header-action-btn header-cart-btn"
            onClick={toggleCart}
            aria-label="Sepet"
          >
            <ShoppingBag size={20} />
            {getItemCount() > 0 && (
              <span className="header-cart-count">{getItemCount()}</span>
            )}
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="header-search">
          <form onSubmit={handleSearch} className="header-search-form">
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="submit">
              <Search size={20} />
            </button>
          </form>
        </div>
      )}

      {isMenuOpen && (
        <div className="header-overlay" onClick={() => setIsMenuOpen(false)} />
      )}
    </header>
  );
};

export default Header;
