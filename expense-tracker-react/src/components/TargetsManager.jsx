import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContextBase';
import {
  formatMonthLabel,
  getCategoryDefaultTarget,
  getCategoryName,
  getTargetAmount,
  getTargetMonth,
} from '../utils/utils';

const TargetsManager = () => {
  const { categories, targets, activeMonth, addOrUpdateTarget } = useContext(AppContext);
  const [targetValues, setTargetValues] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const existingTargets = targets
      .filter((target) => getTargetMonth(target) === activeMonth)
      .reduce((accumulator, target) => {
        accumulator[target.category] = getTargetAmount(target);
        return accumulator;
      }, {});

    const nextValues = categories.reduce((accumulator, category) => {
      const categoryName = getCategoryName(category);
      accumulator[categoryName] = existingTargets[categoryName] ?? getCategoryDefaultTarget(category);
      return accumulator;
    }, {});

    setTargetValues(nextValues);
  }, [targets, activeMonth, categories]);

  const handleChange = (categoryName, value) => {
    setTargetValues((current) => ({
      ...current,
      [categoryName]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setMessage('');

      for (const category of categories) {
        const categoryName = getCategoryName(category);
        const amount = Number(targetValues[categoryName] || 0);
        if (amount >= 0) {
          await addOrUpdateTarget({ category: categoryName, month: activeMonth, targets: amount });
        }
      }

      setMessage('Targets saved successfully.');
      window.setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving targets. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm('Load category defaults into this form? You can save afterward if they look right.')) {
      return;
    }

    const defaults = categories.reduce((accumulator, category) => {
      const categoryName = getCategoryName(category);
      accumulator[categoryName] = getCategoryDefaultTarget(category);
      return accumulator;
    }, {});
    setTargetValues(defaults);
    setMessage('Defaults loaded. Save Targets to persist them.');
    window.setTimeout(() => setMessage(''), 3000);
  };

  return (
    <section className="prototype-panel prototype-panel--tall">
      <div className="section-heading section-heading--spread">
        <h2>Set Custom Monthly Targets</h2>
        <span className="section-chip">Targets for {formatMonthLabel(activeMonth)}</span>
      </div>

      {message && <div className="status-banner status-banner--info">{message}</div>}

      <div className="target-list">
        {categories.map((category) => {
          const categoryName = getCategoryName(category);
          return (
            <label key={categoryName} className="target-row">
              <span className="target-row__label">{categoryName}</span>
              <input
                className="app-input"
                type="number"
                min="0"
                step="100"
                value={targetValues[categoryName] ?? ''}
                onChange={(event) => handleChange(categoryName, event.target.value)}
              />
            </label>
          );
        })}
      </div>

      <div className="button-row">
        <button
          type="button"
          className="app-button app-button--primary"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Targets'}
        </button>
        <button type="button" className="app-button app-button--secondary" onClick={handleReset}>
          Reset to Default
        </button>
      </div>
    </section>
  );
};

export default TargetsManager;
