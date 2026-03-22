import { useState } from "react";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";

function App() {
  const [expenses, setExpenses] = useState([]);

  const categories = ["Food", "Travel", "Shopping", "Medicine", "Housing"];

  const handleAddExpense = (newExpense) => {
    // Add new expense to the top of the list
    setExpenses([newExpense, ...expenses]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Expense Tracker</h1>
      <ExpenseForm onAddExpense={handleAddExpense} categories={categories} />
      <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
    </div>
  );
}

export default App;