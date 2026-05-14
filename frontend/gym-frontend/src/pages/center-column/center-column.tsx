import './center-column.scss';

const CenterColumn = ({ component: Component, componentProps }: any) => {
  return (
    <main className="center-column">
      <Component {...componentProps} />
    </main>
  );
};

export default CenterColumn;