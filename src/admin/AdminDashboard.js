import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { getDashboardStats } from '../firebase/admin.js';
import { ORDER_STATUS_LABELS } from '../firebase/orders.js';
import AdminLayout from './components/AdminLayout.js';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
      month: 'short',
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

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>VELADO mağaza istatistikleri</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Toplam Gelir</span>
              <span className="stat-value">{formatPrice(stats?.totalRevenue || 0)}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-success">
              <ShoppingCart size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Toplam Sipariş</span>
              <span className="stat-value">{stats?.totalOrders || 0}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Bugünkü Sipariş</span>
              <span className="stat-value">{stats?.todayOrders || 0}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-accent">
              <Package size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Toplam Ürün</span>
              <span className="stat-value">{stats?.totalProducts || 0}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2>Son Siparişler</h2>
              <Link to="/admin/siparisler" className="dashboard-card-link">
                Tümünü Gör <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="dashboard-card-content">
              {stats?.recentOrders?.length > 0 ? (
                <div className="recent-orders">
                  {stats.recentOrders.slice(0, 5).map((order) => (
                    <Link
                      key={order.id}
                      to={`/admin/siparisler/${order.id}`}
                      className="recent-order-item"
                    >
                      <div className="recent-order-info">
                        <span className="recent-order-id">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="recent-order-date">
                          <Clock size={14} />
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className="recent-order-meta">
                        <span className={`order-status-badge status-${order.status}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                        <span className="recent-order-total">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <ShoppingCart size={32} />
                  <p>Henüz sipariş bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2>Hızlı Bilgiler</h2>
            </div>
            <div className="dashboard-card-content">
              <div className="quick-stats">
                <div className="quick-stat-item">
                  <span className="quick-stat-label">Bekleyen Siparişler</span>
                  <span className="quick-stat-value warning">
                    {stats?.pendingOrders || 0}
                  </span>
                </div>
                <div className="quick-stat-item">
                  <span className="quick-stat-label">Aktif Ürünler</span>
                  <span className="quick-stat-value success">
                    {stats?.activeProducts || 0}
                  </span>
                </div>
                <div className="quick-stat-item">
                  <span className="quick-stat-label">Bugünkü Gelir</span>
                  <span className="quick-stat-value primary">
                    {formatPrice(stats?.todayRevenue || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
