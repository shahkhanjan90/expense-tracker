import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getTotalExpenses, getMonthlyExpenses, getUtilization } from '../utils/utils';

const SummaryCards = () => {
  const { expenses, targets, activeMonth } = useContext(AppContext);

  const monthlyExpenses = getMonthlyExpenses(expenses, activeMonth);
  const totalExpenses = getTotalExpenses(monthlyExpenses);

  // Calculate total target for the active month
  const totalTarget = targets
    .filter(target => target.month === activeMonth)
    .reduce((sum, target) => sum + (Number(target.targets) || 0), 0);

  console.log('Targets:', targets); // Debug
  console.log('Active month:', activeMonth); // Debug
  console.log('Filtered targets:', targets.filter(target => target.month === activeMonth)); // Debug
  console.log('Total target:', totalTarget); // Debug

  const utilization = getUtilization(totalExpenses, totalTarget);

  return (
    <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
        <h3>Total Monthly Expenses</h3>
        <p>₹{totalExpenses.toFixed(2)}</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
        <h3>Total Target</h3>
        <p>₹{totalTarget.toFixed(2)}</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
        <h3>Utilization %</h3>
        <p>{utilization.toFixed(2)}%</p>
      </div>
    </div>
  );
};

export default SummaryCards;