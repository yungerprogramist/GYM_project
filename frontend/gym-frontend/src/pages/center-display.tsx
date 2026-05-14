import React from 'react';
import './center-display.scss';
import Header from './header/header';
import LeftColumn from './left-column/left-column';
import RightColumn from './right-column/right-column';
import Programs from './pages/programs/programs'; 

const CenterDisplay = () => {
  return (
    <main className="center-display">
      <Header />
      <div className="center-display-content">
        <LeftColumn />
        <training-programs />  
        <RightColumn />
      </div>
    </main>
  );
};

export default CenterDisplay;