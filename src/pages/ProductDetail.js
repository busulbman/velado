import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Minus, Plus, Truck, RefreshCw, Shield, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import ProductCard from '../components/ProductCard.js';
import { getProductById, getProducts, slugifyCategory } from '../firebase/products.js';
import { normalizeProductImages } from '../utils/productImages.js';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart, openCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const found = await getProductById(id);
        setProduct(found);
        if (found) {
          setSelectedImage(0);
          setSelectedSize(found.sizes?.[0] || null);
          setSelectedColor(found.colors?.[0] || null);
          const allProducts = await getProducts({ category: found.category });
          setRelatedProducts(allProducts.filter(p => p.id !== id).slice(0, 4));
        }
      } catch (error) {
        console.error('Ürün yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="product-loading">
        <p>Ürün yükleniyor...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <p>Ürün bulunamadı.</p>
        <Link to="/urunler" className="btn btn-primary">Ürünlere Dön</Link>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    openCart();
  };

  const categorySlug = slugifyCategory(product.category);
  const productImages = normalizeProductImages(product);
  const selectedImageUrl = productImages[selectedImage] || productImages[0] || '';

  return (
    <div className="product-detail">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Ana Sayfa</Link>
          <ChevronRight size={14} />
          <Link to="/urunler">Ürünler</Link>
          <ChevronRight size={14} />
          <Link to={categorySlug ? `/urunler?kategori=${categorySlug}` : '/urunler'}>
            {product.category}
          </Link>
          <ChevronRight size={14} />
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          <div className="product-gallery">
            <div className="gallery-main">
              {selectedImageUrl ? (
                <img src={selectedImageUrl} alt={product.name} />
              ) : (
                <div className="gallery-main-placeholder">
                  <ImageIcon size={32} />
                </div>
              )}
              {product.isNew && <span className="badge badge-new">Yeni</span>}
              {product.discount && <span className="badge badge-sale">%{product.discount}</span>}
            </div>
            {productImages.length > 1 && (
              <div className="gallery-thumbs">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`gallery-thumb ${selectedImage === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={img} alt={`${product.name} - ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <span className="product-category">{product.category}</span>
            <h1 className="product-name">{product.name}</h1>

            <div className={`product-price ${product.originalPrice || product.discount ? 'has-discount' : ''}`}>
              <span className="price-current">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="price-original">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <p className="product-description">{product.description}</p>

            {product.colors && (
              <div className="product-option">
                <label>Renk: <strong>{selectedColor}</strong></label>
                <div className="option-buttons">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      className={`option-btn ${selectedColor === color ? 'active' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && (
              <div className="product-option">
                <label>Beden: <strong>{selectedSize}</strong></label>
                <div className="option-buttons">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`option-btn size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <Minus size={16} />
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>
                  <Plus size={16} />
                </button>
              </div>

              <button className="btn btn-primary add-to-cart" onClick={handleAddToCart}>
                Sepete Ekle
              </button>

              <button
                className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="product-features">
              <div className="feature">
                <Truck size={20} />
                <span>500₺ üzeri ücretsiz kargo</span>
              </div>
              <div className="feature">
                <RefreshCw size={20} />
                <span>14 gün içinde ücretsiz iade</span>
              </div>
              <div className="feature">
                <Shield size={20} />
                <span>Güvenli ödeme</span>
              </div>
            </div>

            <div className="product-details">
              <h4>Ürün Detayları</h4>
              <ul>
                {product.material && <li><strong>Kumaş:</strong> {product.material}</li>}
                {product.care && <li><strong>Bakım:</strong> {product.care}</li>}
              </ul>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2 className="section-title">Benzer Ürünler</h2>
            <div className="related-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
