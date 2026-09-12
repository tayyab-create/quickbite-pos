import { createContext, useContext, useReducer, useCallback } from 'react';
import { createOrder, fetchOrders, updateOrderStatus as apiUpdateStatus } from '../api/api';

const OrderContext = createContext(null);

const initialState = {
  orders: [],
  loading: false,
  error: null,
  lastOrder: null,
};

function orderReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };

    case 'SET_ORDERS':
      return { ...state, orders: action.payload, loading: false };

    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        lastOrder: action.payload,
        loading: false,
      };

    case 'UPDATE_ORDER_STATUS': {
      const updatedOrders = state.orders.map((order) =>
        order._id === action.payload._id ? action.payload : order
      );
      return { ...state, orders: updatedOrders };
    }

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'CLEAR_LAST_ORDER':
      return { ...state, lastOrder: null };

    default:
      return state;
  }
}

export function OrderProvider({ children }) {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  const loadOrders = useCallback(async (status = null) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const orders = await fetchOrders(status);
      dispatch({ type: 'SET_ORDERS', payload: orders });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const placeOrder = useCallback(async (cartData, paymentDetails = {}) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const orderPayload = {
        items: cartData.items.map((item) => ({
          menuItem: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          emoji: item.emoji,
          notes: item.notes || '',
          discount: item.discount || 0,
        })),
        subtotal: cartData.subtotal,
        tax: cartData.tax,
        total: cartData.total,
        orderType: cartData.orderType,
        customerName: cartData.customerName,
        discount: cartData.discount,
        paymentMethod: paymentDetails.paymentMethod || null,
        amountTendered: paymentDetails.amountTendered || null,
      };

      const newOrder = await createOrder(orderPayload);
      dispatch({ type: 'ADD_ORDER', payload: newOrder });
      return newOrder;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      const updated = await apiUpdateStatus(orderId, status);
      dispatch({ type: 'UPDATE_ORDER_STATUS', payload: updated });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const clearLastOrder = useCallback(() => {
    dispatch({ type: 'CLEAR_LAST_ORDER' });
  }, []);

  return (
    <OrderContext.Provider
      value={{
        ...state,
        loadOrders,
        placeOrder,
        updateOrderStatus,
        clearLastOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
