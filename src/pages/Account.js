import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { getUserOrders, ORDER_STATUS_LABELS } from '../firebase/orders.js';
import './Account.css';

const Account = () => {
  const navigate = useNavigate();
  const { user, userData, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/giris', { state: { from: { pathname: '/hesabim' } } });
      return;
    }

    const fetchOrders = async () => {
      try {
        const userOrders = await getUserOrders(user.uid);
        setOrders(userOrders);
      } catch (error) {
        console.error('Siparişler yüklenirken hata:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-header">
          <h1>Hesabım</h1>
          <p>Hoş geldiniz, {user.displayName || userData?.name || 'Kullanıcı'}</p>
        </div>

        <div className="account-grid">
          <aside className="account-sidebar">
            <nav className="account-nav">
              <button
                className={`account-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={20} />
                <span>Siparişlerim</span>
                <ChevronRight size={16} />
              </button>
              <button
                className={`account-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={20} />
                <span>Profil Bilgileri</span>
                <ChevronRight size={16} />
              </button>
              <button
                className={`account-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <MapPin size={20} />
                <span>Adreslerim</span>
                <ChevronRight size={16} />
              </button>
              <button
                className={`account-nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                <Heart size={20} />
                <span>Favorilerim</span>
                <ChevronRight size={16} />
              </button>
              <button className="account-nav-item logout" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Çıkış Yap</span>
              </button>
            </nav>
          </aside>

          <main className="account-content">
            {activeTab === 'orders' && (
              <div className="account-section">
                <h2>Siparişlerim</h2>
                {loadingOrders ? (
                  <div className="loading-state">
                    <p>Siparişler yükleniyor...</p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="orders-list">
                    {orders.map(order => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div>
                            <span className="order-id">Sipariş #{order.id.slice(-8).toUpperCase()}</span>
                            <span className="order-date">{formatDate(order.createdAt)}</span>
                          </div>
                          <span className={`order-status status-${order.status}`}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <div className="order-items">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="order-item">
                              <span>{item.name} x{item.quantity}</span>
                              <span>{formatPrice(item.price)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="order-footer">
                          <span className="order-total">Toplam: {formatPrice(order.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Package size={48} strokeWidth={1} />
                    <p>Henüz siparişiniz bulunmuyor.</p>
                    <Link to="/urunler" className="btn btn-primary">Alışverişe Başla</Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="account-section">
                <h2>Profil Bilgileri</h2>
                <form className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Ad Soyad</label>
                      <input type="text" defaultValue={user.displayName || userData?.name || ''} />
                    </div>
                    <div className="form-group">
                      <label>E-posta</label>
                      <input type="email" defaultValue={user.email} disabled />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Telefon</label>
                      <input type="tel" placeholder="0XXX XXX XX XX" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Kaydet</button>
                </form>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="account-section">
                <h2>Adreslerim</h2>
                <div className="empty-state">
                  <MapPin size={48} strokeWidth={1} />
                  <p>Kayıtlı adresiniz bulunmuyor.</p>
                  <button className="btn btn-primary">Adres Ekle</button>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="account-section">
                <h2>Favorilerim</h2>
                <div className="empty-state">
                  <Heart size={48} strokeWidth={1} />
                  <p>Favori ürününüz bulunmuyor.</p>
                  <Link to="/urunler" className="btn btn-primary">Ürünlere Göz At</Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Account;
