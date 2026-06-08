import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './config.js';
import { normalizeProductData, prepareProductForSave } from '../utils/productImages.js';

const PRODUCTS_COLLECTION = 'products';
const TURKISH_CHAR_MAP = {
  c: 'c',
  C: 'c',
  g: 'g',
  G: 'g',
  i: 'i',
  I: 'i',
  o: 'o',
  O: 'o',
  s: 's',
  S: 's',
  u: 'u',
  U: 'u'
};

const normalizeCategoryName = (category) => {
  if (typeof category !== 'string') {
    return '';
  }

  return category.trim();
};

const replaceTurkishChars = (value) => (
  value
    .replace(/ç/g, TURKISH_CHAR_MAP.c)
    .replace(/Ç/g, TURKISH_CHAR_MAP.C)
    .replace(/ğ/g, TURKISH_CHAR_MAP.g)
    .replace(/Ğ/g, TURKISH_CHAR_MAP.G)
    .replace(/ı/g, TURKISH_CHAR_MAP.i)
    .replace(/İ/g, TURKISH_CHAR_MAP.I)
    .replace(/ö/g, TURKISH_CHAR_MAP.o)
    .replace(/Ö/g, TURKISH_CHAR_MAP.O)
    .replace(/ş/g, TURKISH_CHAR_MAP.s)
    .replace(/Ş/g, TURKISH_CHAR_MAP.S)
    .replace(/ü/g, TURKISH_CHAR_MAP.u)
    .replace(/Ü/g, TURKISH_CHAR_MAP.U)
);

export const slugifyCategory = (category) => (
  replaceTurkishChars(normalizeCategoryName(category))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
);

export const getCategorySummariesFromProducts = (products = []) => {
  const categoryMap = new Map();

  products.forEach((rawProduct) => {
    const product = normalizeProductData(rawProduct);
    const name = normalizeCategoryName(product.category);

    if (!name) {
      return;
    }

    const slug = slugifyCategory(name);

    if (!slug) {
      return;
    }

    const existing = categoryMap.get(slug);

    if (existing) {
      existing.count += 1;

      if (!existing.image && product.images?.[0]) {
        existing.image = product.images[0];
      }

      return;
    }

    categoryMap.set(slug, {
      name,
      slug,
      count: 1,
      image: product.images?.[0] || ''
    });
  });

  return Array.from(categoryMap.values()).sort((a, b) => (
    a.name.localeCompare(b.name, 'tr-TR')
  ));
};

export const getProductCategories = async () => {
  const products = await getProducts();
  return getCategorySummariesFromProducts(products);
};

export const getProducts = async (filters = {}) => {
  try {
    let q = collection(db, PRODUCTS_COLLECTION);
    const constraints = [];

    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    if (filters.featured) {
      constraints.push(where('featured', '==', true));
    }
    if (filters.orderByField) {
      constraints.push(orderBy(filters.orderByField, filters.orderDirection || 'asc'));
    }
    if (filters.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

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

export const getProductById = async (id) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return normalizeProductData({
        id: docSnap.id,
        ...docSnap.data()
      });
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const getProductsByCategory = async (category) => {
  return getProducts({ category });
};

export const getFeaturedProducts = async (count = 8) => {
  return getProducts({ featured: true, limitCount: count });
};

export const addProduct = async (productData) => {
  try {
    const normalizedProductData = prepareProductForSave(productData);
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...normalizedProductData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (id, updates) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const normalizedUpdates = prepareProductForSave(updates, { partial: true });
    await updateDoc(docRef, {
      ...normalizedUpdates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
