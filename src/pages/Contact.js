import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Mail, MapPin, Phone } from 'lucide-react';
import './InfoPages.css';

const Contact = () => {
  return (
    <div className="info-page">
      <section className="info-hero">
        <div className="container">
          <div className="info-hero-content">
            <span className="info-eyebrow">Velado Support</span>
            <h1 className="info-title">İletişim</h1>
            <p className="info-lead">
              Sipariş, teslimat, ürün bilgisi veya iade süreçleri için bize ulaşabilirsiniz.
              Destek ekibimiz hafta içi hızlı dönüş sağlar.
            </p>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="container">
          <div className="info-grid">
            <article className="info-card">
              <div className="info-card-icon">
                <Phone size={22} />
              </div>
              <h3>Telefon</h3>
              <p>Doğrudan müşteri hizmetlerimize bağlanın.</p>
              <a className="info-card-link" href="tel:+908501234567">
                0850 123 45 67 <ArrowRight size={16} />
              </a>
            </article>

            <article className="info-card">
              <div className="info-card-icon">
                <Mail size={22} />
              </div>
              <h3>E-posta</h3>
              <p>Detaylı talepler ve sipariş numarası paylaşımı için.</p>
              <a className="info-card-link" href="mailto:info@velado.com.tr">
                info@velado.com.tr <ArrowRight size={16} />
              </a>
            </article>

            <article className="info-card">
              <div className="info-card-icon">
                <MapPin size={22} />
              </div>
              <h3>Merkez Ofis</h3>
              <address>
                Nişantaşı Mah.<br />
                Teşvikiye Cad. No:24<br />
                Şişli / İstanbul
              </address>
            </article>
          </div>
        </div>
      </section>

      <section className="info-section alt">
        <div className="container">
          <div className="info-columns">
            <article className="info-card">
              <h2>Destek saatleri</h2>
              <ul className="info-list">
                <li>
                  <Clock3 size={18} />
                  <div>
                    <strong>Hafta içi</strong>
                    <p>09:00 - 18:00 arasında canlı destek ve telefon hattı aktiftir.</p>
                  </div>
                </li>
                <li>
                  <Clock3 size={18} />
                  <div>
                    <strong>Cumartesi</strong>
                    <p>10:00 - 14:00 saatleri arasında e-posta ve sipariş desteği verilir.</p>
                  </div>
                </li>
                <li>
                  <Clock3 size={18} />
                  <div>
                    <strong>Pazar ve resmi tatiller</strong>
                    <p>Talepler alınır, takip eden ilk iş gününde dönüş yapılır.</p>
                  </div>
                </li>
              </ul>
            </article>

            <article className="info-card">
              <h2>Hızlı yönlendirmeler</h2>
              <p>
                En sık sorulan konular için aşağıdaki sayfalara gidebilirsiniz.
              </p>
              <div className="info-quick-links">
                <Link to="/sikca-sorulan-sorular" className="btn btn-outline">
                  S.S.S.
                </Link>
                <Link to="/kargo-ve-iade" className="btn btn-outline">
                  Kargo ve İade
                </Link>
                <Link to="/beden-rehberi" className="btn btn-outline">
                  Beden Rehberi
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
