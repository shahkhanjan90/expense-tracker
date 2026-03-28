import { useContext } from 'react';
import { AppContext } from '../context/AppContextBase';
import {
  findTargetForCategoryMonth,
  formatCurrency,
  formatMonthLabel,
  getCategoryDefaultTarget,
  getCategoryName,
  getExpensesByCategory,
  getMonthlyExpenses,
  getTargetAmount,
  getTotalExpenses,
  getUtilization,
} from '../utils/utils';

const Charts = () => {
  const { expenses, targets = [], activeMonth, categories = [] } = useContext(AppContext);

  const monthlyExpenses = getMonthlyExpenses(expenses, activeMonth);
  const categorySpends = getExpensesByCategory(monthlyExpenses);
  const totalExpenses = getTotalExpenses(monthlyExpenses);

  const categoryNames = new Set(categories.map((category) => getCategoryName(category)));
  Object.keys(categorySpends).forEach((categoryName) => categoryNames.add(categoryName));

  const categoryData = Array.from(categoryNames)
    .map((category) => {
      const categoryObject = categories.find((item) => getCategoryName(item) === category) || category;
      const categoryName = getCategoryName(categoryObject);
      const spent = categorySpends[categoryName] || 0;
      const matchingTarget = findTargetForCategoryMonth(targets, categoryName, activeMonth);
      const targetAmount = matchingTarget ? getTargetAmount(matchingTarget) : getCategoryDefaultTarget(categoryObject);

      return {
        category: categoryName,
        spent,
        target: targetAmount,
        utilization: getUtilization(spent, targetAmount),
      };
    })
    .filter((item) => item.spent > 0 || item.target > 0);

  const chartMax = Math.max(...categoryData.flatMap((item) => [item.spent, item.target]), 1);
  const totalTarget = categoryData.reduce((sum, item) => sum + item.target, 0);
  const overallUtilization = getUtilization(totalExpenses, totalTarget);

  return (
    <section className="prototype-panel chart-panel">
      <div className="section-heading section-heading--spread">
        <div>
          <h2>Monthly Utilization</h2>
          <p>{formatMonthLabel(activeMonth)}</p>
        </div>
        <span className="section-chip section-chip--summary">
          {formatCurrency(totalExpenses)} / {formatCurrency(totalTarget)} ({overallUtilization.toFixed(1)}%)
        </span>
      </div>

      {categoryData.length === 0 ? (
        <div className="empty-state">No expenses or targets available for this month yet.</div>
      ) : (
        <>
          <div className="chart-legend">
            <span className="chart-legend__item">
              <span className="chart-legend__swatch chart-legend__swatch--actual" />
              Actual Spend
            </span>
            <span className="chart-legend__item">
              <span className="chart-legend__swatch chart-legend__swatch--target" />
              Target
            </span>
          </div>

          <div className="bar-chart">
            <div className="bar-chart__canvas">
              {[0, 20, 40, 60, 80, 100].map((step) => (
                <div key={step} className="bar-chart__grid-line" style={{ bottom: `${step}%` }} />
              ))}

              <div className="bar-chart__columns">
                {categoryData.map((item) => (
                  <div key={item.category} className="bar-chart__column">
                    <div className="bar-chart__bars">
                      <div
                        className="bar-chart__bar bar-chart__bar--actual"
                        style={{ height: `${(item.spent / chartMax) * 100}%` }}
                        title={`${item.category} actual: ${formatCurrency(item.spent)}`}
                      />
                      <div
                        className="bar-chart__bar bar-chart__bar--target"
                        style={{ height: `${(item.target / chartMax) * 100}%` }}
                        title={`${item.category} target: ${formatCurrency(item.target)}`}
                      />
                    </div>
                    <div className="bar-chart__label">{item.category}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Charts;
