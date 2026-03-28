import { useContext, useState } from 'react';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';
import Configuration from './pages/Configuration';
import SummaryCards from './components/SummaryCards';
import { AppContext } from './context/AppContextBase';
import { formatMonthLabel } from './utils/utils';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { activeMonth, setActiveMonth, theme, toggleTheme } = useContext(AppContext);

  const tabs = [
    { label: 'Data Entry', key: 'dashboard' },
    { label: 'Charts', key: 'charts' },
    { label: 'Configuration', key: 'configuration' },
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

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const seenMonths = new Set();

    for (let i = 0; i < 12; i += 1) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const value = `${year}-${month}`;
      seenMonths.add(value);
      options.push({ value, label: formatMonthLabel(value) });
    }

    if (activeMonth && !seenMonths.has(activeMonth)) {
      options.unshift({ value: activeMonth, label: formatMonthLabel(activeMonth) });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className={`app-shell ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="app-shell__backdrop" />
      <main className="app-shell__container">
        <section className="hero-card">
          <div className="hero-card__top">
            <div className="hero-card__copy">
              <h1>Expense Tracker</h1>
              <p>Monthly planning, tracking, and utilization in one place.</p>
            </div>
            <div className="hero-card__controls">
              <div className="hero-card__label">Active Month</div>
              <div className="hero-card__control-row">
                <button
                  type="button"
                  className="theme-toggle"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <span className="theme-toggle__glyph" />
                </button>
                <label className="month-select">
                  <span className="sr-only">Choose active month</span>
                  <select value={activeMonth} onChange={(e) => setActiveMonth(e.target.value)}>
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>
          <SummaryCards />
        </section>

        <nav className="tab-bar" aria-label="Primary navigation">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`tab-bar__button ${activeTab === tab.key ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="page-section">{renderPage()}</section>
      </main>
    </div>
  );
}

export default App;
