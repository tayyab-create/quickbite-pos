import { Link, useLocation } from 'react-router-dom';
import { Monitor, ChefHat, LayoutDashboard, Settings } from 'lucide-react';
import './Navigation.css';

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="header__nav">
      <Link to="/" className={`header__nav-link ${location.pathname === '/' ? 'active' : ''}`}>
        <Monitor size={16} /> POS
      </Link>
      <Link to="/kitchen" className={`header__nav-link ${location.pathname === '/kitchen' ? 'active' : ''}`}>
        <ChefHat size={16} /> Kitchen
      </Link>
      <Link to="/dashboard" className={`header__nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
        <LayoutDashboard size={16} /> Dashboard
      </Link>
      <Link to="/admin" className={`header__nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
        <Settings size={16} /> Admin
      </Link>
    </nav>
  );
}
