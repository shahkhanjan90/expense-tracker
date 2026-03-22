import SummaryCards from '../components/SummaryCards';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <SummaryCards />
      <div className="flex-row">
        <div style={{ flex: 1 }}>
          <ExpenseForm />
        </div>
        <div style={{ flex: 1 }}>
          <ExpenseList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;