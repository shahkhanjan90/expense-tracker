import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

const TargetsManager = () => {
  const { targets, addOrUpdateTarget } = useContext(AppContext);
  const [formData, setFormData] = useState({
    category: '',
    month: '',
    amount: ''
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
    if (!formData.category || !formData.month || !formData.amount) {
      alert('Please fill all fields');
      return;
    }
    await addOrUpdateTarget({
      category: formData.category,
      month: formData.month,
      targets: formData.amount // Use 'targets' to match sheet column
    });
    setFormData({ category: '', month: '', amount: '' });
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px 0' }}>
      <h2>Manage Targets</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Category:</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Food"
            required
            style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Month:</label>
          <input
            type="month"
            name="month"
            value={formData.month}
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
            placeholder="0"
            required
            style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 16px' }}>Add Target</button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
        {targets.map((target, index) => (
          <li key={index} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
            {target.category} - {target.month}: ₹{target.targets}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TargetsManager;