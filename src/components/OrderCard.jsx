import { useState, useEffect } from 'react';
import { Clock, ChefHat, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import './OrderCard.css';

export const STATUS_CONFIG = {
  preparing: {
    icon: ChefHat,
    label: 'Preparing',
    className: 'status--preparing',
  },
  ready: {
    icon: Clock,
    label: 'Ready',
    className: 'status--ready',
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    className: 'status--completed',
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelled',
    className: 'status--cancelled',
  },
};

const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export default function OrderCard({ order, nextStatus, onAdvance, isNew = false }) {
  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;
  const [elapsedMins, setElapsedMins] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const diff = Date.now() - new Date(order.createdAt).getTime();
      setElapsedMins(Math.floor(diff / 60000));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 10000); // update every 10s
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const timerClass = elapsedMins >= 10 ? 'timer--danger' : elapsedMins >= 5 ? 'timer--warning' : '';

  return (
    <motion.div
      // Only new cards slide in — existing cards stay put on poll
      initial={isNew ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="order-card"
      id={`order-${order._id}`}
    >
      <div className="order-card__header">
        <div className="order-card__number-container">
          <div className="order-card__number">
            <span className="order-card__hash">#</span>
            {String(order.orderNumber).padStart(3, '0')}
          </div>
          {order.customerName && (
            <div className="order-card__customer-name">{order.customerName}</div>
          )}
        </div>
        <div className="order-card__badges">
          {order.orderType && (
            <div className={`order-card__type-badge badge--${order.orderType}`}>
              {order.orderType.replace('-', ' ')}
            </div>
          )}
          <div className={`order-card__status ${statusConfig.className}`}>
            <StatusIcon size={13} />
            <span>{statusConfig.label}</span>
          </div>
        </div>
      </div>

      <div className="order-card__items">
        {order.items.map((item, idx) => (
          <div className="order-card__item-wrapper" key={idx}>
            <span className="order-card__item">
              {item.emoji} {item.name} &times;{item.quantity}
            </span>
            {item.notes && (
              <span className="order-card__item-notes">Note: {item.notes}</span>
            )}
          </div>
        ))}
      </div>

      <div className="order-card__footer">
        <span className={`order-card__timer ${timerClass}`}>
          <Clock size={12} />
          {elapsedMins}m
        </span>
        <span className="order-card__time">
          {formatTime(order.createdAt)}
        </span>
        <div className="order-card__total-group">
          {order.paymentMethod && (
            <span className="order-card__payment-method">{order.paymentMethod}</span>
          )}
          <span className="order-card__total">${order.total.toFixed(2)}</span>
        </div>
      </div>

      {nextStatus && (
        <button
          className="order-card__advance-btn"
          onClick={() => onAdvance(order._id, nextStatus)}
        >
          Mark as {STATUS_CONFIG[nextStatus].label}
        </button>
      )}
    </motion.div>
  );
}
