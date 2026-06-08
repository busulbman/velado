import { createContext, useContext, useState, useEffect } from 'react';
import { getProductStockQuantity, isProductSoldOut, normalizeProductData } from '../utils/productImages.js';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('velado_cart');
    if (!saved) {
      return [];
    }

    try {
      const parsedItems = JSON.parse(saved);
      return Array.isArray(parsedItems)
        ? parsedItems.map((item) => normalizeProductData(item))
        : [];
    } catch (error) {
      console.error('Sepet verisi okunamadı:', error);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('velado_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1, size = null, color = null) => {
    const normalizedProduct = normalizeProductData(product);
    const availableStock = getProductStockQuantity(normalizedProduct);

    if (isProductSoldOut(normalizedProduct)) {
      return;
    }

    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        item => item.id === normalizedProduct.id && item.size === size && item.color === color
      );

      if (existingIndex > -1) {
        const newItems = [...prevItems];
        const nextQuantity = newItems[existingIndex].quantity + quantity;
        newItems[existingIndex].quantity = availableStock === null
          ? nextQuantity
          : Math.min(nextQuantity, availableStock);
        return newItems;
      }

      const nextQuantity = availableStock === null
        ? quantity
        : Math.min(quantity, availableStock);

      return [...prevItems, { ...normalizedProduct, quantity: nextQuantity, size, color }];
    });
  };

  const removeFromCart = (productId, size = null, color = null) => {
    setItems(prevItems =>
      prevItems.filter(
        item => !(item.id === productId && item.size === size && item.color === color)
      )
    );
  };

  const updateQuantity = (productId, quantity, size = null, color = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId && item.size === size && item.color === color
          ? {
              ...item,
              quantity: getProductStockQuantity(item) === null
                ? quantity
                : Math.min(quantity, getProductStockQuantity(item))
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
