import CenterColumn from './center-column/center-column';
import './center-display.scss';
import Header from './header/header';
import LeftColumn from './left-column/left-column';
import RightColumn from './right-column/right-column';

const CenterDisplay = () => {
  return (
    <main className="center-display">
      <Header />
      <div className="center-display-content">
        <LeftColumn />
        <CenterColumn />
        <RightColumn />
      </div>
    </main>
  );
};

export default CenterDisplay;
