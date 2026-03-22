import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const ExpenseForm = () => {
  const { addExpense, categories } = useContext(AppContext);
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    category: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }
    if (!formData.category) {
      alert('Please select a category');
      return;
    }

    // Create new expense object
    const newExpense = {
      id: Date.now().toString(),
      amount: Number(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
    };

    // Call addExpense from context
    addExpense(newExpense);

    // Reset form fields
    setFormData({
      date: '',
      amount: '',
      category: '',
      description: ''
    });
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px 0' }}>
      <h2>Add Expense</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Amount:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="1"
            step="1"
            placeholder="0"
            required
            style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Category:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="" disabled>Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Description:</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What was this expense for?"
            required
            style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;