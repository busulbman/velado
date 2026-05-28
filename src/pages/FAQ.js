import { Link } from 'react-router-dom';
import './InfoPages.css';

const FAQ_GROUPS = [
  {
    title: 'Sipariş ve ödeme',
    items: [
      {
        question: 'Siparişim ne zaman onaylanır?',
        answer:
          'Ödeme onayı alındıktan sonra siparişiniz otomatik olarak işleme alınır. Yoğun dönemler dışında onay süreci genellikle kısa süre içinde tamamlanır.',
      },
      {
        question: 'Kapıda ödeme seçeneği var mı?',
        answer:
          'Şu an ödeme adımında kart ile güvenli ödeme akışı kullanılmaktadır. Yeni ödeme yöntemleri eklendiğinde bu sayfa güncellenir.',
      },
      {
        question: 'Siparişime sonradan ürün ekleyebilir miyim?',
        answer:
          'Sipariş onaylandıktan sonra içerik değişikliği yapılamaz. Yeni ürün için ayrı sipariş oluşturmanız gerekir.',
      },
    ],
  },
  {
    title: 'Teslimat ve kargo',
    items: [
      {
        question: 'Kargoya veriliş süresi nedir?',
        answer:
          'Hazırlanan siparişler standart olarak 1-3 iş günü içinde kargoya teslim edilir. Kampanya dönemlerinde bu süre uzayabilir.',
      },
      {
        question: 'Kargo takibini nereden yaparım?',
        answer:
          'Siparişiniz kargoya teslim edildiğinde size bilgilendirme e-postası gönderilir. Takip numarası üzerinden gönderinizi izleyebilirsiniz.',
      },
      {
        question: 'Teslimat sırasında adreste olmazsam ne olur?',
        answer:
          'Kargo firması ikinci teslimat denemesi yapabilir veya paketi en yakın şubeye yönlendirebilir. Detay, ilgili kargo firmasının işlemine göre değişir.',
      },
    ],
  },
  {
    title: 'İade ve değişim',
    items: [
      {
        question: 'İade sürem kaç gün?',
        answer:
          'Teslim edilen ürünleri kullanılmamış ve etiketi çıkarılmamış durumda olmak koşuluyla 14 gün içinde iade edebilirsiniz.',
      },
      {
        question: 'Değişim yapabiliyor muyum?',
        answer:
          'Stok durumuna bağlı olarak beden değişimi için destek ekibi yardımcı olur. Uygun stok yoksa iade veya yeni sipariş önerilir.',
      },
      {
        question: 'İade ücretini kim karşılıyor?',
        answer:
          'Onaylı iade süreçlerinde yönlendirilen kargo adımları kullanıldığında ekibimiz size uygun süreç bilgisini paylaşır.',
      },
    ],
  },
];

const FAQ = () => {
  return (
    <div className="info-page">
      <section className="info-hero">
        <div className="container">
          <div className="info-hero-content">
            <span className="info-eyebrow">Velado Guide</span>
            <h1 className="info-title">Sıkça Sorulan Sorular</h1>
            <p className="info-lead">
              Siparişten teslimata, iade sürecinden ürün seçimine kadar en sık gelen
              soruları tek sayfada topladık.
            </p>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="container">
          {FAQ_GROUPS.map((group) => (
            <div key={group.title} className="faq-group">
              <h3>{group.title}</h3>
              {group.items.map((item) => (
                <details key={item.question} className="faq-item">
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          ))}

          <div className="info-note">
            Sorunuz burada yoksa <Link to="/iletisim">iletişim sayfası</Link> üzerinden bize ulaşabilirsiniz.
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
