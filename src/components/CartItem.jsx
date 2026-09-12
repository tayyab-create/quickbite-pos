import { Minus, Plus, Trash2, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import './CartItem.css';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem, setItemNotes } = useCart();

  // 'note' | 'discount' | null — only one at a time
  const [editing, setEditing] = useState(null);

  // Local input strings — committed only on blur / Enter
  const [noteInput, setNoteInput] = useState(item.notes || '');

  // Sync local states when the cart item changes externally (e.g. cart cleared)
  useEffect(() => {
    setNoteInput(item.notes || '');
  }, [item.notes]);

  const lineTotal = item.price * item.quantity;

  const commitNote = useCallback(() => {
    setItemNotes(item._id, noteInput.trim());
    setEditing(null);
  }, [item._id, noteInput, setItemNotes]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, overflow: 'hidden' }}
      animate={{ opacity: 1, scale: 1, height: 'auto', marginBottom: 8, overflow: 'visible' }}
      exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="cart-item"
      id={`cart-item-${item._id}`}
    >
      <div className="cart-item__emoji">{item.emoji}</div>

      <div className="cart-item__info">
        <span className="cart-item__name">{item.name}</span>
        <span className="cart-item__unit-price">${item.price.toFixed(2)} each</span>

        {/* Note display */}
        {item.notes && editing !== 'note' && (
          <span className="cart-item__notes-display">📝 {item.notes}</span>
        )}

        {/* Inline editors */}
        <AnimatePresence mode="wait">
          {editing === 'note' && (
            <motion.div
              key="note-editor"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="cart-item__notes-edit"
            >
              <input
                autoFocus
                type="text"
                placeholder="e.g. No onions, extra sauce…"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onBlur={commitNote}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitNote();
                  if (e.key === 'Escape') { setNoteInput(item.notes || ''); setEditing(null); }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons row — hidden while editing */}
        {editing === null && (
          <div className="cart-item__meta-actions">
            <button
              className="cart-item__action-link"
              onClick={() => setEditing('note')}
            >
              {item.notes ? 'Edit note' : '+ Note'}
            </button>
          </div>
        )}
      </div>

      {/* Quantity + total + remove */}
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

        <span className="cart-item__total">
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
