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

  const handleSubmit = async (e) => {
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
      createdAt: new Date().toISOString(),
    };

    // Call addExpense from context (async)
    await addExpense(newExpense);

    // Reset form fields
    setFormData({
      date: '',
      amount: '',
      category: '',
      description: ''
    });
  };

  return (
    <div className="card">
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
            className="input"
            style={{ marginTop: '5px' }}
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
            className="input"
            style={{ marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Category:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="input"
            style={{ marginTop: '5px' }}
          >
            <option value="" disabled>Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
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
            className="input"
            style={{ marginTop: '5px' }}
          />
        </div>
        <button
          type="submit"
          className="button"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;