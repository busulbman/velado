import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  X,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Save,
  Building2,
  Banknote,
  Bell
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { getOrderById, updateOrderStatus } from '../firebase/admin.js';
import { ORDER_STATUS_LABELS } from '../firebase/orders.js';
import { normalizeProductImages } from '../utils/productImages.js';
import AdminLayout from './components/AdminLayout.js';
import './AdminOrders.css';

const statusOptions = [
  { value: 'pending', label: 'Yeni Sipariş', icon: Clock },
  { value: 'processing', label: 'Hazırlanıyor', icon: Package },
  { value: 'shipped', label: 'Kargoya Verildi', icon: Truck },
  { value: 'delivered', label: 'Teslim Edildi', icon: CheckCircle },
  { value: 'cancelled', label: 'İptal Edildi', icon: X }
];

const notificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;

    oscillator.start();
    setTimeout(() => {
      oscillator.frequency.value = 1000;
    }, 100);
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 200);
  } catch (e) {
    console.log('Ses çalınamadı:', e);
  }
};

const AdminOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const previousOrdersCount = useRef(0);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (!isInitialLoad.current && ordersData.length > previousOrdersCount.current) {
        const newOrder = ordersData[0];
        setNewOrderAlert(newOrder);
        notificationSound();

        setTimeout(() => {
          setNewOrderAlert(null);
        }, 10000);
      }

      previousOrdersCount.current = ordersData.length;
      isInitialLoad.current = false;
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Siparişler dinlenirken hata:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-orders">
        {newOrderAlert && (
          <div className="new-order-notification">
            <div className="notification-icon">
              <Bell size={20} />
            </div>
            <div className="notification-content">
              <strong>Yeni Sipariş Geldi!</strong>
              <span>
                #{newOrderAlert.orderNumber || newOrderAlert.id.slice(-8).toUpperCase()} - {newOrderAlert.shipping?.firstName} {newOrderAlert.shipping?.lastName}
              </span>
            </div>
            <button
              className="notification-close"
              onClick={() => setNewOrderAlert(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="orders-header">
          <div className="orders-header-left">
            <h1>Siparişler</h1>
            <span className="orders-count">{orders.length} sipariş</span>
          </div>
        </div>

        <div className="orders-filters">
          <div className="search-input">
            <Search size={18} />
            <input
              type="text"
              placeholder="Sipariş no, müşteri adı veya e-posta ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Tüm Durumlar</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Sipariş No</th>
                <th>Müşteri</th>
                <th>Tarih</th>
                <th>Tutar</th>
                <th>Ödeme</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span className="order-id">
                      #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-name">
                        {order.shipping?.firstName} {order.shipping?.lastName}
                      </span>
                      <span className="customer-email">{order.userEmail}</span>
                    </div>
                  </td>
                  <td>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </td>
                  <td>
                    <span className="order-total">{formatPrice(order.total)}</span>
                  </td>
                  <td>
                    <span className={`payment-badge ${order.paymentMethod === 'bank_transfer' ? 'bank' : 'cod'}`}>
                      {order.paymentMethod === 'bank_transfer' ? (
                        <>
                          <Building2 size={14} />
                          Havale
                        </>
                      ) : (
                        <>
                          <Banknote size={14} />
                          Kapıda
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <span className={`order-status-badge status-${order.status}`}>
                      {ORDER_STATUS_LABELS[order.status] || 'Yeni Sipariş'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/siparisler/${order.id}`} className="view-btn">
                      Detay
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="empty-state">
              <Package size={48} />
              <p>Sipariş bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrderById(id);
      setOrder(data);
      setSelectedStatus(data?.status || 'pending');
      setTrackingNumber(data?.trackingNumber || '');
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleSaveStatus = async () => {
    if (!selectedStatus) return;

    setSaving(true);
    try {
      await updateOrderStatus(id, selectedStatus, trackingNumber || null);
      await fetchOrder();
      alert('Sipariş durumu güncellendi.');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Hata oluştu.');
    } finally {
      setSaving(false);
    }
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="empty-state">
          <Package size={48} />
          <p>Sipariş bulunamadı.</p>
          <Link to="/admin/siparisler" className="btn-secondary">
            Siparişlere Dön
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="order-detail">
        <div className="order-detail-header">
          <button className="back-btn" onClick={() => navigate('/admin/siparisler')}>
            <ArrowLeft size={18} />
            Geri
          </button>
          <div className="order-detail-title">
            <h1>Sipariş #{order.orderNumber || order.id.slice(-8).toUpperCase()}</h1>
            <span className={`order-status-badge status-${order.status}`}>
              {ORDER_STATUS_LABELS[order.status] || 'Yeni Sipariş'}
            </span>
          </div>
        </div>

        <div className="order-detail-grid">
          <div className="order-detail-main">
            <div className="order-card">
              <h3>Ürünler</h3>
              <div className="order-items">
                {order.items?.map((item, idx) => {
                  const itemImages = normalizeProductImages(item);

                  return (
                    <div key={idx} className="order-item">
                      <div className="order-item-image">
                        {itemImages[0] ? (
                          <img src={itemImages[0]} alt={item.name} />
                        ) : (
                          <Package size={24} />
                        )}
                      </div>
                      <div className="order-item-info">
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-meta">
                          {item.size && `Beden: ${item.size}`}
                          {item.size && item.color && ' • '}
                          {item.color && `Renk: ${item.color}`}
                        </span>
                      </div>
                      <div className="order-item-qty">x{item.quantity}</div>
                      <div className="order-item-price">{formatPrice(item.price)}</div>
                    </div>
                  );
                })}
              </div>

              <div className="order-totals">
                <div className="order-total-row">
                  <span>Ara Toplam</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="order-total-row">
                  <span>Kargo</span>
                  <span>{order.shippingCost === 0 ? 'Ücretsiz' : formatPrice(order.shippingCost)}</span>
                </div>
                <div className="order-total-row total">
                  <span>Toplam</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="order-card">
              <h3>Durum Güncelle</h3>
              <div className="status-form">
                <div className="status-options">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      className={`status-option ${selectedStatus === opt.value ? 'active' : ''}`}
                      onClick={() => setSelectedStatus(opt.value)}
                    >
                      <opt.icon size={18} />
                      {opt.label}
                    </button>
                  ))}
                </div>

                {(selectedStatus === 'shipped' || order.status === 'shipped') && (
                  <div className="form-group">
                    <label>Kargo Takip No</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Takip numarası girin..."
                    />
                  </div>
                )}

                <button
                  className="btn-primary"
                  onClick={handleSaveStatus}
                  disabled={saving || selectedStatus === order.status}
                >
                  <Save size={18} />
                  {saving ? 'Kaydediliyor...' : 'Durumu Kaydet'}
                </button>
              </div>
            </div>
          </div>

          <div className="order-detail-sidebar">
            <div className="order-card">
              <h3>Ödeme Bilgisi</h3>
              <div className="payment-info">
                <div className={`payment-type ${order.paymentMethod === 'bank_transfer' ? 'bank' : 'cod'}`}>
                  {order.paymentMethod === 'bank_transfer' ? (
                    <>
                      <Building2 size={20} />
                      <span>Havale / EFT</span>
                    </>
                  ) : (
                    <>
                      <Banknote size={20} />
                      <span>Kapıda Ödeme</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="order-card">
              <h3>Müşteri Bilgileri</h3>
              <div className="customer-info">
                <div className="info-item">
                  <Mail size={16} />
                  <span>{order.userEmail}</span>
                </div>
                <div className="info-item">
                  <Phone size={16} />
                  <span>{order.shipping?.phone || '-'}</span>
                </div>
              </div>
            </div>

            <div className="order-card">
              <h3>Teslimat Adresi</h3>
              <div className="address-info">
                <div className="info-item">
                  <MapPin size={16} />
                  <div>
                    <strong>{order.shipping?.firstName} {order.shipping?.lastName}</strong>
                    <p>{order.shipping?.address}</p>
                    <p>{order.shipping?.district}, {order.shipping?.city}</p>
                    {order.shipping?.postalCode && <p>{order.shipping.postalCode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {order.orderNote && (
              <div className="order-card">
                <h3>Sipariş Notu</h3>
                <p className="order-note-text">{order.orderNote}</p>
              </div>
            )}

            <div className="order-card">
              <h3>Sipariş Bilgileri</h3>
              <div className="order-info-list">
                <div className="info-row">
                  <span>Oluşturulma</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                {order.shippedAt && (
                  <div className="info-row">
                    <span>Kargoya Verildi</span>
                    <span>{formatDate(order.shippedAt)}</span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="info-row">
                    <span>Teslim Edildi</span>
                    <span>{formatDate(order.deliveredAt)}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="info-row">
                    <span>Takip No</span>
                    <span className="tracking-number">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminOrders = () => {
  const { id } = useParams();
  return id ? <AdminOrderDetail /> : <AdminOrdersList />;
};

export default AdminOrders;
