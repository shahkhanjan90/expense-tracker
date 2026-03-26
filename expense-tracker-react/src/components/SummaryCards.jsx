import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  getTotalExpenses,
  getMonthlyExpenses,
  getUtilization,
  getPreviousMonthExpenses,
  getMonthsTracked,
  calculateTrend,
  getPreviousMonthKey,
  formatCurrency
} from '../utils/utils';

const SummaryCards = () => {
  const { expenses, targets = [], activeMonth, categories = [] } = useContext(AppContext);

  const monthlyExpenses = getMonthlyExpenses(expenses, activeMonth);
  const totalExpenses = getTotalExpenses(monthlyExpenses);
  const previousMonthExpenses = getPreviousMonthExpenses(expenses, activeMonth);
  const previousMonthTotal = getTotalExpenses(previousMonthExpenses);
  const monthsTracked = getMonthsTracked(expenses);

  // Calculate total target for the active month
  const totalTarget = categories.reduce((sum, cat) => {
    const target = targets.find(t => t.category === cat.name && t.month === activeMonth);
    const amount = target ? Number(target.targets) : Number(cat.defaultTarget) || 0;
    return sum + amount;
  }, 0);

  const previousMonthTarget = categories.reduce((sum, cat) => {
    const prevMonth = getPreviousMonthKey(activeMonth);
    const target = targets.find(t => t.category === cat.name && t.month === prevMonth);
    const amount = target ? Number(target.targets) : Number(cat.defaultTarget) || 0;
    return sum + amount;
  }, 0);

  const utilization = getUtilization(totalExpenses, totalTarget);
  const previousUtilization = getUtilization(previousMonthTotal, previousMonthTarget);
  const remainingBudget = totalTarget - totalExpenses;
  const isOverBudget = totalExpenses > totalTarget;

  const spendTrend = calculateTrend(totalExpenses, previousMonthTotal);
  const targetTrend = calculateTrend(totalTarget, previousMonthTarget);
  const utilizationTrend = calculateTrend(utilization, previousUtilization);

  const TrendIndicator = ({ trend, format }) => (
    <div style={{
      fontSize: '12px',
      marginTop: '5px',
      color: trend.status === 'up' ? '#dc2626' : trend.status === 'down' ? '#059669' : '#64748b',
      fontWeight: '500'
    }}>
      {trend.arrow} {trend.percent.toFixed(1)}% vs last month
    </div>
  );

  const SummaryTile = ({ title, value, subtitle, trend, isAlert }) => (
    <div
      className="card"
      style={{
        textAlign: 'center',
        borderLeft: isAlert ? '4px solid var(--danger)' : 'none',
        backgroundColor: isAlert ? 'rgba(220, 38, 38, 0.05)' : 'var(--card)',
        transition: 'all 0.2s'
      }}
    >
      <h3 style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '24px', fontWeight: '700', margin: '8px 0', color: isAlert ? 'var(--danger)' : 'var(--text)' }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '4px 0' }}>
          {subtitle}
        </p>
      )}
      {trend && <TrendIndicator trend={trend} />}
    </div>
  );

  return (
    <>
      {isOverBudget && (
        <div
          style={{
            padding: '12px',
            marginBottom: '15px',
            backgroundColor: '#fee',
            border: '1px solid #f99',
            borderRadius: '6px',
            color: '#c33',
            fontWeight: '500'
          }}
        >
          ⚠️ Budget Alert: You have exceeded your budget by ₹{(totalExpenses - totalTarget).toFixed(2)}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <SummaryTile
          title="Month Spend"
          value={`₹${totalExpenses.toFixed(0)}`}
          subtitle={`of ₹${totalTarget.toFixed(0)} budget`}
          trend={spendTrend}
        />
        <SummaryTile
          title="Budget Target"
          value={`₹${totalTarget.toFixed(0)}`}
          trend={targetTrend}
        />
        <SummaryTile
          title="Utilization"
          value={`${utilization.toFixed(1)}%`}
          subtitle={utilization > 100 ? 'Over budget' : `${(100 - utilization).toFixed(1)}% remaining`}
          trend={utilizationTrend}
          isAlert={utilization > 100}
        />
        <SummaryTile
          title="Months Tracked"
          value={monthsTracked}
          subtitle="Including current month"
        />
      </div>
    </>
  );
};

export default SummaryCards;