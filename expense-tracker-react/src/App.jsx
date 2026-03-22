import { useState, useContext } from 'react';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';
import Configuration from './pages/Configuration';
import { AppContext } from './context/AppContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { activeMonth, setActiveMonth } = useContext(AppContext);

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
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Expense Tracker</h1>
        <div>
          <label style={{ marginRight: '10px' }}>Active Month:</label>
          <select
            value={activeMonth}
            onChange={(e) => {
              console.log('Setting activeMonth to:', e.target.value);
              setActiveMonth(e.target.value);
            }}
            className="input"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`button ${activeTab === tab.key ? 'active' : ''}`}
            style={{
              marginRight: '10px',
              backgroundColor: activeTab === tab.key ? 'var(--accent)' : 'var(--bg)',
              color: activeTab === tab.key ? 'white' : 'var(--text)',
              border: '1px solid var(--border)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {renderPage()}
    </div>
  );
}

export default App;