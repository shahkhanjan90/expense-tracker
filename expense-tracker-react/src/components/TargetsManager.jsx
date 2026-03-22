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
    // For categories without custom targets, use default
    const targetValuesWithDefaults = categories.reduce((acc, cat) => {
      acc[cat.name] = existingTargets[cat.name] || cat.defaultTarget || 0;
      return acc;
    }, {});
    setTargetValues(targetValuesWithDefaults);
  }, [targets, activeMonth, categories]);

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
    <div className="card">
      <h2>Manage Targets for {activeMonth}</h2>
      {categories.map(category => (
        <div key={category.id} style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>{category.name}:</label>
          <input
            type="number"
            value={targetValues[category.name] || ''}
            onChange={(e) => handleChange(category.name, e.target.value)}
            placeholder="Enter target amount"
            className="input"
          />
        </div>
      ))}
      <button onClick={handleSave} className="button" style={{ marginTop: '20px' }}>
        Save Targets
      </button>
    </div>
  );
};

export default TargetsManager;