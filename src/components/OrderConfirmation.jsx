import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  const { lastOrder, clearLastOrder } = useOrders();

  useEffect(() => {
    if (lastOrder) {
      const timer = setTimeout(clearLastOrder, 4000);
      return () => clearTimeout(timer);
    }
  }, [lastOrder, clearLastOrder]);

  return (
    <AnimatePresence>
      {lastOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="order-confirmation-overlay"
          onClick={clearLastOrder}
          id="order-confirmation-overlay"
        >
          {/* Modal uses CSS animation — no JS spring overhead */}
          <div
            className="order-confirmation order-confirmation--animate"
            onClick={(e) => e.stopPropagation()}
            id="order-confirmation-modal"
          >
            <div className="order-confirmation__icon">
              <CheckCircle size={48} />
            </div>

            <h2 className="order-confirmation__title">Order Placed</h2>

            <div className="order-confirmation__number">
              <span className="order-confirmation__number-label">Order Number</span>
              <span className="order-confirmation__number-value">
                #{String(lastOrder.orderNumber).padStart(3, '0')}
              </span>
            </div>

            <div className="order-confirmation__summary">
              <div className="order-confirmation__items">
                {lastOrder.items.map((item, idx) => (
                  <div className="order-confirmation__item" key={idx}>
                    <span>{item.emoji} {item.name}</span>
                    <span>×{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="order-confirmation__total">
                <span>Total</span>
                <span>${lastOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <p className="order-confirmation__status">
              Now preparing your order
            </p>

            <button
              className="order-confirmation__dismiss"
              onClick={clearLastOrder}
              id="dismiss-confirmation-btn"
            >
              Continue
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
