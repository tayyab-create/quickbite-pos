import { useState, useEffect, useCallback } from 'react';
import { Minus, Plus, Trash2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import './CartItem.css';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem, setItemNotes, setItemDiscount } = useCart();

  const [isExpanded, setIsExpanded] = useState(false);
  const [noteInput, setNoteInput] = useState(item.notes || '');
  const [discountInput, setDiscountInput] = useState(
    item.discount > 0 ? item.discount.toFixed(2) : ''
  );

  // Keep local inputs in sync if cart changes externally (e.g. cart cleared)
  useEffect(() => { setNoteInput(item.notes || ''); }, [item.notes]);
  useEffect(() => {
    setDiscountInput(item.discount > 0 ? item.discount.toFixed(2) : '');
  }, [item.discount]);

  const maxDiscount = item.price * item.quantity;
  const lineTotal = Math.max(0, maxDiscount - (item.discount || 0));
  const hasDiscount = (item.discount || 0) > 0;
  const hasNote = Boolean(item.notes);

  // Commit both fields at once — one clear save action
  const handleSave = useCallback(() => {
    const val = parseFloat(discountInput);
    const clampedDiscount = isNaN(val) || val < 0 ? 0 : Math.min(val, maxDiscount);
    setItemNotes(item._id, noteInput.trim());
    setItemDiscount(item._id, clampedDiscount);
    setIsExpanded(false);
  }, [item._id, noteInput, discountInput, maxDiscount, setItemNotes, setItemDiscount]);

  const handleCancel = useCallback(() => {
    // Revert local inputs to last committed state
    setNoteInput(item.notes || '');
    setDiscountInput(item.discount > 0 ? item.discount.toFixed(2) : '');
    setIsExpanded(false);
  }, [item.notes, item.discount]);

  // Single summary subtitle — no separate badge rows
  const subtitleParts = [
    `$${item.price.toFixed(2)} each`,
    hasDiscount && `−$${item.discount.toFixed(2)} disc`,
  ].filter(Boolean);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, height: 0, overflow: 'hidden' }}
      animate={{ opacity: 1, scale: 1, height: 'auto', overflow: 'visible' }}
      exit={{ opacity: 0, scale: 0.95, height: 0, overflow: 'hidden' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`cart-item ${isExpanded ? 'cart-item--expanded' : ''}`}
      id={`cart-item-${item._id}`}
    >
      {/* ── Main row (always visible, always compact) ── */}
      <div className="cart-item__main">
        <div className="cart-item__emoji">{item.emoji}</div>

        {/* Clicking the info area toggles the edit panel */}
        <button
          className="cart-item__info"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          aria-label={`Edit ${item.name}`}
        >
          <span className="cart-item__name">{item.name}</span>
          <span className="cart-item__subtitle">
            {subtitleParts.join(' · ')}
            {hasNote && (
              <span className="cart-item__note-pill"> · 📝</span>
            )}
          </span>
        </button>

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
      </div>

      {/* ── Inline edit panel — slides in below the row ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="edit-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="cart-item__panel"
            style={{ overflow: 'hidden' }}
          >
            <div className="cart-item__panel-inner">
              {/* Note field */}
              <div className="cart-item__field">
                <label className="cart-item__field-label" htmlFor={`note-${item._id}`}>
                  Note
                </label>
                <input
                  id={`note-${item._id}`}
                  type="text"
                  className="cart-item__field-input"
                  placeholder="e.g. No onions, extra sauce…"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                  }}
                />
              </div>

              {/* Discount field */}
              <div className="cart-item__field">
                <label className="cart-item__field-label" htmlFor={`disc-${item._id}`}>
                  Discount
                </label>
                <div className="cart-item__field-currency">
                  <span>$</span>
                  <input
                    id={`disc-${item._id}`}
                    type="number"
                    className="cart-item__field-input cart-item__field-input--num"
                    placeholder="0.00"
                    min="0"
                    max={maxDiscount}
                    step="0.01"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') handleCancel();
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="cart-item__panel-actions">
                <button className="cart-item__panel-cancel" onClick={handleCancel}>
                  <X size={12} /> Cancel
                </button>
                <button className="cart-item__panel-save" onClick={handleSave}>
                  <Check size={12} /> Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
