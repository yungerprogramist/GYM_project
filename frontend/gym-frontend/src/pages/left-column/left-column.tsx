import './left-column.scss';

interface LeftColumnProps {
  children?: React.ReactNode;
}

const LeftColumn = ({ children }: LeftColumnProps) => {
  return (
    <aside className="left-column">
      {children}
    </aside>
  );
};

export default LeftColumn;

