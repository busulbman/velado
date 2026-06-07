import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config.js';
import { checkIsAdmin } from '../firebase/admin.js';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminStatus = await checkIsAdmin(user.uid);
        if (adminStatus) {
          setAdmin(user);
          setIsAdmin(true);
        } else {
          setAdmin(null);
          setIsAdmin(false);
        }
      } else {
        setAdmin(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const adminLogin = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const adminStatus = await checkIsAdmin(result.user.uid);

      if (!adminStatus) {
        await signOut(auth);
        throw new Error('Bu hesap admin yetkisine sahip değil.');
      }

      setAdmin(result.user);
      setIsAdmin(true);
      return result.user;
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        throw new Error('E-posta veya şifre hatalı.');
      }
      throw error;
    }
  };

  const adminLogout = async () => {
    await signOut(auth);
    setAdmin(null);
    setIsAdmin(false);
  };

  const value = {
    admin,
    isAdmin,
    loading,
    adminLogin,
    adminLogout
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
