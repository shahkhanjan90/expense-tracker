import CategoryManager from '../components/CategoryManager';
import TargetsManager from '../components/TargetsManager';

const Configuration = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Configuration</h1>
      <CategoryManager />
      <TargetsManager />
    </div>
  );
};

export default Configuration;