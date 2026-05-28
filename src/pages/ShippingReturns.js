import { Link } from 'react-router-dom';
import './InfoPages.css';

const ShippingReturns = () => {
  return (
    <div className="info-page">
      <section className="info-hero">
        <div className="container">
          <div className="info-hero-content">
            <span className="info-eyebrow">Velado Policy</span>
            <h1 className="info-title">Kargo ve İade</h1>
            <p className="info-lead">
              Siparişinizin hazırlanma, kargolanma ve iade edilme sürecini adım adım
              bu sayfadan takip edebilirsiniz.
            </p>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="container">
          <div className="info-section-head">
            <h2>Kargo süreci</h2>
            <p>Sipariş oluşturulduktan teslimata kadar standart akış aşağıdaki gibidir.</p>
          </div>

          <div className="policy-steps">
            <article className="policy-step">
              <h3>Sipariş hazırlığı</h3>
              <p>
                Ödeme onayından sonra siparişiniz kalite kontrol ve paketleme için hazırlık
                aşamasına alınır.
              </p>
            </article>

            <article className="policy-step">
              <h3>Kargoya teslim</h3>
              <p>
                Hazırlanan siparişler genellikle 1-3 iş günü içinde kargo firmasına teslim edilir.
                Takip bilgisi kayıtlı iletişim kanalınıza iletilir.
              </p>
            </article>

            <article className="policy-step">
              <h3>Teslimat</h3>
              <p>
                Teslimat süresi bulunduğunuz bölgeye göre değişebilir. Paket elinize ulaştığında
                ambalajı kontrol ederek teslim almanız önerilir.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="info-section alt">
        <div className="container">
          <div className="info-section-head">
            <h2>İade koşulları</h2>
            <p>İade sürecinin sorunsuz ilerlemesi için aşağıdaki şartların sağlanması gerekir.</p>
          </div>

          <div className="policy-steps">
            <article className="policy-step">
              <h3>İade talebi oluşturun</h3>
              <p>Ürünü teslim aldıktan sonra 14 gün içinde destek ekibimizle iletişime geçin.</p>
            </article>

            <article className="policy-step">
              <h3>Ürünü uygun şekilde hazırlayın</h3>
              <ul>
                <li>Ürün kullanılmamış olmalıdır.</li>
                <li>Orijinal etiketleri çıkarılmamış olmalıdır.</li>
                <li>Koruyucu ambalaj ve aksesuarlar eksiksiz gönderilmelidir.</li>
              </ul>
            </article>

            <article className="policy-step">
              <h3>Kontrol ve geri ödeme</h3>
              <p>
                Depomuza ulaşan ürün incelendikten sonra uygun iade talepleri için geri ödeme
                aynı ödeme yöntemi üzerinden başlatılır.
              </p>
            </article>
          </div>

          <div className="info-note">
            Beden değişimi ihtiyacınız varsa önce <Link to="/beden-rehberi">beden rehberi</Link> sayfasına
            göz atabilir veya doğrudan <Link to="/iletisim">destek ekibine</Link> yazabilirsiniz.
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShippingReturns;
