import CategoryManager from '../components/CategoryManager';
import TargetsManager from '../components/TargetsManager';

const Configuration = () => {
  return (
    <div>
      <h1>Configuration</h1>
      <div className="flex-row">
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