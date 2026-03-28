import { useEffect, useState } from 'react';
import CategoryManager from '../components/CategoryManager';
import TargetsManager from '../components/TargetsManager';
import DataBackup from '../components/Configuration';

const RECURRING_STORAGE_KEY = 'expense-tracker-recurring-items';

const RecurringExpensesPanel = () => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
  });
  const [items, setItems] = useState(() => {
    try {
      const raw = window.localStorage.getItem(RECURRING_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load recurring items:', error);
    }
    return [];
  });

  useEffect(() => {
    window.localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.description.trim() || !formData.amount || !formData.category) {
      return;
    }

    setItems((current) => [
      ...current,
      {
        id: Date.now().toString(),
        description: formData.description.trim(),
        amount: Number(formData.amount),
        category: formData.category,
      },
    ]);

    setFormData({ description: '', amount: '', category: '' });
  };

  const handleRemove = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <section className="prototype-panel prototype-panel--compact">
      <div className="section-heading">
        <h2>Recurring Expenses</h2>
        <span className="section-chip">Saved locally on this browser</span>
      </div>

      <form className="recurring-form" onSubmit={handleSubmit}>
        <input
          className="app-input"
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description (e.g., Rent)"
        />
        <input
          className="app-input"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          min="0"
          step="1"
          placeholder="Amount (INR)"
        />
        <select
          className="app-input"
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">Select</option>
          <option value="Housing">Housing</option>
          <option value="Transportation">Transportation</option>
          <option value="Medicine">Medicine</option>
        </select>
        <button type="submit" className="app-button app-button--primary">
          Save Recurring
        </button>
      </form>

      {items.length > 0 && (
        <div className="recurring-list">
          {items.map((item) => (
            <div key={item.id} className="list-item">
              <div className="list-item__main">
                <strong>{item.description}</strong>
                <span>{item.category}</span>
              </div>
              <div className="list-item__actions">
                <strong>{item.amount.toLocaleString('en-IN')}</strong>
                <button
                  type="button"
                  className="app-button app-button--danger app-button--small"
                  onClick={() => handleRemove(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const Configuration = () => {
  return (
    <div className="configuration-layout">
      <TargetsManager />
      <CategoryManager />
      <DataBackup />
      <RecurringExpensesPanel />
    </div>
  );
};

export default Configuration;
