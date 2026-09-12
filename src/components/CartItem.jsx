import { Minus, Plus, Trash2, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import './CartItem.css';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem, setItemNotes, setItemDiscount } = useCart();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState(item.discount > 0 ? String(item.discount) : '');

  const lineTotal = Math.max(0, item.price * item.quantity - (item.discount || 0));
  const hasDiscount = (item.discount || 0) > 0;

  const handleDiscountBlur = () => {
    const val = parseFloat(discountInput);
    setItemDiscount(item._id, isNaN(val) ? 0 : val);
    setIsEditingDiscount(false);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, overflow: 'hidden' }}
      animate={{ opacity: 1, scale: 1, height: 'auto', marginBottom: 8, overflow: 'visible' }}
      exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="cart-item" 
      id={`cart-item-${item._id}`}
    >
      <div className="cart-item__emoji">{item.emoji}</div>

      <div className="cart-item__info">
        <span className="cart-item__name">{item.name}</span>
        <span className="cart-item__unit-price">
          ${item.price.toFixed(2)} each
          {hasDiscount && (
            <span className="cart-item__discount-badge"> − ${(item.discount).toFixed(2)} off</span>
          )}
        </span>

        {item.notes && !isEditingNotes && (
          <span className="cart-item__notes-display">Note: {item.notes}</span>
        )}

        {isEditingNotes ? (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="cart-item__notes-edit"
          >
            <input 
              autoFocus
              type="text" 
              placeholder="e.g. No onions"
              value={item.notes || ''}
              onChange={(e) => setItemNotes(item._id, e.target.value)}
              onBlur={() => setIsEditingNotes(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingNotes(false)}
            />
          </motion.div>
        ) : (
          <div className="cart-item__meta-actions">
            <button 
              className="cart-item__add-note-btn"
              onClick={() => setIsEditingNotes(true)}
            >
              {item.notes ? 'Edit note' : '+ Note'}
            </button>
            {isEditingDiscount ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                className="cart-item__discount-input-wrap"
              >
                <span className="cart-item__discount-prefix">$</span>
                <input
                  autoFocus
                  type="number"
                  min="0"
                  step="0.01"
                  className="cart-item__discount-input"
                  placeholder="0.00"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  onBlur={handleDiscountBlur}
                  onKeyDown={(e) => e.key === 'Enter' && handleDiscountBlur()}
                />
              </motion.div>
            ) : (
              <button
                className={`cart-item__add-note-btn cart-item__discount-btn ${hasDiscount ? 'cart-item__discount-btn--active' : ''}`}
                onClick={() => {
                  setDiscountInput(item.discount > 0 ? String(item.discount) : '');
                  setIsEditingDiscount(true);
                }}
              >
                <Tag size={9} />
                {hasDiscount ? `$${item.discount.toFixed(2)} off` : '+ Discount'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="cart-item__controls">
        <div className="cart-item__quantity">
          <button
            className="cart-item__qty-btn"
            onClick={() => updateQuantity(item._id, item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            <Minus size={12} />
          </button>
          <span className="cart-item__qty-value">{item.quantity}</span>
          <button
            className="cart-item__qty-btn cart-item__qty-btn--add"
            onClick={() => updateQuantity(item._id, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus size={12} />
          </button>
        </div>

        <span className={`cart-item__total ${hasDiscount ? 'cart-item__total--discounted' : ''}`}>
          ${lineTotal.toFixed(2)}
        </span>

        <button
          className="cart-item__remove-btn"
          onClick={() => removeItem(item._id)}
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
