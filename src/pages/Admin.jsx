import { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../api/api';
import Navigation from '../components/Navigation';
import './Admin.css';

export default function Admin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Burgers',
    emoji: '🍔',
    available: true,
  });

  const loadItems = async () => {
    try {
      const data = await fetchAllMenuItems();
      setItems(data);
      setError(null);
    } catch (err) {
      setError('Failed to load menu items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', price: '', category: 'Burgers', emoji: '🍔', available: true });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      emoji: item.emoji,
      available: item.available,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteMenuItem(id);
      loadItems();
    } catch (err) {
      alert('Failed to delete item: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
    };

    try {
      if (editingItem) {
        await updateMenuItem(editingItem._id, payload);
      } else {
        await createMenuItem(payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) {
      alert('Failed to save item: ' + err.message);
    }
  };

  if (loading) {
    return <div className="admin__loading">Loading Admin Panel...</div>;
  }

  return (
    <div className="admin">
      <header className="admin__header">
        <Settings size={28} className="admin__logo-icon" />
        <h1>Menu Administration</h1>
        <Navigation />
        <button className="admin__add-btn" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Item
        </button>
      </header>

      {error && (
        <div className="admin__error-banner">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <main className="admin__content">
        <div className="admin__table-container">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th className="admin__table-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className={!item.available ? 'admin__row--unavailable' : ''}>
                  <td>
                    <div className="admin__item-cell">
                      <span className="admin__item-emoji">{item.emoji}</span>
                      <div className="admin__item-details">
                        <span className="admin__item-name">{item.name}</span>
                        {item.description && (
                          <span className="admin__item-desc">{item.description}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td className="admin__item-price">${item.price.toFixed(2)}</td>
                  <td>
                    <span className={`admin__status-badge ${item.available ? 'admin__status-badge--active' : 'admin__status-badge--inactive'}`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <div className="admin__actions">
                      <button className="admin__action-btn admin__action-btn--edit" onClick={() => handleOpenEdit(item)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="admin__action-btn admin__action-btn--delete" onClick={() => handleDelete(item._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5" className="admin__empty-row">No menu items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <AnimatePresence>
        {modalOpen && (
          <div className="admin__modal-overlay">
            <motion.div 
              className="admin__modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            >
              <div className="admin__modal-header">
                <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                <button className="admin__modal-close" onClick={() => setModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <form className="admin__form" onSubmit={handleSubmit}>
                <div className="admin__form-row">
                  <div className="admin__form-group admin__form-group--emoji">
                    <label>Emoji</label>
                    <input 
                      type="text" 
                      required 
                      maxLength="2"
                      value={formData.emoji}
                      onChange={(e) => setFormData({...formData, emoji: e.target.value})}
                    />
                  </div>
                  <div className="admin__form-group">
                    <label>Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="admin__form-group">
                  <label>Description</label>
                  <input 
                    type="text" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Short description"
                  />
                </div>

                <div className="admin__form-row">
                  <div className="admin__form-group">
                    <label>Price ($)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0"
                      required 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div className="admin__form-group">
                    <label>Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Burgers">Burgers</option>
                      <option value="Sides">Sides</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>
                </div>

                <div className="admin__form-group admin__form-group--checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                    />
                    Item is available for sale
                  </label>
                </div>

                <div className="admin__form-actions">
                  <button type="button" className="admin__btn-cancel" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="admin__btn-save">
                    {editingItem ? 'Save Changes' : 'Create Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
