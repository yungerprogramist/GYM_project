import './center-column.scss';
import { ReactNode } from 'react';

interface CenterColumnProps {
  children: ReactNode;
}


const CenterColumn = ({ children }: CenterColumnProps) => {
  return (
    <main className="center-column">
      {children}
    </main>
  );
};

export default CenterColumn;