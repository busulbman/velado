import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Grid, LayoutGrid, X } from 'lucide-react';
import ProductCard from '../components/ProductCard.js';
import {
  getProducts,
  getCategorySummariesFromProducts,
  slugifyCategory
} from '../firebase/products.js';
import './Products.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Öne Çıkanlar' },
  { value: 'newest', label: 'En Yeniler' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
];

const getCreatedAtTimestamp = (createdAt) => {
  if (!createdAt) {
    return 0;
  }

  if (typeof createdAt.toDate === 'function') {
    return createdAt.toDate().getTime();
  }

  if (typeof createdAt.seconds === 'number') {
    return createdAt.seconds * 1000;
  }

  const timestamp = new Date(createdAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState(4);
  const [loading, setLoading] = useState(true);

  const kategori = searchParams.get('kategori') || '';
  const siralama = searchParams.get('siralama') || 'featured';
  const arama = searchParams.get('arama') || '';
  const selectedCategory = categories.find((category) => category.slug === kategori) || null;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setAllProducts(data);
        setCategories(getCategorySummariesFromProducts(data));
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...allProducts];

    if (arama) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(arama.toLowerCase())
      );
    }

    if (kategori) {
      if (kategori === 'yeni') {
        filtered = filtered.filter(p => p.isNew);
      } else if (kategori === 'indirim') {
        filtered = filtered.filter(p => p.discount);
      } else {
        filtered = filtered.filter(p => slugifyCategory(p.category) === kategori);
      }
    }

    switch (siralama) {
      case 'featured':
        filtered.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
        break;
      case 'newest':
        filtered.sort((a, b) => getCreatedAtTimestamp(b.createdAt) - getCreatedAtTimestamp(a.createdAt));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setProducts(filtered);
  }, [allProducts, kategori, siralama, arama]);

  const handleCategoryChange = (categorySlug) => {
    const newParams = new URLSearchParams(searchParams);

    if (!categorySlug) {
      newParams.delete('kategori');
    } else {
      newParams.set('kategori', categorySlug);
    }

    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('siralama', e.target.value);
    setSearchParams(newParams);
  };

  const getPageTitle = () => {
    if (arama) return `"${arama}" için sonuçlar`;
    if (kategori === 'yeni') return 'Yeni Gelenler';
    if (kategori === 'indirim') return 'İndirimli Ürünler';

    if (selectedCategory) {
      return selectedCategory.name;
    }

    return 'Tüm Ürünler';
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="container">
          <h1>{getPageTitle()}</h1>
          <p>{loading ? 'Ürünler yükleniyor...' : `${products.length} ürün bulundu`}</p>
        </div>
      </div>

      <div className="container">
        <div className="products-toolbar">
          <button
            className="filter-toggle"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <SlidersHorizontal size={18} />
            Filtreler
          </button>

          <div className="toolbar-right">
            <select value={siralama} onChange={handleSortChange} className="sort-select">
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <div className="grid-toggle">
              <button
                className={gridCols === 3 ? 'active' : ''}
                onClick={() => setGridCols(3)}
              >
                <Grid size={18} />
              </button>
              <button
                className={gridCols === 4 ? 'active' : ''}
                onClick={() => setGridCols(4)}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="products-layout">
          <aside className={`products-filters ${isFilterOpen ? 'open' : ''}`}>
            <div className="filters-header">
              <h3>Filtreler</h3>
              <button className="filters-close" onClick={() => setIsFilterOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="filter-group">
              <h4>Kategori</h4>
              <div className="filter-options">
                <button
                  className={`filter-option ${!kategori ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('')}
                >
                  Tümü
                </button>
                {categories.map((category) => (
                  <button
                    key={category.slug}
                    className={`filter-option ${kategori === category.slug ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category.slug)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              {!loading && categories.length === 0 && (
                <p className="filter-empty">Firestore'da kategori bulunmuyor.</p>
              )}
            </div>
          </aside>

          <div className="products-content">
            {loading ? (
              <div className="loading">
                <p>Ürünler yükleniyor...</p>
              </div>
            ) : products.length > 0 ? (
              <div className={`products-grid cols-${gridCols}`}>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <p>
                  {allProducts.length === 0
                    ? "Firestore'da henüz ürün bulunmuyor."
                    : 'Aradığınız kriterlere uygun ürün bulunamadı.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="filters-overlay" onClick={() => setIsFilterOpen(false)} />
      )}
    </div>
  );
};

export default Products;
