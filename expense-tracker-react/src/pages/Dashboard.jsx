import SummaryCards from '../components/SummaryCards';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

const Dashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <SummaryCards />
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
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