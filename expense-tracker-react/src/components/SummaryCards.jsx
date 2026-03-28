import { useContext } from 'react';
import { AppContext } from '../context/AppContextBase';
import {
  calculateTrend,
  findTargetForCategoryMonth,
  formatCurrency,
  getCategoryDefaultTarget,
  getCategoryName,
  getMonthlyExpenses,
  getMonthsTracked,
  getPreviousMonthExpenses,
  getPreviousMonthKey,
  getTargetAmount,
  getTotalExpenses,
  getUtilization,
} from '../utils/utils';

const METRIC_META = [
  { key: 'spend', title: 'Month Spend', badge: 'Rs' },
  { key: 'target', title: 'Month Target', badge: 'TG' },
  { key: 'utilization', title: 'Utilization', badge: 'UT' },
  { key: 'months', title: 'Months Tracked', badge: 'MN' },
];

const SummaryCards = () => {
  const { expenses, targets = [], activeMonth, categories = [] } = useContext(AppContext);

  const monthlyExpenses = getMonthlyExpenses(expenses, activeMonth);
  const totalExpenses = getTotalExpenses(monthlyExpenses);
  const previousMonthExpenses = getPreviousMonthExpenses(expenses, activeMonth);
  const previousMonthTotal = getTotalExpenses(previousMonthExpenses);
  const previousMonthKey = getPreviousMonthKey(activeMonth);
  const monthsTracked = getMonthsTracked(expenses);

  const totalTarget = categories.reduce((sum, category) => {
    const categoryName = getCategoryName(category);
    const matchingTarget = findTargetForCategoryMonth(targets, categoryName, activeMonth);
    return sum + (matchingTarget ? getTargetAmount(matchingTarget) : getCategoryDefaultTarget(category));
  }, 0);

  const previousMonthTarget = categories.reduce((sum, category) => {
    const categoryName = getCategoryName(category);
    const matchingTarget = findTargetForCategoryMonth(targets, categoryName, previousMonthKey);
    return sum + (matchingTarget ? getTargetAmount(matchingTarget) : getCategoryDefaultTarget(category));
  }, 0);

  const utilization = getUtilization(totalExpenses, totalTarget);
  const previousUtilization = getUtilization(previousMonthTotal, previousMonthTarget);

  const spendTrend = calculateTrend(totalExpenses, previousMonthTotal);
  const targetTrend = calculateTrend(totalTarget, previousMonthTarget);
  const utilizationTrend = calculateTrend(utilization, previousUtilization);

  const metrics = [
    {
      ...METRIC_META[0],
      value: formatCurrency(totalExpenses),
      trend: spendTrend,
      detail: `${formatCurrency(Math.abs(totalExpenses - previousMonthTotal))} vs previous month`,
    },
    {
      ...METRIC_META[1],
      value: formatCurrency(totalTarget),
      trend: targetTrend,
      detail: `${formatCurrency(Math.abs(totalTarget - previousMonthTarget))} vs previous month`,
    },
    {
      ...METRIC_META[2],
      value: `${utilization.toFixed(1)}%`,
      trend: utilizationTrend,
      detail: `${Math.abs(utilization - previousUtilization).toFixed(1)}% vs previous month`,
    },
    {
      ...METRIC_META[3],
      value: String(monthsTracked),
      trend: null,
      detail: `${monthsTracked} month(s) in history`,
    },
  ];

  return (
    <div className="summary-grid">
      {metrics.map((metric) => (
        <article key={metric.key} className="metric-card">
          <div className="metric-card__header">
            <span>{metric.title}</span>
            <span className="metric-card__badge">{metric.badge}</span>
          </div>
          <strong className="metric-card__value">{metric.value}</strong>
          <p
            className={`metric-card__detail ${
              metric.trend?.status === 'down'
                ? 'is-positive'
                : metric.trend?.status === 'up'
                  ? 'is-negative'
                  : ''
            }`}
          >
            {metric.trend ? `${metric.trend.percent.toFixed(1)}% ${metric.detail}` : metric.detail}
          </p>
        </article>
      ))}
    </div>
  );
};

export default SummaryCards;
