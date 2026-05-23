import './App.scss';
import CenterDisplay from '../pages/center-display';
import { BrowserRouter, Routes, Route } from "react-router";
import TrainingPrograms from '../pages/training-programs/training-programs';
import WeightTracker from '../pages/weight-tracker/weight-tracker';
import LoginPage from '../pages/login-page/login-page';

// Добавь эти компоненты-заглушки
const ExercisesPage = () => <h2>Упражнения</h2>;
const NotebookPage = () => <h2>Блокнот</h2>;
const SettingsPage = () => <h2>Настройки</h2>;
const MyAccountPage = () => <h2>Мой аккаунт</h2>;
const ActionManagerPage = () => <h2>Управление действиями</h2>;

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
          {/* Добавь эти маршруты */}
          <Route path="/exercises" element={
            <CenterDisplay centerFrame={ExercisesPage} centerFrameProps={{}} />
          } />
          <Route path="/notebook" element={
            <CenterDisplay centerFrame={NotebookPage} centerFrameProps={{}} />
          } />
          <Route path="/settings" element={
            <CenterDisplay centerFrame={SettingsPage} centerFrameProps={{}} />
          } />
          <Route path="/my-account" element={
            <CenterDisplay centerFrame={MyAccountPage} centerFrameProps={{}} />
          } />
          <Route path="/action-manager" element={
            <CenterDisplay centerFrame={ActionManagerPage} centerFrameProps={{}} />
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;