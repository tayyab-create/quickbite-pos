import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, DollarSign, ShoppingBag, TrendingUp, Package } from 'lucide-react';
import { fetchDashboardStats, fetchHourlyStats } from '../api/api';
import Navigation from '../components/Navigation';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalItems: 0,
    popularItems: [],
  });
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardRes, hourlyRes] = await Promise.all([
          fetchDashboardStats(),
          fetchHourlyStats(),
        ]);
        
        setStats({
          totalSales: dashboardRes.summary?.revenue || 0,
          totalOrders: dashboardRes.summary?.count || 0,
          avgOrderValue: dashboardRes.summary?.avgOrderValue || 0,
          totalItems: dashboardRes.topItems?.reduce((acc, item) => acc + item.quantity, 0) || 0,
          popularItems: dashboardRes.topItems?.map(item => ({ _id: item._id, name: item._id, count: item.quantity })) || [],
        });
        setHourlyData(hourlyRes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Poll every 60s
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="dashboard__loading">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard__error">Error loading dashboard: {error}</div>;
  }

  // Create a full day array (e.g. 8am to 10pm) for consistent chart x-axis
  const chartHours = Array.from({ length: 15 }, (_, i) => i + 8);
  const fullHourlyData = chartHours.map(hour => {
    const existing = hourlyData.find(d => d._id === hour);
    return existing || { _id: hour, revenue: 0, orders: 0 };
  });

  // Find max sales for chart scaling
  const maxSales = Math.max(...fullHourlyData.map((d) => d.revenue || 0), 1);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <LayoutDashboard size={28} className="dashboard__logo-icon" />
        <h1>Sales Dashboard</h1>
        <span className="dashboard__subtitle">Today's Performance</span>
        <Navigation />
      </header>

      <main className="dashboard__content">
        <div className="dashboard__metrics">
          <motion.div
            className="dashboard__metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="dashboard__metric-icon dashboard__metric-icon--forest">
              <DollarSign size={20} />
            </div>
            <div className="dashboard__metric-info">
              <span className="dashboard__metric-label">Total Sales</span>
              <span className="dashboard__metric-value">${stats.totalSales.toFixed(2)}</span>
            </div>
          </motion.div>

          <motion.div
            className="dashboard__metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="dashboard__metric-icon dashboard__metric-icon--blue">
              <ShoppingBag size={20} />
            </div>
            <div className="dashboard__metric-info">
              <span className="dashboard__metric-label">Orders</span>
              <span className="dashboard__metric-value">{stats.totalOrders}</span>
            </div>
          </motion.div>

          <motion.div
            className="dashboard__metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="dashboard__metric-icon dashboard__metric-icon--yellow">
              <TrendingUp size={20} />
            </div>
            <div className="dashboard__metric-info">
              <span className="dashboard__metric-label">Avg Order</span>
              <span className="dashboard__metric-value">${stats.avgOrderValue.toFixed(2)}</span>
            </div>
          </motion.div>

          <motion.div
            className="dashboard__metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="dashboard__metric-icon dashboard__metric-icon--purple">
              <Package size={20} />
            </div>
            <div className="dashboard__metric-info">
              <span className="dashboard__metric-label">Items Sold</span>
              <span className="dashboard__metric-value">{stats.totalItems}</span>
            </div>
          </motion.div>
        </div>

        <div className="dashboard__bottom-row">
          <motion.div
            className="dashboard__chart-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2>Hourly Sales</h2>
            <div className="dashboard__chart">
              {fullHourlyData.length === 0 ? (
                <div className="dashboard__chart-empty">No sales data yet</div>
              ) : (
                fullHourlyData.map((hourData, index) => {
                  const height = `${((hourData.revenue || 0) / maxSales) * 100}%`;
                  return (
                    <div className="dashboard__chart-bar-container" key={hourData._id}>
                      <span className="dashboard__chart-value">
                        {hourData.revenue > 0 ? `$${(hourData.revenue || 0).toFixed(0)}` : ''}
                      </span>
                      <motion.div
                        className="dashboard__chart-bar"
                        initial={{ height: 0 }}
                        animate={{ height }}
                        transition={{ delay: 0.3 + index * 0.05, duration: 0.5, type: 'spring' }}
                      />
                      <span className="dashboard__chart-label">{hourData._id}:00</span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          <motion.div
            className="dashboard__popular-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2>Popular Items</h2>
            <div className="dashboard__popular-list">
              {stats.popularItems.length === 0 ? (
                <div className="dashboard__popular-empty">No items sold yet</div>
              ) : (
                stats.popularItems.map((item, idx) => (
                  <div className="dashboard__popular-item" key={item._id}>
                    <div className="dashboard__popular-rank">{idx + 1}</div>
                    <div className="dashboard__popular-name">{item.name}</div>
                    <div className="dashboard__popular-count">{item.count} sold</div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
