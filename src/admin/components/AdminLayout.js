import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { useAdmin } from '../../context/AdminContext.js';
import logo from '../../assets/veladoLogo.png';
import './AdminLayout.css';

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/urunler', icon: Package, label: 'Ürünler' },
  { path: '/admin/siparisler', icon: ShoppingCart, label: 'Siparişler', showBadge: true },
  { path: '/admin/kategoriler', icon: Tags, label: 'Kategoriler' },
  { path: '/admin/ayarlar', icon: Settings, label: 'Ayarlar' }
];

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, adminLogout } = useAdmin();

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingOrdersCount(snapshot.docs.length);
    }, (error) => {
      console.error('Bekleyen siparişler dinlenirken hata:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/giris');
  };

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-logo">
            <img src={logo} alt="VELADO" className="admin-logo-image" />
            <span className="admin-logo-badge">Admin</span>
          </Link>
          <button
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.showBadge && pendingOrdersCount > 0 && (
                <span className="nav-badge">{pendingOrdersCount}</span>
              )}
              <ChevronRight size={16} className="admin-nav-arrow" />
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-user-avatar">
              {admin?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">Admin</span>
              <span className="admin-user-email">{admin?.email}</span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="admin-main">
        <header className="admin-header">
          <button
            className="admin-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="admin-header-title">
            {menuItems.find(item => isActive(item.path, item.exact))?.label || 'Admin Panel'}
          </div>
          {pendingOrdersCount > 0 && (
            <Link to="/admin/siparisler" className="header-notification">
              <ShoppingCart size={18} />
              <span className="header-notification-badge">{pendingOrdersCount}</span>
            </Link>
          )}
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
