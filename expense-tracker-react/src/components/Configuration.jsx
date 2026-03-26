import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Configuration = () => {
  const { importData, exportData } = useContext(AppContext);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          importData(data);
          alert('Data imported successfully');
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="card">
      <h2>Data Management</h2>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={exportData} style={{ padding: '8px 16px', marginRight: '10px' }}>
          Export Data
        </button>
        <label style={{ cursor: 'pointer', color: '#4f46e5' }}>
          Import Data
          <input type="file" accept="application/json" onChange={handleImport} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
};

export default Configuration;