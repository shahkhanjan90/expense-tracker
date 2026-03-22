import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const ExpenseList = () => {
  const { expenses, deleteExpense } = useContext(AppContext);

  if (!expenses.length) {
    return <div className="card"><p>No expenses yet</p></div>;
  }

  return (
    <div className="card">
      <h2>Expenses</h2>

      {expenses.map((expense) => (
        <div
          key={expense.id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <div>
            <strong>{expense.category}</strong>
          </div>

          <div>{expense.description}</div>

          <div>₹{expense.amount}</div>

          <button onClick={async () => await deleteExpense(expense.id)} className="button" style={{ padding: '8px 16px', fontSize: '14px' }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;