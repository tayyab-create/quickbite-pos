import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RefreshCw } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import OrderCard from './OrderCard';
import './OrderHistory.css';

export default function OrderHistory({ isOpen, onClose }) {
  const { orders, loading, loadOrders, updateOrderStatus } = useOrders();

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, loadOrders]);

  const getNextStatus = (current) => {
    const flow = { preparing: 'ready', ready: 'completed' };
    return flow[current] || null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="order-history-overlay" 
          onClick={onClose} 
          id="order-history-overlay"
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="order-history"
            onClick={(e) => e.stopPropagation()}
            id="order-history-drawer"
          >
            <div className="order-history__header">
          <div>
            <h2 className="order-history__title">Order History</h2>
            <span className="order-history__count">
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="order-history__actions">
            <button
              className="order-history__refresh-btn"
              onClick={() => loadOrders()}
              aria-label="Refresh orders"
            >
              <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            </button>
            <button
              className="order-history__close-btn"
              onClick={onClose}
              aria-label="Close order history"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="order-history__list">
          {orders.length === 0 ? (
            <div className="order-history__empty">
              <span className="order-history__empty-icon">📋</span>
              <p>No orders yet</p>
              <span>Orders will appear here after placement</span>
            </div>
          ) : (
            orders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              return (
                <OrderCard 
                  key={order._id}
                  order={order}
                  nextStatus={nextStatus}
                  onAdvance={updateOrderStatus}
                />
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
    )}
    </AnimatePresence>
  );
}
