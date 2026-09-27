import React, { createContext, useContext, useState, useEffect } from 'react';

const CART_STORAGE_KEY = 'wron_wave_cart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Rehydrate initial cart state from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState('WAVE50'); // 50% launch discount

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  // Synchronize across browser tabs or windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === CART_STORAGE_KEY) {
        try {
          const updated = e.newValue ? JSON.parse(e.newValue) : [];
          setCart(Array.isArray(updated) ? updated : []);
        } catch (err) {
          console.error('Error syncing cart from storage event:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Add product to cart with validation for all required fields:
   * id, name, price, quantity, image, and size.
   */
  const addToCart = (product, size, options = { openDrawer: true }) => {
    if (!product || !product.id) {
      console.error('addToCart called without valid product:', product);
      return;
    }

    const itemSize = size || product.sizes?.[0] || 'M';
    const itemPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
    const itemImage = (product.images && product.images[0]) || product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.size === itemSize
      );

      let nextCart;
      if (existingIndex > -1) {
        nextCart = prevCart.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        const newItem = {
          id: product.id,
          name: product.name || 'Streetwear Garment',
          price: itemPrice,
          quantity: 1,
          size: itemSize,
          image: itemImage,
          images: product.images || [itemImage],
          fabricType: product.fabricType || '240 GSM Combed Cotton',
          gsm: product.gsm || '240 GSM',
          category: product.category || 'printed-tees',
          categoryLabel: product.categoryLabel || 'WRON_WAVE'
        };
        nextCart = [...prevCart, newItem];
      }

      // Immediately write to localStorage to prevent race conditions or navigation losses
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
      } catch (err) {
        console.error('LocalStorage write error:', err);
      }

      return nextCart;
    });

    if (options.openDrawer) {
      setIsCartOpen(true);
    }
  };

  /**
   * Update item quantity (removes if qty <= 0)
   */
  const updateQuantity = (productId, size, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCart((prevCart) => {
      const nextCart = prevCart.map((item) =>
        item.id === productId && item.size === size
          ? { ...item, quantity: newQty }
          : item
      );
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
      } catch (err) {
        console.error('LocalStorage update error:', err);
      }
      return nextCart;
    });
  };

  /**
   * Remove item completely from cart
   */
  const removeFromCart = (productId, size) => {
    setCart((prevCart) => {
      const nextCart = prevCart.filter(
        (item) => !(item.id === productId && item.size === size)
      );
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
      } catch (err) {
        console.error('LocalStorage remove error:', err);
      }
      return nextCart;
    });
  };

  /**
   * Clear all items from cart (e.g. after successful order)
   */
  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (err) {
      console.error('LocalStorage clear error:', err);
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Derived metrics
  const cartTotalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cartTotalItems,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        setAppliedCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
