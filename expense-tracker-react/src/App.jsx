import { useState, useContext } from 'react';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';
import Configuration from './pages/Configuration';
import { AppContext } from './context/AppContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { activeMonth, setActiveMonth, theme, toggleTheme } = useContext(AppContext);

  const tabs = [
    { label: 'Data Entry', key: 'dashboard' },
    { label: 'Charts', key: 'charts' },
    { label: 'Configuration', key: 'configuration' }
  ];

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'charts':
        return <Charts />;
      case 'configuration':
        return <Configuration />;
      default:
        return <Dashboard />;
    }
  };

  // Generate month options: current and last 11 months
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const value = `${year}-${month}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className={theme === 'dark' ? 'dark' : ''} style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Expense Tracker</h1>
        <div>
          <label style={{ marginRight: '10px' }}>Active Month:</label>
          <select value={activeMonth} onChange={(e) => setActiveMonth(e.target.value)}>
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button onClick={toggleTheme} style={{ marginLeft: '10px' }}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>
      <div>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              marginRight: '10px',
              padding: '10px 20px',
              backgroundColor: activeTab === tab.key ? '#4f46e5' : '#ddd',
              color: activeTab === tab.key ? '#fff' : '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: '20px' }}>
        {renderPage()}
      </div>
    </div>
  );
}

export default App;