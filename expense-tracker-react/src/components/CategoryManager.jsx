import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

const CategoryManager = () => {
  const { categories, addCategory, removeCategory } = useContext(AppContext);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert('Category name is required');
      return;
    }
    if (categories.some(cat => cat.name === newCategory.trim())) {
      alert('Category already exists');
      return;
    }
    await addCategory(newCategory.trim());
    setNewCategory('');
  };

  const handleRemoveCategory = async (id) => {
    if (categories.length <= 1) {
      alert('At least one category is required');
      return;
    }
    await removeCategory(id);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px 0' }}>
      <h2>Manage Categories</h2>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button onClick={handleAddCategory} style={{ padding: '8px 16px' }}>
          Add Category
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {categories.map((category, index) => (
          <li key={category.id || index} style={{ padding: '5px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{category.name} - Default Target: ₹{category.defaultTarget || 0}</span>
            <button onClick={() => handleRemoveCategory(category.id)} style={{ marginLeft: '10px' }}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryManager;