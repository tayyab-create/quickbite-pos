import { motion } from 'motion/react';
import './CategoryTabs.css';

const CATEGORIES = [
  { key: 'All', emoji: '✨', label: 'All Items' },
  { key: 'Burgers', emoji: '🍔', label: 'Burgers' },
  { key: 'Chicken', emoji: '🍗', label: 'Chicken' },
  { key: 'Sides', emoji: '🍟', label: 'Sides' },
  { key: 'Drinks', emoji: '🥤', label: 'Drinks' },
  { key: 'Desserts', emoji: '🍨', label: 'Desserts' },
  { key: 'Combos', emoji: '🍱', label: 'Combos' },
];

export default function CategoryTabs({ activeCategory, onCategoryChange }) {
  return (
    <nav className="category-tabs" id="category-tabs" aria-label="Menu categories">
      <div className="category-tabs__track">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.key}
            className={`category-tab ${activeCategory === cat.key ? 'category-tab--active' : ''}`}
            onClick={() => onCategoryChange(cat.key)}
            id={`category-tab-${cat.key.toLowerCase()}`}
            aria-pressed={activeCategory === cat.key}
            whileTap={{ scale: 0.97 }}
          >
            <span className="category-tab__emoji">{cat.emoji}</span>
            <span className="category-tab__label">{cat.label}</span>
            {activeCategory === cat.key && (
              <motion.div
                className="category-tab__magic-indicator"
                layoutId="activeTabIndicator"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </nav>
  );
}
