import './center-column.scss';

const CenterColumn = () => {
interface CenterColumnProps<T = any> {
  component: React.ComponentType<T>;
  componentProps: T;
}

const CenterColumn = ({component: Component, componentProps}: CenterColumnProps) => {
  return (
    <main className="center-column">
      
      <Component {...componentProps} />
    </main>
  );
};

export default CenterColumn;
export default CenterColumn;
