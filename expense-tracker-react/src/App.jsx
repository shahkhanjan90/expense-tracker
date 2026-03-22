import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Expense Tracker</h1>
      <ExpenseForm />
      <ExpenseList />
    </div>
  );
}

export default App;