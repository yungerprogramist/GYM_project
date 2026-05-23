import { useState, useEffect, ReactNode } from 'react';
import './App.scss';
import CenterDisplay from '../pages/center-display';
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import TrainingPrograms from '../pages/training-programs/training-programs';
import WeightTracker from '../pages/weight-tracker/weight-tracker';
import LoginPage from '../pages/login-page/login-page';

// Компоненты-заглушки
const ExercisesPage = () => <h2>Упражнения</h2>;
const NotebookPage = () => <h2>Блокнот</h2>;
const SettingsPage = () => <h2>Настройки</h2>;
const MyAccountPage = () => <h2>Мой аккаунт</h2>;
const ActionManagerPage = () => <h2>Управление действиями</h2>;

// PrivateRoute как обычная функция
function PrivateRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = localStorage.getItem('access_token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  const LoginPageWrapper = () => (
    <LoginPage onLoginSuccess={handleLoginSuccess} />
  );

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/training-programs" replace /> : 
              <CenterDisplay 
                centerFrame={LoginPageWrapper}
                centerFrameProps={{}}
              />
            } 
          />

          <Route 
            path="/weight-tracker" 
            element={
              <PrivateRoute>
                <CenterDisplay 
                  centerFrame={WeightTracker} 
                  centerFrameProps={{ onLogout: handleLogout }} 
                  showCalendar="true" 
                />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/training-programs" 
            element={
              <PrivateRoute>
                <CenterDisplay 
                  centerFrame={TrainingPrograms} 
                  centerFrameProps={{ onLogout: handleLogout }} 
                />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/exercises" 
            element={
              <PrivateRoute>
                <CenterDisplay 
                  centerFrame={ExercisesPage} 
                  centerFrameProps={{ onLogout: handleLogout }} 
                />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/notebook" 
            element={
              <PrivateRoute>
                <CenterDisplay 
                  centerFrame={NotebookPage} 
                  centerFrameProps={{ onLogout: handleLogout }} 
                />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <CenterDisplay 
                  centerFrame={SettingsPage} 
                  centerFrameProps={{ onLogout: handleLogout }} 
                />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/my-account" 
            element={
              <PrivateRoute>
                <CenterDisplay 
                  centerFrame={MyAccountPage} 
                  centerFrameProps={{ onLogout: handleLogout }} 
                />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/action-manager" 
            element={
              <PrivateRoute>
                <CenterDisplay 
                  centerFrame={ActionManagerPage} 
                  centerFrameProps={{ onLogout: handleLogout }} 
                />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/training-programs" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;