import './App.scss';
import CenterDisplay from '../pages/center-display';
import { BrowserRouter, Routes, Route } from "react-router";
import TrainingPrograms from '../pages/training-programs/training-programs';
import WeightTracker from '../pages/weight-tracker/weight-tracker';
import LoginPage from '../pages/login-page/login-page';

function App() {
  return (
    <BrowserRouter>
    <div className="app">
    <Routes>
        <Route path="/login" element={
		<CenterDisplay centerFrame={LoginPage} centerFrameProps={{}} />
	} />
        <Route path="/weight-tracker" element={
		<CenterDisplay centerFrame={WeightTracker} centerFrameProps={{}} showCalendar="true" />
	} />
        <Route path="/training-programs" element={
		<CenterDisplay centerFrame={TrainingPrograms} centerFrameProps={{}} />
	} />
    </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;
