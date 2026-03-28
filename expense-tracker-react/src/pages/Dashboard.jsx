import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

const Dashboard = () => {
  return (
    <div className="dashboard-grid">
      <ExpenseForm />
      <ExpenseList />
    </div>
  );
};

export default Dashboard;
