import { useState, useEffect } from 'react';
import { Search, Loader } from 'lucide-react';
import { fetchMenu } from '../api/api';
import MenuItem from './MenuItem';
import './MenuGrid.css';

export default function MenuGrid({ category }) {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  // Fetch ALL items once on mount — category filtering is instant client-side
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMenu(null);
        if (!cancelled) {
          setAllItems(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Client-side filtering — instant, no network round-trip
  const filteredItems = allItems.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category;
    const matchesSearch = !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="menu-grid-container" id="menu-grid-container">
      {/* Search bar */}
      <div className="menu-search glass" id="menu-search">
        <Search size={18} className="menu-search__icon" />
        <input
          type="text"
          className="menu-search__input"
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="menu-search-input"
          aria-label="Search menu items"
        />
        {search && (
          <span className="menu-search__count">
            {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="menu-grid__loading">
          <Loader size={32} className="menu-grid__spinner" />
          <span>Loading menu...</span>
        </div>
      ) : error ? (
        <div className="menu-grid__error">
          <span className="menu-grid__error-emoji">⚠️</span>
          <p>Failed to load menu</p>
          <span className="menu-grid__error-detail">{error}</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="menu-grid__empty">
          <span className="menu-grid__empty-emoji">🔍</span>
          <p>No items found</p>
          <span className="menu-grid__empty-detail">
            {search ? 'Try a different search term' : 'This category is empty'}
          </span>
        </div>
      ) : (
        <div className="menu-grid" id="menu-grid">
            {filteredItems.map((item, index) => (
              <MenuItem key={item._id} item={item} index={index} />
            ))}
        </div>
      )}
    </div>
  );
}
