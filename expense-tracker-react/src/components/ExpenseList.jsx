import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const ExpenseList = () => {
  const { expenses, deleteExpense } = useContext(AppContext);

  if (!expenses.length) {
    return <p>No expenses yet</p>;
  }

  return (
    <div>
      <h2>Expenses</h2>

      {expenses.map((expense) => (
        <div
          key={expense.id}
          style={{
            border: "1px solid #ccc",
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

          <button onClick={async () => await deleteExpense(expense.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;