import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
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
import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
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
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
