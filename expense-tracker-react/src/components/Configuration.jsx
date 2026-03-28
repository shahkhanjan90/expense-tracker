import { useContext, useRef, useState } from 'react';
import { AppContext } from '../context/AppContextBase';

const Configuration = () => {
  const { importData, exportData } = useContext(AppContext);
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const data = JSON.parse(loadEvent.target.result);
        importData(data);
        setMessage('Data imported successfully.');
      } catch {
        setMessage('Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <section className="prototype-panel prototype-panel--compact">
      <div className="section-heading section-heading--spread">
        <h2>Data Backup</h2>
        <span className="section-chip">Export or import your data</span>
      </div>

      {message && <div className="status-banner status-banner--info">{message}</div>}

      <div className="button-row">
        <button type="button" className="app-button app-button--primary" onClick={exportData}>
          Export Data
        </button>
        <button
          type="button"
          className="app-button app-button--secondary"
          onClick={() => inputRef.current?.click()}
        >
          Import Data
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        onChange={handleImport}
        className="sr-only"
      />
    </section>
  );
};

export default Configuration;
