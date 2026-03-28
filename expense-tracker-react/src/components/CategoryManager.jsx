import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContextBase';
import { formatCurrency, getCategoryDefaultTarget, getCategoryName } from '../utils/utils';

const CategoryManager = () => {
  const { categories, addCategory, removeCategory } = useContext(AppContext);
  const [newCategory, setNewCategory] = useState('');
  const [defaultTarget, setDefaultTarget] = useState('');
  const [message, setMessage] = useState('');

  const handleAddCategory = async () => {
    const trimmedName = newCategory.trim();
    if (!trimmedName) {
      setMessage('Category name cannot be empty.');
      return;
    }

    try {
      await addCategory({
        id: Date.now().toString(),
        name: trimmedName,
        defaultTarget: Number(defaultTarget || 0),
        budget: Number(defaultTarget || 0),
      });
      setNewCategory('');
      setDefaultTarget('');
      setMessage('Category added successfully.');
      window.setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Could not add category right now.');
      console.error(error);
    }
  };

  return (
    <section className="prototype-panel prototype-panel--tall">
      <div className="section-heading section-heading--spread">
        <h2>Manage Categories</h2>
        <span className="section-chip">Applies to all months</span>
      </div>

      {message && <div className="status-banner status-banner--info">{message}</div>}

      <div className="category-create">
        <input
          className="app-input"
          type="text"
          value={newCategory}
          onChange={(event) => setNewCategory(event.target.value)}
          placeholder="New category name"
        />
        <input
          className="app-input"
          type="number"
          min="0"
          step="100"
          value={defaultTarget}
          onChange={(event) => setDefaultTarget(event.target.value)}
          placeholder="Default target (INR)"
        />
        <button type="button" className="app-button app-button--primary" onClick={handleAddCategory}>
          Add Category
        </button>
      </div>

      <div className="category-list">
        {categories.map((category) => {
          const categoryName = getCategoryName(category);
          const defaultBudget = getCategoryDefaultTarget(category);

          return (
            <div key={categoryName} className="list-item">
              <div className="list-item__main">
                <strong>{categoryName}</strong>
                <span>Default: {formatCurrency(defaultBudget)}</span>
              </div>
              <button
                type="button"
                className="app-button app-button--danger app-button--small"
                onClick={() => removeCategory(categoryName)}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryManager;
