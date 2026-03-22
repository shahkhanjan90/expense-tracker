import SummaryCards from '../components/SummaryCards';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

const Dashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <SummaryCards />
      <ExpenseForm />
      <ExpenseList />
    </div>
  );
};

export default Dashboard;