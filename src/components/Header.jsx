import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Hash, History, LayoutDashboard, Settings, ChefHat, Monitor } from 'lucide-react';
import Navigation from './Navigation';
import './Header.css';

export default function Header({ orderCount, onToggleHistory }) {
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="header" id="pos-header">
      <div className="header__brand">
        <div className="header__logo">
          <span className="header__logo-emoji">🍔</span>
        </div>
        <div className="header__title-group">
          <h1 className="header__title">QuickBite</h1>
          <span className="header__subtitle">Point of Sale</span>
        </div>
      </div>

      <Navigation />

      <div className="header__right">
        <div className="header__info-chip" id="header-date">
          <Clock size={16} />
          <div className="header__time-block">
            <span className="header__time">{formattedTime}</span>
            <span className="header__date">{formattedDate}</span>
          </div>
        </div>

        <div className="header__info-chip header__info-chip--accent" id="header-order-count">
          <Hash size={16} />
          <span>{orderCount} orders today</span>
        </div>

        <button
          className="header__history-btn"
          onClick={onToggleHistory}
          id="toggle-history-btn"
          aria-label="Toggle order history"
        >
          <History size={20} />
        </button>
      </div>
    </header>
  );
}
