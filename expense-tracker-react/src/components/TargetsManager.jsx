import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

const TargetsManager = () => {
  const { categories, targets, activeMonth, addOrUpdateTarget } = useContext(AppContext);
  const [targetValues, setTargetValues] = useState({});

  // Load existing targets for the active month
  useEffect(() => {
    const existingTargets = targets
      .filter(target => target.month === activeMonth)
      .reduce((acc, target) => {
        acc[target.category] = target.targets;
        return acc;
      }, {});
    setTargetValues(existingTargets);
  }, [targets, activeMonth]);

  const handleChange = (categoryName, value) => {
    setTargetValues({
      ...targetValues,
      [categoryName]: value
    });
  };

  const handleSave = async () => {
    for (const category of categories) {
      const amount = targetValues[category.name];
      if (amount && Number(amount) > 0) {
        await addOrUpdateTarget({ category: category.name, month: activeMonth, targets: amount });
      }
    }
    alert('Targets saved!');
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px 0' }}>
      <h2>Manage Targets for {activeMonth}</h2>
      {categories.map(category => (
        <div key={category.id} style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>{category.name}:</label>
          <input
            type="number"
            value={targetValues[category.name] || ''}
            onChange={(e) => handleChange(category.name, e.target.value)}
            placeholder="Enter target amount"
            style={{ padding: '8px', width: '100%' }}
          />
        </div>
      ))}
      <button onClick={handleSave} style={{ padding: '10px 20px', marginTop: '20px' }}>
        Save Targets
      </button>
    </div>
  );
};

export default TargetsManager;