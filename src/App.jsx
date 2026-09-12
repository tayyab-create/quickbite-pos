import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import POS from './pages/POS';
import Kitchen from './pages/Kitchen';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

export default function App() {
  return (
    <OrderProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<POS />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </OrderProvider>
  );
}
