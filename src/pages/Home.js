import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import Hero from '../components/Hero.js';
import ProductCard from '../components/ProductCard.js';
import { getProducts, getCategorySummariesFromProducts } from '../firebase/products.js';
import './Home.css';

const getPromoContent = ({ totalProducts, discountedProducts, newProducts }) => {
  if (discountedProducts > 0) {
    return {
      tag: 'İndirim',
      title: 'İndirimli Ürünler',
      description: `${discountedProducts} ürün şu anda indirim etiketiyle yayında.`,
      path: '/urunler?kategori=indirim',
      cta: 'İndirimleri Keşfet'
    };
  }

  if (newProducts > 0) {
    return {
      tag: 'Yeni Gelenler',
      title: 'Yeni Eklenen Ürünler',
      description: `${newProducts} ürün koleksiyona yeni eklendi.`,
      path: '/urunler?kategori=yeni',
      cta: 'Yeni Ürünleri Gör'
    };
  }

  if (totalProducts > 0) {
    return {
      tag: 'Koleksiyon',
      title: 'Tüm Koleksiyonu Keşfet',
      description: `Firestore katalogunda şu anda ${totalProducts} ürün yer alıyor.`,
      path: '/urunler',
      cta: 'Tüm Ürünleri Gör'
    };
  }

  return null;
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [catalogStats, setCatalogStats] = useState({
    totalProducts: 0,
    discountedProducts: 0,
    newProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCatalog = async () => {
      setLoading(true);

      try {
        const products = await getProducts();

        if (!isMounted) {
          return;
        }

        setCategories(getCategorySummariesFromProducts(products));
        setFeaturedProducts(products.filter((product) => product.featured).slice(0, 8));
        setCatalogStats({
          totalProducts: products.length,
          discountedProducts: products.filter((product) => Boolean(product.discount)).length,
          newProducts: products.filter((product) => Boolean(product.isNew)).length
        });
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
        if (isMounted) {
          setCategories([]);
          setFeaturedProducts([]);
          setCatalogStats({
            totalProducts: 0,
            discountedProducts: 0,
            newProducts: 0
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const promoContent = getPromoContent(catalogStats);

  return (
    <div className="home">
      <Hero />

      <section className="categories-section">
        <div className="container">
          <p className="section-subtitle">Koleksiyon</p>
          <h2 className="section-title">Kategorilere Göz At</h2>
          {loading ? (
            <div className="home-empty-state">
              <p>Kategoriler yükleniyor...</p>
            </div>
          ) : categories.length > 0 ? (
            <div className="categories-grid">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/urunler?kategori=${category.slug}`}
                  className="category-card"
                >
                  <div className="category-image">
                    {category.image ? (
                      <img src={category.image} alt={category.name} loading="lazy" />
                    ) : (
                      <div className="category-image-placeholder">
                        <span>{category.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    <span>{category.count} ürün <ArrowRight size={16} /></span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="home-empty-state">
              <p>Firestore'da henüz kategori bulunmuyor.</p>
            </div>
          )}
        </div>
      </section>

      <section className="products-section">
        <div className="container">
          <p className="section-subtitle">Öne Çıkanlar</p>
          <h2 className="section-title">Popüler Ürünler</h2>
          {loading ? (
            <div className="home-empty-state home-empty-state-light">
              <p>Öne çıkan ürünler yükleniyor...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="products-grid">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="products-cta">
                <Link to="/urunler" className="btn btn-outline">
                  Tüm Ürünleri Gör
                </Link>
              </div>
            </>
          ) : (
            <div className="home-empty-state home-empty-state-light">
              <p>Firestore'da öne çıkan ürün bulunmuyor.</p>
            </div>
          )}
        </div>
      </section>

      <section className="banner-section">
        <div className="container">
          {promoContent ? (
            <div className="banner">
              <div className="banner-content">
                <span className="banner-tag">{promoContent.tag}</span>
                <h2>{promoContent.title}</h2>
                <p>{promoContent.description}</p>
                <Link to={promoContent.path} className="btn btn-primary">
                  {promoContent.cta}
                </Link>
              </div>
            </div>
          ) : (
            <div className="home-empty-state">
              <p>Firestore'da gösterilecek kampanya içeriği bulunmuyor.</p>
            </div>
          )}
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature">
              <Truck size={32} strokeWidth={1.5} />
              <h4>Ücretsiz Kargo</h4>
              <p>500₺ üzeri siparişlerde</p>
            </div>
            <div className="feature">
              <RefreshCw size={32} strokeWidth={1.5} />
              <h4>Kolay İade</h4>
              <p>14 gün içinde ücretsiz</p>
            </div>
            <div className="feature">
              <Shield size={32} strokeWidth={1.5} />
              <h4>Güvenli Ödeme</h4>
              <p>256-bit SSL şifreleme</p>
            </div>
            <div className="feature">
              <Headphones size={32} strokeWidth={1.5} />
              <h4>7/24 Destek</h4>
              <p>Her zaman yanınızdayız</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
