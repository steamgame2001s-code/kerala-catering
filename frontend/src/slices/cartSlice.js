import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const cartData = localStorage.getItem('keralaCateringCart');
    if (cartData) {
      return JSON.parse(cartData);
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error);
  }
  return {
    items: [],
    subtotal: 0,
    deliveryCharge: 0,
    gst: 0,
    total: 0,
    discount: 0,
    deliveryInfo: null
  };
};

// Save cart to localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('keralaCateringCart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(item => 
        item._id === newItem._id && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(newItem.selectedOptions)
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        state.items[existingItemIndex].quantity += newItem.quantity;
        state.items[existingItemIndex].totalPrice = 
          state.items[existingItemIndex].price * state.items[existingItemIndex].quantity;
      } else {
        // Add new item
        state.items.push({
          ...newItem,
          totalPrice: newItem.price * newItem.quantity
        });
      }

      // Recalculate totals
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToStorage(state);
    },

    updateQuantity: (state, action) => {
      const { itemId, quantity, selectedOptions } = action.payload;
      const itemIndex = state.items.findIndex(item => 
        item._id === itemId && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items.splice(itemIndex, 1);
        } else {
          // Update quantity
          state.items[itemIndex].quantity = quantity;
          state.items[itemIndex].totalPrice = 
            state.items[itemIndex].price * quantity;
        }

        cartSlice.caseReducers.calculateTotals(state);
        saveCartToStorage(state);
      }
    },

    removeFromCart: (state, action) => {
      const { itemId, selectedOptions } = action.payload;
      state.items = state.items.filter(item => 
        !(item._id === itemId && 
          JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions))
      );
      
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToStorage(state);
    },

    clearCart: (state) => {
      state.items = [];
      cartSlice.caseReducers.calculateTotals(state);
      localStorage.removeItem('keralaCateringCart');
    },

    setDeliveryInfo: (state, action) => {
      state.deliveryInfo = action.payload;
      saveCartToStorage(state);
    },

    applyCoupon: (state, action) => {
      const couponCode = action.payload;
      // Coupon logic here (for now, fixed discount)
      if (couponCode === 'KERALA10') {
        state.discount = state.subtotal * 0.1; // 10% discount
      } else if (couponCode === 'FESTIVAL500') {
        state.discount = 500;
      } else {
        state.discount = 0;
      }
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToStorage(state);
    },

    removeCoupon: (state) => {
      state.discount = 0;
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToStorage(state);
    },

    calculateTotals: (state) => {
      // Calculate subtotal
      state.subtotal = state.items.reduce((total, item) => total + item.totalPrice, 0);
      
      // Calculate delivery charge (free above 2000)
      state.deliveryCharge = state.subtotal >= 2000 ? 0 : 150;
      
      // Calculate GST (18%)
      state.gst = (state.subtotal - state.discount) * 0.18;
      
      // Calculate total
      state.total = state.subtotal + state.deliveryCharge + state.gst - state.discount;
    },

    setCartItems: (state, action) => {
      state.items = action.payload;
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToStorage(state);
    }
  }
});

// Export actions
export const { 
  addToCart, 
  updateQuantity, 
  removeFromCart, 
  clearCart,
  setDeliveryInfo,
  applyCoupon,
  removeCoupon,
  setCartItems
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartSubtotal = (state) => state.cart.subtotal;
export const selectDeliveryCharge = (state) => state.cart.deliveryCharge;
export const selectGST = (state) => state.cart.gst;
export const selectDiscount = (state) => state.cart.discount;
export const selectCartTotal = (state) => state.cart.total;
export const selectItemCount = (state) => 
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectDeliveryInfo = (state) => state.cart.deliveryInfo;

export default cartSlice.reducer;