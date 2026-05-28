import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>
      <div className="hero-content">
        <span className="hero-subtitle">Yeni Sezon 2026</span>
        <h1 className="hero-title">Modern Erkeğin<br />Premium Tercihi</h1>
        <p className="hero-description">
          Kalite ve şıklığın buluştuğu özel koleksiyon. Tarzınızı yansıtan
          parçalarla tanışın.
        </p>
        <div className="hero-buttons">
          <Link to="/urunler" className="btn btn-primary">
            Koleksiyonu Keşfet
          </Link>
          <Link to="/urunler?kategori=yeni" className="btn btn-outline">
            Yeni Gelenler
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
