import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChefHat, Check, AlertCircle } from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '../api/api';
import OrderCard from '../components/OrderCard';
import Navigation from '../components/Navigation';
import './Kitchen.css';

const playBeep = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error('Audio beep failed', e);
  }
};

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Track which order IDs are already on screen — only new IDs get the enter animation
  const knownIds = useRef(new Set());

  const loadPreparingOrders = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await fetchOrders('preparing');
      setOrders(prev => {
        // Smart merge: keep existing order objects for unchanged IDs
        // so React's key-based reconciliation skips re-rendering them.
        const prevMap = new Map(prev.map(o => [o._id, o]));
        let hasNew = false;
        const newOrders = data.map(o => {
          const existing = prevMap.get(o._id);
          // Only replace if something actually changed (status / items)
          if (existing && existing.status === o.status && existing.items.length === o.items.length) {
            return existing;
          }
          if (!existing) hasNew = true;
          return o;
        });

        if (hasNew && prev.length > 0) { // Don't beep on initial load
          playBeep();
        }

        return newOrders;
      });
      setError(null);
    } catch (err) {
      setError('Failed to sync orders: ' + err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadPreparingOrders(true);
  }, [loadPreparingOrders]);

  // Polling every 4 seconds (slightly relaxed — 3s was aggressive)
  useEffect(() => {
    const interval = setInterval(() => {
      loadPreparingOrders(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [loadPreparingOrders]);

  const handleMarkReady = async (orderId) => {
    try {
      // Optimistic update
      setOrders(prev => prev.filter(o => o._id !== orderId));
      knownIds.current.delete(orderId);
      await updateOrderStatus(orderId, 'ready');
    } catch (err) {
      setError('Failed to mark order as ready: ' + err.message);
      loadPreparingOrders(false);
    }
  };

  return (
    <div className="kitchen-app">
      <header
        className="kitchen__header"
        style={{ animation: 'fadeInDown 0.25s ease-out' }}
      >
        <div className="kitchen__header-left">
          <ChefHat size={28} className="kitchen__logo-icon" />
          <h1>Kitchen Display</h1>
          <span className="kitchen__badge">
            {orders.length} ticket{orders.length !== 1 ? 's' : ''}
          </span>
        </div>

        {error && (
          <div className="kitchen__error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <Navigation />

        <div className="kitchen__clock">
          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      <main className="kitchen__board">
        {loading && orders.length === 0 ? (
          <div className="kitchen__loading">Loading active tickets...</div>
        ) : orders.length === 0 ? (
          <div className="kitchen__empty">
            <Check size={48} className="kitchen__empty-icon" />
            <h2>All Caught Up!</h2>
            <p>Waiting for new orders...</p>
          </div>
        ) : (
          <div className="kitchen__grid">
            <AnimatePresence>
              {orders.map((order) => {
                const isNew = !knownIds.current.has(order._id);
                if (isNew) knownIds.current.add(order._id);
                return (
                  <OrderCard
                    key={order._id}
                    order={order}
                    nextStatus="ready"
                    onAdvance={handleMarkReady}
                    isNew={isNew}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
