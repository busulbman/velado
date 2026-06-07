import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { AdminProvider, useAdmin } from './context/AdminContext.js';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import CartSidebar from './components/CartSidebar.js';
import Home from './pages/Home.js';
import Products from './pages/Products.js';
import ProductDetail from './pages/ProductDetail.js';
import Checkout from './pages/Checkout.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Account from './pages/Account.js';
import Contact from './pages/Contact.js';
import FAQ from './pages/FAQ.js';
import ShippingReturns from './pages/ShippingReturns.js';
import SizeGuide from './pages/SizeGuide.js';
import AdminLogin from './admin/AdminLogin.js';
import AdminSetup from './admin/AdminSetup.js';
import AdminDashboard from './admin/AdminDashboard.js';
import AdminProducts from './admin/AdminProducts.js';
import AdminOrders from './admin/AdminOrders.js';
import AdminCategories from './admin/AdminCategories.js';
import AdminSettings from './admin/AdminSettings.js';
import './styles/global.css';

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0b',
        color: '#71717a'
      }}>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/giris" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AdminProvider>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/kurulum" element={<AdminSetup />} />
              <Route path="/admin/giris" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/urunler"
                element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/siparisler"
                element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/siparisler/:id"
                element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/kategoriler"
                element={
                  <AdminRoute>
                    <AdminCategories />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/ayarlar"
                element={
                  <AdminRoute>
                    <AdminSettings />
                  </AdminRoute>
                }
              />

              {/* Public Routes */}
              <Route
                path="/*"
                element={
                  <div className="app">
                    <Header />
                    <main className="main-content">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/urunler" element={<Products />} />
                        <Route path="/urun/:id" element={<ProductDetail />} />
                        <Route path="/odeme" element={<Checkout />} />
                        <Route path="/giris" element={<Login />} />
                        <Route path="/kayit" element={<Register />} />
                        <Route path="/hesabim" element={<Account />} />
                        <Route path="/iletisim" element={<Contact />} />
                        <Route path="/sikca-sorulan-sorular" element={<FAQ />} />
                        <Route path="/kargo-ve-iade" element={<ShippingReturns />} />
                        <Route path="/beden-rehberi" element={<SizeGuide />} />
                      </Routes>
                    </main>
                    <Footer />
                    <CartSidebar />
                  </div>
                }
              />
            </Routes>
          </AdminProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
