import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Image as ImageIcon } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { isProductSoldOut, normalizeProductImages } from '../utils/productImages.js';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart, openCart } = useCart();

  const {
    id,
    name,
    price,
    originalPrice,
    category,
    isNew,
    discount
  } = product;
  const productImages = normalizeProductImages(product);
  const soldOut = isProductSoldOut(product);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (soldOut) {
      return;
    }

    addToCart(product, 1);
    openCart();
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Link
      to={`/urun/${id}`}
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`product-card-image ${soldOut ? 'sold-out' : ''}`}>
        {productImages[0] ? (
          <img
            src={isHovered && productImages[1] ? productImages[1] : productImages[0]}
            alt={name}
            loading="lazy"
          />
        ) : (
          <div className="product-card-image-placeholder">
            <ImageIcon size={28} />
          </div>
        )}

        {(soldOut || isNew || discount) && (
          <div className="product-card-badges">
            {soldOut && <span className="badge badge-sold-out">Tükendi</span>}
            {isNew && <span className="badge badge-new">Yeni</span>}
            {discount && <span className="badge badge-sale">%{discount}</span>}
          </div>
        )}

        <button
          className={`product-card-favorite ${isFavorite ? 'active' : ''}`}
          onClick={handleFavorite}
          aria-label="Favorilere ekle"
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        <div className={`product-card-actions ${isHovered ? 'visible' : ''}`}>
          <button className="btn btn-primary" onClick={handleAddToCart} disabled={soldOut}>
            <ShoppingBag size={16} />
            {soldOut ? 'Tükendi' : 'Sepete Ekle'}
          </button>
        </div>
      </div>

      <div className="product-card-info">
        <span className="product-card-category">{category}</span>
        <h3 className="product-card-name">{name}</h3>
        <div className="product-card-price">
          <span className="price-current">{formatPrice(price)}</span>
          {originalPrice && (
            <span className="price-original">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
