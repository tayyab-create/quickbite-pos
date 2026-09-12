import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Trash2, X, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import CartItem from './CartItem';
import PlaceOrderButton from './PlaceOrderButton';
import './Cart.css';

export default function Cart({ isOpen, onClose, onOpenPayment }) {
  const { cart, itemCount, clearCart, setOrderType, setCustomerName, setDiscount } = useCart();

  // Local string for the discount input — committed only on blur / Enter.
  // Sync back to '' when the cart's order discount is cleared externally (e.g. cart clear).
  const [discountInput, setDiscountInput] = useState('');

  useEffect(() => {
    if (cart.discount === 0) setDiscountInput('');
  }, [cart.discount]);

  const commitOrderDiscount = useCallback(() => {
    const val = parseFloat(discountInput);
    setDiscount(isNaN(val) || val < 0 ? 0 : val);
  }, [discountInput, setDiscount]);

  const clearOrderDiscount = useCallback(() => {
    setDiscount(0);
    setDiscountInput('');
  }, [setDiscount]);

  return (
    <aside className={`cart ${isOpen ? 'cart--open' : ''}`} id="cart-panel">
      {/* Cart Header */}
      <div className="cart__header">
        <div className="cart__header-left">
          <div className="cart__icon-wrapper">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="cart__badge">{itemCount}</span>
            )}
          </div>
          <div>
            <h2 className="cart__title">Current Order</h2>
            <span className="cart__item-count">
              {itemCount === 0
                ? 'No items'
                : `${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        <div className="cart__header-actions">
          {cart.items.length > 0 && (
            <button
              className="cart__icon-btn cart__clear-btn"
              onClick={clearCart}
              aria-label="Clear cart"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            className="cart__icon-btn cart__close-btn"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="cart__items-container">
        {cart.items.length > 0 && (
          <div className="cart__order-details">
            <div className="cart__type-toggle">
              {['dine-in', 'takeaway', 'delivery'].map((type) => (
                <button
                  key={type}
                  className={`cart__type-btn ${cart.orderType === type ? 'cart__type-btn--active' : ''}`}
                  onClick={() => setOrderType(type)}
                >
                  <span className="cart__type-label">{type.replace('-', ' ')}</span>
                  {cart.orderType === type && (
                    <motion.div layoutId="type-indicator" className="cart__type-indicator" />
                  )}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="cart__customer-input"
              placeholder="Table # or customer name..."
              value={cart.customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
        )}

        {cart.items.length === 0 ? (
          <div className="cart__empty">
            <div className="cart__empty-icon">🛒</div>
            <p className="cart__empty-title">Your cart is empty</p>
            <p className="cart__empty-subtitle">
              Tap items from the menu to add them here
            </p>
          </div>
        ) : (
          <div className="cart__items">
            <AnimatePresence initial={false}>
              {cart.items.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Cart Footer / Totals */}
      {cart.items.length > 0 && (
        <div className="cart__footer">
          <div className="cart__totals">
            <div className="cart__total-row">
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>

            {/* Order-level discount */}
            <div className="cart__total-row cart__total-row--discount">
              <label htmlFor="order-discount" className="cart__discount-label">
                <Tag size={12} />
                Order Discount
              </label>
              <div className="cart__discount-input-wrap">
                <span className="cart__discount-prefix">$</span>
                <input
                  id="order-discount"
                  type="number"
                  min="0"
                  step="0.01"
                  className="cart__discount-input"
                  placeholder="0.00"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  onBlur={commitOrderDiscount}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitOrderDiscount();
                    if (e.key === 'Escape') clearOrderDiscount();
                  }}
                />
                {cart.discount > 0 && (
                  <button
                    className="cart__discount-clear"
                    onClick={clearOrderDiscount}
                    aria-label="Remove order discount"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>

            {/* Savings highlight — only when discount is active */}
            <AnimatePresence>
              {cart.discount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="cart__total-row cart__total-row--saving"
                >
                  <span>You save</span>
                  <span>−${cart.discount.toFixed(2)}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="cart__total-row">
              <span>Tax (8%)</span>
              <span>${cart.tax.toFixed(2)}</span>
            </div>
            <div className="cart__total-row cart__total-row--grand">
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
          </div>

          <PlaceOrderButton onOpenPayment={onOpenPayment} />
        </div>
      )}
    </aside>
  );
}
