import CenterColumn from './center-column/center-column';
import './center-display.scss';
import Header from './header/header';
import LeftColumn from './left-column/left-column';
import LeftPanel from '../pages/left-panel/left-panel';
import RightColumn from './right-column/right-column';

const CenterDisplay = ({ centerFrame, centerFrameProps, showCalendar }: any) => {
  return (
    <main className="center-display">
      <Header />
      <div className="center-display-content">
        <LeftColumn>
          <LeftPanel />
        </LeftColumn>
        <CenterColumn component={centerFrame} componentProps={centerFrameProps} />
        <RightColumn showCalendar={showCalendar} />
      </div>
    </main>
  );
};

export default CenterDisplay;