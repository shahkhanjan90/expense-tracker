import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';
import Configuration from './pages/Configuration';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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

  return (
    <div style={{ padding: '20px' }}>
      <h1>Expense Tracker</h1>
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: activeTab === tab.key ? '#4f46e5' : '#f0f0f0',
              color: activeTab === tab.key ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
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