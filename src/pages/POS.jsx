import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import Header from '../components/Header';
import CategoryTabs from '../components/CategoryTabs';
import MenuGrid from '../components/MenuGrid';
import Cart from '../components/Cart';
import OrderConfirmation from '../components/OrderConfirmation';
import OrderHistory from '../components/OrderHistory';
import PaymentModal from '../components/PaymentModal';
import { ShoppingBag } from 'lucide-react';
import '../App.css';

export default function POS() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const { orders } = useOrders();
  const { cart, itemCount } = useCart();

  const toggleHistory = useCallback(() => {
    setHistoryOpen((prev) => !prev);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setHistoryOpen(false);
        setCartOpen(false);
        setPaymentOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  // Calculate how many orders were placed today
  const todayCount = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="app" id="pos-app">
      <Header
        orderCount={todayCount}
        onToggleHistory={toggleHistory}
      />

      <div className="app__body">
        <main className="app__menu-area" id="menu-area">
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          <MenuGrid category={activeCategory} />
        </main>

        <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} onOpenPayment={() => setPaymentOpen(true)} />
      </div>

      {itemCount > 0 && (
        <button
          className={`mobile-cart-toggle ${cartOpen ? 'mobile-cart-toggle--hidden' : ''}`}
          onClick={() => setCartOpen(true)}
        >
          <div className="mobile-cart-toggle__info">
            <ShoppingBag size={20} />
            <span>{itemCount} items</span>
          </div>
          <span className="mobile-cart-toggle__total">
            View Cart • ${cart.total.toFixed(2)}
          </span>
        </button>
      )}

      <PaymentModal 
        isOpen={paymentOpen} 
        onClose={() => setPaymentOpen(false)} 
        onPaymentComplete={() => setPaymentOpen(false)} 
      />
      <OrderConfirmation />
      <OrderHistory isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}
