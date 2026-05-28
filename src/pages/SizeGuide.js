import { Ruler, Shirt, Sparkles } from 'lucide-react';
import './InfoPages.css';

const TOP_SIZE_ROWS = [
  { size: 'S', chest: '88 - 94', waist: '76 - 82', shoulder: '43 - 45' },
  { size: 'M', chest: '95 - 101', waist: '83 - 89', shoulder: '45 - 47' },
  { size: 'L', chest: '102 - 108', waist: '90 - 96', shoulder: '47 - 49' },
  { size: 'XL', chest: '109 - 116', waist: '97 - 104', shoulder: '49 - 51' },
];

const BOTTOM_SIZE_ROWS = [
  { size: '29', waist: '74 - 77', hip: '90 - 94', inseam: '79 - 81' },
  { size: '30', waist: '78 - 81', hip: '95 - 98', inseam: '80 - 82' },
  { size: '32', waist: '82 - 86', hip: '99 - 102', inseam: '81 - 83' },
  { size: '34', waist: '87 - 91', hip: '103 - 106', inseam: '82 - 84' },
  { size: '36', waist: '92 - 96', hip: '107 - 110', inseam: '83 - 85' },
];

const SizeGuide = () => {
  return (
    <div className="info-page">
      <section className="info-hero">
        <div className="container">
          <div className="info-hero-content">
            <span className="info-eyebrow">Velado Fit Guide</span>
            <h1 className="info-title">Beden Rehberi</h1>
            <p className="info-lead">
              Doğru bedeni seçmek için temel vücut ölçülerinizi kullanın. Aşağıdaki tablolar
              gömlek, ceket ve pantolon seçiminde hızlı referans sunar.
            </p>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="container">
          <div className="info-grid">
            <article className="info-card">
              <div className="info-card-icon">
                <Ruler size={22} />
              </div>
              <h3>Göğüs ölçüsü</h3>
              <p>Metreyi koltuk altı hizasından, göğsün en geniş noktasından geçirerek alın.</p>
            </article>

            <article className="info-card">
              <div className="info-card-icon">
                <Shirt size={22} />
              </div>
              <h3>Bel ve kalça</h3>
              <p>Bel ölçüsünü doğal bel hattından, kalça ölçüsünü kalçanın en geniş bölümünden alın.</p>
            </article>

            <article className="info-card">
              <div className="info-card-icon">
                <Sparkles size={22} />
              </div>
              <h3>Fit önerisi</h3>
              <p>İki beden arasında kalıyorsanız daha rahat kalıp için büyük bedeni tercih edin.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="info-section alt">
        <div className="container">
          <div className="info-section-head">
            <h2>Üst giyim ölçü tablosu</h2>
            <p>Gömlek, tişört, triko ve ceket ürünlerinde referans alınabilir. Tüm ölçüler cm cinsindendir.</p>
          </div>

          <div className="size-table-wrap">
            <table className="size-table">
              <thead>
                <tr>
                  <th>Beden</th>
                  <th>Göğüs</th>
                  <th>Bel</th>
                  <th>Omuz</th>
                </tr>
              </thead>
              <tbody>
                {TOP_SIZE_ROWS.map((row) => (
                  <tr key={row.size}>
                    <td>{row.size}</td>
                    <td>{row.chest}</td>
                    <td>{row.waist}</td>
                    <td>{row.shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="size-hint">Üst giyimde daha dar bir görünüm isterseniz kendi ölçünüze en yakın alt sınırı baz alın.</p>
        </div>
      </section>

      <section className="info-section">
        <div className="container">
          <div className="info-section-head">
            <h2>Alt giyim ölçü tablosu</h2>
            <p>Pantolon ve benzeri alt giyim ürünleri için vücut ölçüsüne göre hazırlanmıştır.</p>
          </div>

          <div className="size-table-wrap">
            <table className="size-table">
              <thead>
                <tr>
                  <th>Beden</th>
                  <th>Bel</th>
                  <th>Kalça</th>
                  <th>İç bacak</th>
                </tr>
              </thead>
              <tbody>
                {BOTTOM_SIZE_ROWS.map((row) => (
                  <tr key={row.size}>
                    <td>{row.size}</td>
                    <td>{row.waist}</td>
                    <td>{row.hip}</td>
                    <td>{row.inseam}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="info-note">
            Ölçüler arasında kararsız kalırsanız ürün sayfasındaki açıklamayı kontrol edin veya destek ekibine danışın.
          </div>
        </div>
      </section>
    </div>
  );
};

export default SizeGuide;
