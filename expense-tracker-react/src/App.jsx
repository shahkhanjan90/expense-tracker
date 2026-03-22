import { useState } from "react";
import ExpenseList from "./components/ExpenseList";

function App() {
  const [expenses, setExpenses] = useState([
    {
      id: "1",
      amount: 2000,
      category: "Medicine",
      description: "Medicines",
    },
    {
      id: "2",
      amount: 31000,
      category: "Housing",
      description: "Rent",
    },
  ]);

  const handleDelete = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Expense Tracker</h1>

      <ExpenseList expenses={expenses} onDelete={handleDelete} />
    </div>
  );
}

export default App;