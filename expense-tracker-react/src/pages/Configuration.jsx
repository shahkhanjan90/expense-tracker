import CategoryManager from '../components/CategoryManager';
import TargetsManager from '../components/TargetsManager';

const Configuration = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Configuration</h1>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1 }}>
          <TargetsManager />
        </div>
        <div style={{ flex: 1 }}>
          <CategoryManager />
        </div>
      </div>
    </div>
  );
};

export default Configuration;