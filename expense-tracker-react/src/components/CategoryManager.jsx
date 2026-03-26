import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

const CategoryManager = () => {
  const { categories, addCategory, removeCategory } = useContext(AppContext);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (newCategory.trim() === '') {
      alert('Category name cannot be empty');
      return;
    }
    addCategory({ id: Date.now().toString(), name: newCategory.trim() });
    setNewCategory('');
  };

  return (
    <div className="card">
      <h2>Manage Categories</h2>
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          style={{ flex: 1, marginRight: '10px', padding: '8px' }}
        />
        <button onClick={handleAddCategory} style={{ padding: '8px 16px' }}>
          Add
        </button>
      </div>
      <ul>
        {categories.map((category) => (
          <li key={category.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>{category.name}</span>
            <button onClick={() => removeCategory(category.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryManager;