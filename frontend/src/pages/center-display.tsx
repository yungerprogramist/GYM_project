import { ReactNode } from 'react';
import CenterColumn from './center-column/center-column';
import './center-display.scss';
import Header from './header/header';
import LeftColumn from './left-column/left-column';
import LeftPanel from '../pages/left-panel/left-panel';
import RightColumn from './right-column/right-column';

interface CenterDisplayProps {
  children: ReactNode;
  showCalendar?: boolean;
}

const CenterDisplay = ({ children }: CenterDisplayProps) => {
  return (
    <main className="center-display">
      <Header />
      <div className="center-display-content">
        <LeftColumn>
          <LeftPanel />
        </LeftColumn>
        <CenterColumn>
          {children}
        </CenterColumn>
        <RightColumn/>
      </div>
    </main>
  );
};

export default CenterDisplay;