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

  const utilization = getUtilization(totalExpenses, totalTarget);

  const remainingBudget = totalTarget - totalExpenses;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '20px 0' }}>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3>Total Monthly Expenses</h3>
        <p>₹{totalExpenses.toFixed(2)}</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3>Total Target</h3>
        <p>₹{totalTarget.toFixed(2)}</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3>Utilization %</h3>
        <p>{utilization.toFixed(2)}%</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3>Remaining Budget</h3>
        <p>₹{remainingBudget.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default SummaryCards;