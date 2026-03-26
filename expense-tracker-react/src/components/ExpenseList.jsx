import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { getMonthlyExpenses, formatDate } from "../utils/utils";

const ExpenseList = () => {
  const { expenses, activeMonth, deleteExpense } = useContext(AppContext);

  const monthlyExpenses = getMonthlyExpenses(expenses, activeMonth);

  if (!monthlyExpenses || monthlyExpenses.length === 0) {
    return (
      <div className="card">
        <h2>Expenses for {activeMonth || 'Selected Month'}</h2>
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>No expenses recorded for this month</p>
      </div>
    );
  }

  const total = monthlyExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  return (
    <div className="card">
      <h2>Expenses for {activeMonth}</h2>
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'var(--bg-soft)', borderRadius: '4px' }}>
        <strong>Total: ₹{total.toFixed(2)}</strong>
      </div>

      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {monthlyExpenses.map((expense) => (
          <div
            key={expense.id}
            style={{
              border: "1px solid var(--border)",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "6px",
              backgroundColor: 'var(--card)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <strong style={{ color: 'var(--primary)' }}>{expense.category}</strong>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{formatDate(expense.date)}</span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--muted)' }}>{expense.description}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <strong style={{ fontSize: '16px', color: 'var(--primary)', minWidth: '80px', textAlign: 'right' }}>₹{Number(expense.amount).toFixed(2)}</strong>
              <button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this expense?')) {
                    await deleteExpense(expense.id);
                  }
                }}
                style={{
                  padding: '6px 10px',
                  backgroundColor: 'var(--danger)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;