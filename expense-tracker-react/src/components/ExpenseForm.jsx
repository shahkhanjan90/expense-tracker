import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContextBase';
import { getCategoryName } from '../utils/utils';

const ExpenseForm = () => {
  const { addExpense, categories } = useContext(AppContext);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.date) {
      setError('Please select a date.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter an amount greater than 0.');
      return;
    }
    if (!formData.category) {
      setError('Please choose a category.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please add a short description.');
      return;
    }

    try {
      await addExpense({
        id: crypto.randomUUID(),
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
        date: formData.date,
        createdAt: new Date().toISOString(),
      });

      setSuccess('Expense added successfully.');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: '',
      });
      window.setTimeout(() => setSuccess(''), 3000);
    } catch (submitError) {
      setError('Failed to add expense. Please try again.');
      console.error(submitError);
    }
  };

  return (
    <section className="prototype-panel">
      <div className="section-heading">
        <h2>Add Expense</h2>
      </div>

      {error && <div className="status-banner status-banner--error">{error}</div>}
      {success && <div className="status-banner status-banner--success">{success}</div>}

      <form className="expense-form" onSubmit={handleSubmit}>
        <div className="expense-form__row">
          <label className="field">
            <span className="field__label">Date</span>
            <input
              className="app-input"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Amount</span>
            <input
              className="app-input"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              step="1"
              placeholder="0"
              required
            />
          </label>
        </div>

        <label className="field">
          <span className="field__label">Category</span>
          <select
            className="app-input"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => {
              const categoryName = getCategoryName(category);
              return (
                <option key={categoryName} value={categoryName}>
                  {categoryName}
                </option>
              );
            })}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Description</span>
          <input
            className="app-input"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What was this expense for?"
          />
        </label>

        <button type="submit" className="app-button app-button--primary app-button--full">
          Add Expense
        </button>
      </form>
    </section>
  );
};

export default ExpenseForm;
