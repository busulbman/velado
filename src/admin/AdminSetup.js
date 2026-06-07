import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config.js';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import './AdminLogin.css';

const AdminSetup = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking, available, exists, creating, success, error
  const [error, setError] = useState('');

  const ADMIN_EMAIL = 'admin@velado.com';
  const ADMIN_PASSWORD = 'Velado2024!';

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const adminsSnapshot = await getDocs(collection(db, 'admins'));
      if (adminsSnapshot.empty) {
        setStatus('available');
      } else {
        setStatus('exists');
      }
    } catch (err) {
      console.error('Error checking admins:', err);
      setStatus('available');
    }
  };

  const createAdmin = async () => {
    setStatus('creating');
    setError('');

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        ADMIN_EMAIL,
        ADMIN_PASSWORD
      );

      // Add to admins collection
      await setDoc(doc(db, 'admins', userCredential.user.uid), {
        email: ADMIN_EMAIL,
        isAdmin: true,
        createdAt: new Date().toISOString()
      });

      setStatus('success');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin/giris');
      }, 3000);

    } catch (err) {
      console.error('Error creating admin:', err);

      if (err.code === 'auth/email-already-in-use') {
        // User exists in Auth but maybe not in admins collection
        // Try to sign in and add to admins
        setError('Bu email zaten kayıtlı. Firebase Console\'dan admins collection\'a manuel ekleyin.');
      } else if (err.code === 'auth/weak-password') {
        setError('Şifre çok zayıf.');
      } else {
        setError(err.message || 'Admin oluşturulurken hata oluştu.');
      }
      setStatus('error');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <Lock size={24} />
          </div>
          <h1>Admin Kurulumu</h1>
          <p>VELADO Yönetim Paneli</p>
        </div>

        <div className="admin-setup-content">
          {status === 'checking' && (
            <div className="setup-status">
              <div className="admin-spinner"></div>
              <p>Kontrol ediliyor...</p>
            </div>
          )}

          {status === 'exists' && (
            <div className="setup-status exists">
              <CheckCircle size={48} />
              <h2>Admin Hesabı Mevcut</h2>
              <p>Zaten bir admin hesabı oluşturulmuş.</p>
              <button
                className="admin-login-btn"
                onClick={() => navigate('/admin/giris')}
              >
                Giriş Sayfasına Git
              </button>
            </div>
          )}

          {status === 'available' && (
            <div className="setup-status available">
              <div className="setup-info">
                <h2>Admin Hesabı Oluştur</h2>
                <p>İlk admin hesabını oluşturmak için aşağıdaki butona tıklayın.</p>

                <div className="credentials-box">
                  <div className="credential-item">
                    <span className="credential-label">Email:</span>
                    <span className="credential-value">{ADMIN_EMAIL}</span>
                  </div>
                  <div className="credential-item">
                    <span className="credential-label">Şifre:</span>
                    <span className="credential-value">{ADMIN_PASSWORD}</span>
                  </div>
                </div>
              </div>

              <button className="admin-login-btn" onClick={createAdmin}>
                Admin Hesabı Oluştur
              </button>
            </div>
          )}

          {status === 'creating' && (
            <div className="setup-status">
              <div className="admin-spinner"></div>
              <p>Admin hesabı oluşturuluyor...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="setup-status success">
              <CheckCircle size={48} />
              <h2>Başarılı!</h2>
              <p>Admin hesabı oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...</p>

              <div className="credentials-box">
                <div className="credential-item">
                  <span className="credential-label">Email:</span>
                  <span className="credential-value">{ADMIN_EMAIL}</span>
                </div>
                <div className="credential-item">
                  <span className="credential-label">Şifre:</span>
                  <span className="credential-value">{ADMIN_PASSWORD}</span>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="setup-status error">
              <AlertCircle size={48} />
              <h2>Hata</h2>
              <p>{error}</p>
              <button
                className="admin-login-btn"
                onClick={() => setStatus('available')}
              >
                Tekrar Dene
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
