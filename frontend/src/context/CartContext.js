import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        setCartItems(items);
        updateCartStats(items);
      } catch (error) {
        console.error('Error parsing cart data:', error);
      }
    }
  }, []);

  const updateCartStats = (items) => {
    const count = items.reduce((total, item) => total + (item.quantity || 1), 0);
    const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    setCartCount(count);
    setCartTotal(total);
  };

  const addToCart = (item) => {
    const existingItemIndex = cartItems.findIndex(
      cartItem => cartItem.id === item.id && cartItem.variation === item.variation
    );

    let updatedCart;
    
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += item.quantity || 1;
    } else {
      // Add new item
      updatedCart = [...cartItems, { ...item, quantity: item.quantity || 1 }];
    }

    setCartItems(updatedCart);
    updateCartStats(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    updateCartStats(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    const updatedCart = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    updateCartStats(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
    setCartTotal(0);
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};