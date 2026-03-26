import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { formatMonthLabel } from '../utils/utils';

const TargetsManager = () => {
  const { categories, targets, activeMonth, addOrUpdateTarget, resetTargetsToDefault } = useContext(AppContext);
  const [targetValues, setTargetValues] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    try {
      setIsLoading(true);
      setMessage('');
      for (const category of categories) {
        const amount = targetValues[category.name];
        if (amount && Number(amount) > 0) {
          await addOrUpdateTarget({ category: category.name, month: activeMonth, targets: amount });
        }
      }
      setMessage('✓ Targets saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('✗ Error saving targets. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset targets to defaults for this month?')) {
      resetTargetsToDefault();
      const defaultTargets = categories.reduce((acc, cat) => {
        acc[cat.name] = cat.defaultTarget || 0;
        return acc;
      }, {});
      setTargetValues(defaultTargets);
      setMessage('✓ Targets reset to defaults!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="card">
      <h2>Budget Targets for {formatMonthLabel(activeMonth)}</h2>
      
      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: message.includes('✓') ? '#efe' : '#fee',
          border: `1px solid ${message.includes('✓') ? '#9f9' : '#f99'}`,
          borderRadius: '4px',
          color: message.includes('✓') ? '#3c3' : '#c33',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}

      <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '15px' }}>
        {categories.map(category => (
          <div key={category.id} style={{ marginBottom: '15px', padding: '12px', backgroundColor: 'var(--bg-soft)', borderRadius: '6px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              {category.name}
              <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '8px' }}>
                (Default: ₹{category.defaultTarget || 0})
              </span>
            </label>
            <input
              type="number"
              value={targetValues[category.name] || ''}
              onChange={(e) => handleChange(category.name, e.target.value)}
              placeholder="Enter target amount"
              min="0"
              step="100"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontFamily: 'inherit'
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          onClick={handleSave}
          disabled={isLoading}
          style={{
            padding: '10px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            fontWeight: '500',
            transition: 'opacity 0.2s'
          }}
        >
          {isLoading ? 'Saving...' : 'Save Targets'}
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '10px',
            backgroundColor: '#666',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default TargetsManager;