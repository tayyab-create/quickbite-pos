import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Banknote, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import './PaymentModal.css';

export default function PaymentModal({ isOpen, onClose, onPaymentComplete }) {
  const { cart, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const [method, setMethod] = useState('cash');
  const [amountTenderedStr, setAmountTenderedStr] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMethod('cash');
      setAmountTenderedStr('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const total = cart.total;
  const amountTendered = parseFloat(amountTenderedStr) || 0;
  const changeDue = amountTendered - total;
  const isSufficient = amountTendered >= total;

  const handleConfirm = async () => {
    if (method === 'cash' && !isSufficient) return;

    setIsProcessing(true);
    try {
      await placeOrder(cart, {
        paymentMethod: method,
        amountTendered: method === 'cash' ? amountTendered : total,
      });
      clearCart();
      onPaymentComplete();
    } catch (err) {
      console.error('Failed to place order:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-modal__overlay">
      <motion.div
        className="payment-modal"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
      >
        <div className="payment-modal__header">
          <h2>Payment</h2>
          <button className="payment-modal__close" onClick={onClose} disabled={isProcessing}>
            <X size={20} />
          </button>
        </div>

        <div className="payment-modal__total-display">
          <span>Amount Due</span>
          <span className="payment-modal__total-amount">${total.toFixed(2)}</span>
        </div>

        <div className="payment-modal__tabs">
          <button
            className={`payment-modal__tab ${method === 'cash' ? 'active' : ''}`}
            onClick={() => setMethod('cash')}
            disabled={isProcessing}
          >
            <Banknote size={16} /> Cash
            {method === 'cash' && <motion.div layoutId="payment-tab" className="payment-modal__tab-indicator" />}
          </button>
          <button
            className={`payment-modal__tab ${method === 'card' ? 'active' : ''}`}
            onClick={() => setMethod('card')}
            disabled={isProcessing}
          >
            <CreditCard size={16} /> Card
            {method === 'card' && <motion.div layoutId="payment-tab" className="payment-modal__tab-indicator" />}
          </button>
        </div>

        <div className="payment-modal__content">
          <AnimatePresence mode="wait">
            {method === 'cash' ? (
              <motion.div
                key="cash"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="payment-modal__cash-section"
              >
                <div className="payment-modal__input-wrapper">
                  <span className="payment-modal__currency">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    autoFocus
                    placeholder="0.00"
                    value={amountTenderedStr}
                    onChange={(e) => setAmountTenderedStr(e.target.value)}
                    disabled={isProcessing}
                    className="payment-modal__input"
                  />
                </div>
                
                <div className={`payment-modal__change ${amountTenderedStr ? (isSufficient ? 'positive' : 'negative') : ''}`}>
                  <span>Change Due:</span>
                  <span className="payment-modal__change-amount">
                    ${amountTenderedStr ? Math.max(0, changeDue).toFixed(2) : '0.00'}
                  </span>
                </div>
                
                <button
                  className="payment-modal__confirm-btn"
                  onClick={handleConfirm}
                  disabled={!isSufficient || isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Confirm Payment'}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="card"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="payment-modal__card-section"
              >
                <div className="payment-modal__card-icon-large">
                  <CreditCard size={48} />
                </div>
                <p>Awaiting card terminal...</p>
                <button
                  className="payment-modal__confirm-btn"
                  onClick={handleConfirm}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Terminal Successful'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
