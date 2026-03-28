import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContextBase';
import { formatCurrency, formatDate, formatMonthLabel, getMonthlyExpenses } from '../utils/utils';

const ExpenseList = () => {
  const { expenses, activeMonth, deleteExpense } = useContext(AppContext);
  const [query, setQuery] = useState('');

  const monthlyExpenses = getMonthlyExpenses(expenses, activeMonth);
  const filteredExpenses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sortedExpenses = [...monthlyExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!normalizedQuery) {
      return sortedExpenses;
    }

    return sortedExpenses.filter((expense) => {
      return [expense.category, expense.description, expense.date]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    });
  }, [monthlyExpenses, query]);

  const total = monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  return (
    <section className="prototype-panel">
      <div className="section-heading section-heading--spread">
        <div>
          <h2>Expenses - {formatMonthLabel(activeMonth)}</h2>
        </div>
        <div className="total-pill">
          <span>Total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </div>

      <input
        className="app-input expense-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search expenses..."
      />

      {filteredExpenses.length === 0 ? (
        <div className="empty-state">
          {monthlyExpenses.length === 0 ? 'No expenses recorded for this month.' : 'No expenses match your search.'}
        </div>
      ) : (
        <div className="expense-list">
          {filteredExpenses.map((expense) => (
            <article key={expense.id} className="expense-item">
              <div className="expense-item__content">
                <div className="expense-item__topline">
                  <div className="expense-item__headline">
                    <strong>{formatDate(expense.date)}</strong>
                    <span className="expense-chip">{expense.category}</span>
                  </div>
                  <strong className="expense-item__amount">{formatCurrency(Number(expense.amount))}</strong>
                </div>
                <p>{expense.description}</p>
              </div>
              <button
                type="button"
                className="app-button app-button--danger app-button--small"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this expense?')) {
                    await deleteExpense(expense.id);
                  }
                }}
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ExpenseList;
