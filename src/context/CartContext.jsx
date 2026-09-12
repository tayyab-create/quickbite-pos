import { createContext, useContext, useReducer, useCallback } from 'react';

const CartContext = createContext(null);

const TAX_RATE = 0.08;

const initialState = {
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  orderType: 'dine-in',
  customerName: '',
  discount: 0,
};

function calculateTotals(items, discount = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);
  const tax = subtotalAfterDiscount * TAX_RATE;
  const total = subtotalAfterDiscount + tax;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

function cartReducer(state, action) {
  let newItems;

  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item._id === action.payload._id
      );

      if (existingIndex >= 0) {
        newItems = state.items.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1, notes: '' }];
      }

      return { ...state, items: newItems, ...calculateTotals(newItems, state.discount) };
    }

    case 'REMOVE_ITEM': {
      newItems = state.items.filter((item) => item._id !== action.payload);
      return { ...state, items: newItems, ...calculateTotals(newItems, state.discount) };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;

      if (quantity <= 0) {
        newItems = state.items.filter((item) => item._id !== id);
      } else {
        newItems = state.items.map((item) =>
          item._id === id ? { ...item, quantity } : item
        );
      }

      return { ...state, items: newItems, ...calculateTotals(newItems, state.discount) };
    }

    case 'SET_ORDER_TYPE':
      return { ...state, orderType: action.payload };

    case 'SET_CUSTOMER_NAME':
      return { ...state, customerName: action.payload };

    case 'SET_DISCOUNT':
      return { ...state, discount: action.payload, ...calculateTotals(state.items, action.payload) };

    case 'SET_ITEM_NOTES': {
      const { id, notes } = action.payload;
      newItems = state.items.map((item) =>
        item._id === id ? { ...item, notes } : item
      );
      return { ...state, items: newItems };
    }

    case 'CLEAR_CART':
      return { ...initialState };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  const addItem = useCallback((item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeItem = useCallback((id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const setOrderType = useCallback((type) => {
    dispatch({ type: 'SET_ORDER_TYPE', payload: type });
  }, []);

  const setCustomerName = useCallback((name) => {
    dispatch({ type: 'SET_CUSTOMER_NAME', payload: name });
  }, []);

  const setDiscount = useCallback((amount) => {
    dispatch({ type: 'SET_DISCOUNT', payload: amount });
  }, []);

  const setItemNotes = useCallback((id, notes) => {
    dispatch({ type: 'SET_ITEM_NOTES', payload: { id, notes } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        setOrderType,
        setCustomerName,
        setDiscount,
        setItemNotes,
        clearCart,
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
