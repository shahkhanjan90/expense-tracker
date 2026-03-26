import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  getMonthlyExpenses,
  getExpensesByCategory,
  getTotalExpenses,
  getUtilization,
} from '../utils/utils';

const Charts = () => {
  const { expenses, targets = [], activeMonth, categories = [] } = useContext(AppContext);

  const monthlyExpenses = getMonthlyExpenses(expenses, activeMonth);
  const categorySpends = getExpensesByCategory(monthlyExpenses);
  const totalExpenses = getTotalExpenses(monthlyExpenses);

  // Calculate category-wise data
  const categoryData = categories.map(cat => {
    const catName = cat.name;
    const spent = categorySpends[catName] || 0;
    const target = targets.find(t => t.category === catName && t.month === activeMonth);
    const targetAmount = target ? Number(target.targets) : (cat.defaultTarget || 0);
    const utilization = getUtilization(spent, targetAmount);
    const isOverBudget = spent > targetAmount;

    return {
      category: catName,
      spent,
      target: targetAmount,
      utilization,
      isOverBudget,
      overBy: isOverBudget ? spent - targetAmount : 0,
      percentage: totalExpenses > 0 ? (spent / totalExpenses) * 100 : 0
    };
  }).filter(item => item.spent > 0 || item.target > 0).sort((a, b) => b.spent - a.spent);

  // Overall utilization
  const totalTarget = categories.reduce((sum, cat) => {
    const target = targets.find(t => t.category === cat.name && t.month === activeMonth);
    return sum + (target ? Number(target.targets) : (cat.defaultTarget || 0));
  }, 0);
  const overallUtilization = getUtilization(totalExpenses, totalTarget);
  const overBudgetCategories = categoryData.filter(item => item.isOverBudget);

  return (
    <div>
      {/* Overall Summary */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>Monthly Overview - {activeMonth}</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px'
        }}>
          <div style={{ padding: '15px', backgroundColor: 'var(--bg-soft)', borderRadius: '6px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>Total Spent</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
              ₹{totalExpenses.toFixed(0)}
            </div>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'var(--bg-soft)', borderRadius: '6px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>Total Budget</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>₹{totalTarget.toFixed(0)}</div>
          </div>
          <div style={{
            padding: '15px',
            backgroundColor: overallUtilization > 100 ? 'rgba(220, 38, 38, 0.1)' : 'var(--bg-soft)',
            borderRadius: '6px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>Utilization</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: overallUtilization > 100 ? 'var(--danger)' : 'var(--primary)'
            }}>
              {overallUtilization.toFixed(1)}%
            </div>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'var(--bg-soft)', borderRadius: '6px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>Remaining</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: totalExpenses > totalTarget ? 'var(--danger)' : '#059669'
            }}>
              ₹{Math.max(0, totalTarget - totalExpenses).toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Over Budget Alert */}
      {overBudgetCategories.length > 0 && (
        <div className="card" style={{
          marginBottom: '20px',
          backgroundColor: 'rgba(220, 38, 38, 0.05)',
          border: '1px solid rgba(220, 38, 38, 0.2)',
        }}>
          <h3 style={{ color: 'var(--danger)', marginBottom: '10px' }}>⚠️ Over Budget Categories</h3>
          {overBudgetCategories.map(item => (
            <div key={item.category} style={{ marginBottom: '10px', padding: '8px', backgroundColor: 'var(--card)', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <strong>{item.category}</strong>
                <span style={{ color: 'var(--danger)', fontWeight: '700' }}>
                  Over by ₹{item.overBy.toFixed(0)}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                Spent: ₹{item.spent.toFixed(0)} / Budget: ₹{item.target.toFixed(0)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Distribution Chart */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Category-wise Distribution</h3>
        <div style={{ marginTop: '15px' }}>
          {categoryData.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>No expenses to display</p>
          ) : (
            categoryData.map((item) => (
              <div key={item.category} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <div>
                    <strong>{item.category}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      ₹{item.spent.toFixed(0)} ({item.percentage.toFixed(1)}%)
                    </div>
                  </div>
                  {item.isOverBudget && (
                    <div style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: '700', textAlign: 'right' }}>
                      Over by ₹{item.overBy.toFixed(0)}
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '24px',
                  backgroundColor: 'var(--bg-soft)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(item.utilization, 100)}%`,
                      backgroundColor: item.isOverBudget ? 'var(--danger)' : 'var(--primary)',
                      transition: 'width 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: item.utilization > 50 ? 'flex-end' : 'flex-start',
                      paddingRight: item.utilization > 50 ? '8px' : '0',
                      paddingLeft: item.utilization <= 50 ? '8px' : '0',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}
                  >
                    {item.utilization > 20 && `${item.utilization.toFixed(0)}%`}
                  </div>
                  {item.isOverBudget && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '100%',
                        height: '100%',
                        width: `${Math.min(item.utilization - 100, 50)}%`,
                        backgroundColor: 'rgba(220, 38, 38, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '4px',
                        color: 'var(--danger)',
                        fontSize: '10px',
                        fontWeight: '700'
                      }}
                    >
                      {(item.utilization - 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Utilization Table */}
      <div className="card">
        <h3>Utilization by Category</h3>
        <div style={{ overflowX: 'auto', marginTop: '15px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '10px', fontWeight: '700', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase' }}>Category</th>
                <th style={{ textAlign: 'right', padding: '10px', fontWeight: '700', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase' }}>Spent</th>
                <th style={{ textAlign: 'right', padding: '10px', fontWeight: '700', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase' }}>Budget</th>
                <th style={{ textAlign: 'right', padding: '10px', fontWeight: '700', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase' }}>Usage</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map(item => (
                <tr key={item.category} style={{
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: item.isOverBudget ? 'rgba(220, 38, 38, 0.05)' : 'transparent'
                }}>
                  <td style={{ padding: '10px', fontWeight: '500' }}>{item.category}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>₹{item.spent.toFixed(0)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>₹{item.target.toFixed(0)}</td>
                  <td style={{
                    textAlign: 'right',
                    padding: '10px',
                    color: item.isOverBudget ? 'var(--danger)' : 'var(--primary)',
                    fontWeight: '700'
                  }}>
                    {item.utilization.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Charts;