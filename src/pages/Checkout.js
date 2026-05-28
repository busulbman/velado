import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, Truck, Check } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { createOrder } from '../firebase/orders.js';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/giris', { state: { from: { pathname: '/odeme' } } });
    }
  }, [isAuthenticated, navigate]);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });

  const shippingCost = getSubtotal() >= 500 ? 0 : 49;
  const total = getSubtotal() + shippingCost;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      setStep(2);
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null
        })),
        shipping: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode
        },
        subtotal: getSubtotal(),
        shippingCost,
        total
      };

      await createOrder(orderData);
      setOrderComplete(true);
      clearCart();
    } catch (error) {
      console.error('Sipariş oluşturulurken hata:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="checkout-empty">
        <p>Sepetiniz boş.</p>
        <Link to="/urunler" className="btn btn-primary">Alışverişe Başla</Link>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="checkout-success">
        <div className="success-icon">
          <Check size={48} />
        </div>
        <h1>Siparişiniz Alındı!</h1>
        <p>Siparişiniz başarıyla oluşturuldu. Kısa süre içinde kargoya verilecektir.</p>
        <p className="order-number">Sipariş No: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        <Link to="/" className="btn btn-primary">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Ana Sayfa</Link>
          <ChevronRight size={14} />
          <span>Ödeme</span>
        </nav>

        <div className="checkout-steps">
          <div className={`checkout-step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Teslimat</span>
          </div>
          <div className="step-line" />
          <div className={`checkout-step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Ödeme</span>
          </div>
        </div>

        <div className="checkout-grid">
          <form className="checkout-form" onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="form-section">
                <h2><Truck size={20} /> Teslimat Bilgileri</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label>E-posta</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ad</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Soyad</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Telefon</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0XXX XXX XX XX"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full">
                    <label>Adres</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>İl</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>İlçe</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Posta Kodu</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg">
                  Ödemeye Geç
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="form-section">
                <h2><CreditCard size={20} /> Ödeme Bilgileri</h2>

                <div className="form-row">
                  <div className="form-group full">
                    <label>Kart Numarası</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="XXXX XXXX XXXX XXXX"
                      maxLength={19}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full">
                    <label>Kart Üzerindeki İsim</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Son Kullanma</label>
                    <input
                      type="text"
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      placeholder="AA/YY"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="XXX"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>
                    Geri
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                    {isProcessing ? 'İşleniyor...' : `${formatPrice(total)} Öde`}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="checkout-summary">
            <h3>Sipariş Özeti</h3>

            <div className="summary-items">
              {items.map((item, idx) => (
                <div key={idx} className="summary-item">
                  <div className="summary-item-image">
                    <img src={item.images?.[0]} alt={item.name} />
                    <span className="summary-item-qty">{item.quantity}</span>
                  </div>
                  <div className="summary-item-info">
                    <p>{item.name}</p>
                    {item.size && <span>Beden: {item.size}</span>}
                  </div>
                  <div className="summary-item-price">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Ara Toplam</span>
                <span>{formatPrice(getSubtotal())}</span>
              </div>
              <div className="summary-row">
                <span>Kargo</span>
                <span>{shippingCost === 0 ? 'Ücretsiz' : formatPrice(shippingCost)}</span>
              </div>
              <div className="summary-row total">
                <span>Toplam</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
