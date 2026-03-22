import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import SummaryCards from "./components/SummaryCards";
import CategoryManager from "./components/CategoryManager";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Expense Tracker</h1>
      <SummaryCards />
      <ExpenseForm />
      <ExpenseList />
      <CategoryManager />
    </div>
  );
}

export default App;