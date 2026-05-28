import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import logo from '../assets/veladoLogo.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo" aria-label="Velado ana sayfa">
              <img src={logo} alt="Velado" className="footer-logo-image" />
            </Link>
            <p className="footer-tagline">
              Modern erkeğin premium giyim tercihi. Kalite ve şıklığın buluştuğu nokta.
            </p>
            <div className="footer-social">
              <a href="https://instagram.com/velado" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://facebook.com/velado" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://x.com/velado" target="_blank" rel="noopener noreferrer" aria-label="X">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Hızlı Linkler</h4>
            <ul>
              <li><Link to="/urunler">Tüm Ürünler</Link></li>
              <li><Link to="/urunler?kategori=yeni">Yeni Gelenler</Link></li>
              <li><Link to="/urunler?kategori=indirim">İndirimli Ürünler</Link></li>
              <li><Link to="/hakkimizda">Hakkımızda</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Müşteri Hizmetleri</h4>
            <ul>
              <li><Link to="/iletisim">İletişim</Link></li>
              <li><Link to="/sikca-sorulan-sorular">S.S.S.</Link></li>
              <li><Link to="/kargo-ve-iade">Kargo ve İade</Link></li>
              <li><Link to="/beden-rehberi">Beden Rehberi</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>İletişim</h4>
            <ul>
              <li>
                <Phone size={16} />
                <span>0850 123 45 67</span>
              </li>
              <li>
                <Mail size={16} />
                <span>info@velado.com.tr</span>
              </li>
              <li>
                <MapPin size={16} />
                <span>İstanbul, Türkiye</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} VELADO. Tüm hakları saklıdır.</p>
          <div className="footer-legal">
            <Link to="/gizlilik-politikasi">Gizlilik Politikası</Link>
            <Link to="/kullanim-sartlari">Kullanım Şartları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
