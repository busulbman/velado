import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Truck, Check, Building2, Banknote, Copy, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { createOrder } from '../firebase/orders.js';
import { getSettings } from '../firebase/admin.js';
import { normalizeProductImages } from '../utils/productImages.js';
import './Checkout.css';

const PAYMENT_INFO = {
  iban: 'TR00 0000 0000 0000 0000 0000 00',
  accountName: 'VELADO TEKSTİL',
  description: 'Sipariş numaranızı açıklama kısmına yazmayı unutmayın.'
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingLimit: 1000,
    shippingCost: 49
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/giris', { state: { from: { pathname: '/odeme' } } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettings();
        setShippingSettings({
          freeShippingLimit: settings.freeShippingLimit || 1000,
          shippingCost: settings.shippingCost || 49
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [copiedIban, setCopiedIban] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    paymentMethod: 'bank_transfer',
    orderNote: ''
  });

  const shippingCost = getSubtotal() >= shippingSettings.freeShippingLimit ? 0 : shippingSettings.shippingCost;
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

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT_INFO.iban.replace(/\s/g, ''));
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    } catch (err) {
      console.error('IBAN kopyalanamadı:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      setStep(2);
      return;
    }

    setIsProcessing(true);

    try {
      const newOrderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();

      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          images: normalizeProductImages(item),
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
        paymentMethod: formData.paymentMethod,
        paymentMethodLabel: formData.paymentMethod === 'bank_transfer' ? 'Havale / EFT' : 'Kapıda Ödeme',
        orderNote: formData.orderNote || '',
        orderNumber: newOrderNumber,
        subtotal: getSubtotal(),
        shippingCost,
        total
      };

      await createOrder(orderData);
      setOrderNumber(newOrderNumber);
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
        <p>Siparişiniz başarıyla oluşturuldu.</p>
        <p className="order-number">Sipariş No: #{orderNumber}</p>

        {formData.paymentMethod === 'bank_transfer' && (
          <div className="bank-info-success">
            <h3>Ödeme Bilgileri</h3>
            <p>Aşağıdaki hesaba havale/EFT yaparak ödemenizi tamamlayın:</p>
            <div className="bank-details">
              <div className="bank-detail-row">
                <span>IBAN:</span>
                <strong>{PAYMENT_INFO.iban}</strong>
              </div>
              <div className="bank-detail-row">
                <span>Alıcı:</span>
                <strong>{PAYMENT_INFO.accountName}</strong>
              </div>
              <div className="bank-detail-row">
                <span>Açıklama:</span>
                <strong>#{orderNumber}</strong>
              </div>
            </div>
            <p className="bank-note">Sipariş numaranızı açıklama kısmına yazmayı unutmayın.</p>
          </div>
        )}

        {formData.paymentMethod === 'cash_on_delivery' && (
          <div className="cod-info-success">
            <p>Ödemenizi kapıda nakit veya kredi kartı ile yapabilirsiniz.</p>
          </div>
        )}

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
                <h2><Banknote size={20} /> Ödeme Yöntemi</h2>

                <div className="payment-methods">
                  <label
                    className={`payment-method ${formData.paymentMethod === 'bank_transfer' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-method-icon">
                      <Building2 size={24} />
                    </div>
                    <div className="payment-method-content">
                      <span className="payment-method-title">Havale / EFT</span>
                      <span className="payment-method-desc">Banka havalesi ile ödeme yapın</span>
                    </div>
                    <div className="payment-method-check">
                      <CheckCircle size={20} />
                    </div>
                  </label>

                  <label
                    className={`payment-method ${formData.paymentMethod === 'cash_on_delivery' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-method-icon">
                      <Banknote size={24} />
                    </div>
                    <div className="payment-method-content">
                      <span className="payment-method-title">Kapıda Ödeme</span>
                      <span className="payment-method-desc">Teslimat sırasında nakit veya kart ile ödeyin</span>
                    </div>
                    <div className="payment-method-check">
                      <CheckCircle size={20} />
                    </div>
                  </label>
                </div>

                {formData.paymentMethod === 'bank_transfer' && (
                  <div className="bank-transfer-info">
                    <h3>Banka Hesap Bilgileri</h3>
                    <div className="bank-info-card">
                      <div className="bank-info-row">
                        <span className="bank-info-label">IBAN</span>
                        <div className="bank-info-value">
                          <span>{PAYMENT_INFO.iban}</span>
                          <button
                            type="button"
                            className="copy-btn"
                            onClick={copyIban}
                          >
                            {copiedIban ? <CheckCircle size={16} /> : <Copy size={16} />}
                            {copiedIban ? 'Kopyalandı' : 'Kopyala'}
                          </button>
                        </div>
                      </div>
                      <div className="bank-info-row">
                        <span className="bank-info-label">Alıcı Adı</span>
                        <span className="bank-info-value">{PAYMENT_INFO.accountName}</span>
                      </div>
                      <div className="bank-info-note">
                        <p>{PAYMENT_INFO.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group full">
                    <label>Sipariş Notu (Opsiyonel)</label>
                    <textarea
                      name="orderNote"
                      value={formData.orderNote}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Siparişinizle ilgili eklemek istediğiniz bir not varsa yazabilirsiniz..."
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>
                    Geri
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                    {isProcessing ? 'İşleniyor...' : 'Siparişi Tamamla'}
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
                    <img src={normalizeProductImages(item)[0]} alt={item.name} />
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
