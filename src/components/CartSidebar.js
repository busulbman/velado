import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import './CartSidebar.css';

const CartSidebar = () => {
  const { items, isCartOpen, closeCart, updateQuantity, removeFromCart, getSubtotal } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={closeCart} />
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>
            <ShoppingBag size={20} />
            Sepetim ({items.length})
          </h2>
          <button className="cart-close" onClick={closeCart}>
            <X size={24} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={48} strokeWidth={1} />
            <p>Sepetiniz boş</p>
            <Link to="/urunler" className="btn btn-primary" onClick={closeCart}>
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item, index) => (
                <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.images?.[0]} alt={item.name} />
                  </div>
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <div className="cart-item-meta">
                      {item.size && <span>Beden: {item.size}</span>}
                      {item.color && <span>Renk: {item.color}</span>}
                    </div>
                    <div className="cart-item-price">{formatPrice(item.price)}</div>
                    <div className="cart-item-actions">
                      <div className="quantity-control">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}>
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-subtotal">
                <span>Ara Toplam</span>
                <span>{formatPrice(getSubtotal())}</span>
              </div>
              <p className="cart-shipping-note">Kargo ücreti ödeme adımında hesaplanacaktır.</p>
              <Link to="/odeme" className="btn btn-primary cart-checkout-btn" onClick={closeCart}>
                Ödemeye Geç
              </Link>
              <button className="cart-continue" onClick={closeCart}>
                Alışverişe Devam Et
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
