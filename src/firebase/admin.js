import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  setDoc
} from 'firebase/firestore';
import { db } from './config.js';
import { normalizeProductData, prepareProductForSave } from '../utils/productImages.js';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const CATEGORIES_COLLECTION = 'categories';
const SETTINGS_COLLECTION = 'settings';
const ADMINS_COLLECTION = 'admins';

// Admin Authentication
export const checkIsAdmin = async (userId) => {
  try {
    const docRef = doc(db, ADMINS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() && docSnap.data().isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Products Management
export const getAllProducts = async () => {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((productDoc) => normalizeProductData({
      id: productDoc.id,
      ...productDoc.data()
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const createProduct = async (productData) => {
  try {
    const normalizedProductData = prepareProductForSave(productData);
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...normalizedProductData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (productId, updates) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const normalizedUpdates = prepareProductForSave(updates);
    await updateDoc(docRef, {
      ...normalizedUpdates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const toggleProductActive = async (productId, isActive) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      isActive,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error toggling product status:', error);
    throw error;
  }
};

// Orders Management
export const getAllOrders = async () => {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const getOrderById = async (orderId) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

export const updateOrderStatus = async (orderId, status, trackingNumber = null) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const updates = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (trackingNumber) {
      updates.trackingNumber = trackingNumber;
    }

    if (status === 'shipped') {
      updates.shippedAt = new Date().toISOString();
    } else if (status === 'delivered') {
      updates.deliveredAt = new Date().toISOString();
    }

    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

// Categories Management
export const getAllCategories = async () => {
  try {
    const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const createCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      ...categoryData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId, updates) => {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Settings Management
export const getSettings = async () => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'general');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }

    // Default settings
    return {
      freeShippingLimit: 1000,
      shippingCost: 49,
      shippingCarrier: 'Yurtiçi Kargo'
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {
      freeShippingLimit: 1000,
      shippingCost: 49,
      shippingCarrier: 'Yurtiçi Kargo'
    };
  }
};

export const updateSettings = async (settings) => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'general');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// Dashboard Stats
export const getDashboardStats = async () => {
  try {
    const [productsSnapshot, ordersSnapshot] = await Promise.all([
      getDocs(collection(db, PRODUCTS_COLLECTION)),
      getDocs(collection(db, ORDERS_COLLECTION))
    ]);

    const products = productsSnapshot.docs.map(doc => doc.data());
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today;
    });

    const totalRevenue = orders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + (order.total || 0), 0);

    const todayRevenue = todayOrders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + (order.total || 0), 0);

    return {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive !== false).length,
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      todayRevenue,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      recentOrders: orders.slice(0, 10)
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalProducts: 0,
      activeProducts: 0,
      totalOrders: 0,
      todayOrders: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      pendingOrders: 0,
      recentOrders: []
    };
  }
};

// Campaigns Management
export const createCampaign = async (productId, campaignData) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      campaign: {
        ...campaignData,
        createdAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

export const removeCampaign = async (productId) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      campaign: null,
      discount: null,
      originalPrice: null,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error removing campaign:', error);
    throw error;
  }
};
