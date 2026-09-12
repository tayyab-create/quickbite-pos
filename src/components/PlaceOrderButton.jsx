import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './PlaceOrderButton.css';

export default function PlaceOrderButton({ onOpenPayment }) {
  const { cart, itemCount } = useCart();

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className="place-order-btn"
      onClick={onOpenPayment}
      disabled={itemCount === 0}
      id="place-order-btn"
    >
      <span className="place-order-btn__text">Place & Pay</span>
      <span className="place-order-btn__total">
        ${cart.total.toFixed(2)} <ArrowRight size={16} />
      </span>
    </motion.button>
  );
}
