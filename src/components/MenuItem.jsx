import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Minus, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './MenuItem.css';

export default function MenuItem({ item, index }) {
  const { cart, addItem, updateQuantity } = useCart();

  const cartItem = cart.items.find((ci) => ci._id === item._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addItem(item);
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    if (quantity > 0) {
      updateQuantity(item._id, quantity - 1);
    }
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    addItem(item);
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`menu-item${quantity > 0 ? ' menu-item--in-cart' : ''}`}
      onClick={handleAdd}
      id={`menu-item-${item._id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
    >
      {item.popular && (
        <div className="menu-item__badge">
          <Star size={9} fill="currentColor" />
          <span>Popular</span>
        </div>
      )}

      <div className="menu-item__emoji-container">
        <span className="menu-item__emoji">{item.emoji}</span>
      </div>

      <div className="menu-item__info">
        <h3 className="menu-item__name">{item.name}</h3>
        <p className="menu-item__description truncate">{item.description}</p>
      </div>

      <div className="menu-item__footer">
        <span className="menu-item__price">${item.price.toFixed(2)}</span>

        {quantity > 0 ? (
          <div className="menu-item__quantity-control" onClick={(e) => e.stopPropagation()}>
            <button
              className="menu-item__qty-btn"
              onClick={handleDecrease}
              aria-label="Decrease quantity"
            >
              <Minus size={13} />
            </button>
            <span className="menu-item__qty-value">{quantity}</span>
            <button
              className="menu-item__qty-btn menu-item__qty-btn--add"
              onClick={handleIncrease}
              aria-label="Increase quantity"
            >
              <Plus size={13} />
            </button>
          </div>
        ) : (
          <button className="menu-item__add-btn" aria-label={`Add ${item.name}`}>
            <Plus size={15} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
