import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

const ExpenseForm = () => {
  const { addExpense, categories } = useContext(AppContext);
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    category: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: today }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.date) {
      setError('Please select a date');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }

    try {
      // Create new expense object
      const newExpense = {
        id: crypto.randomUUID(),
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
        date: formData.date,
        createdAt: new Date().toISOString(),
      };

      // Call addExpense from context (async)
      await addExpense(newExpense);
      setSuccess('Expense added successfully!');

      // Reset form fields
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        date: today,
        amount: '',
        category: '',
        description: ''
      });

      // Clear messages after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add expense. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="card">
      <h2>Add Expense</h2>
      
      {error && (
        <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#fee', border: '1px solid #f99', borderRadius: '4px', color: '#c33' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#efe', border: '1px solid #9f9', borderRadius: '4px', color: '#3c3' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontFamily: 'inherit'
            }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Amount (₹):</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="1"
            step="1"
            placeholder="0"
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontFamily: 'inherit'
            }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Category:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontFamily: 'inherit'
            }}
          >
            <option value="" disabled>Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description:</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What was this expense for?"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontFamily: 'inherit'
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
        >
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;