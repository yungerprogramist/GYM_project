import { useState, useEffect, ReactNode } from 'react';
import './App.scss';
import CenterDisplay from '../pages/center-display';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router";
import TrainingPrograms from '../pages/training-programs/training-programs';
import WeightTracker from '../pages/weight-tracker/weight-tracker';
import LoginPage from '../pages/login-page/login-page';

// Компоненты-заглушки
const ExercisesPage = () => <h2>Упражнения</h2>;
const NotebookPage = () => <h2>Блокнот</h2>;
const SettingsPage = () => <h2>Настройки</h2>;
const MyAccountPage = () => <h2>Мой аккаунт</h2>;
const ActionManagerPage = () => <h2>Управление действиями</h2>;

// Компонент для обработки logout с callback
const LogoutRoute = ({ onLogout }: { onLogout: () => void }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      const accessToken = localStorage.getItem('access_token');
      
      if (refreshToken && accessToken) {
        try {
          await fetch('/api/users/logout/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
      
      // Очищаем localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Обновляем состояние в App
      onLogout();
      
      // Редиректим на логин
      navigate('/login', { replace: true });
    };

    handleLogout();
  }, [navigate, onLogout]);

  return <div>Выход из аккаунта...</div>;
};

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
              <Navigate to="/my-account" replace /> : 
              <CenterDisplay 
                centerFrame={LoginPageWrapper}
                centerFrameProps={{}}
              />
            } 
          />

          {/* Отдельный роут для logout - передаём callback */}
          <Route 
            path="/logout" 
            element={<LogoutRoute onLogout={handleLogout} />} 
          />

          <Route 
            path="/weight-tracker" 
            element={
              <PrivateRoute>
                <CenterDisplay 
                  centerFrame={WeightTracker} 
                  centerFrameProps={{}} 
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
                  centerFrameProps={{}} 
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
                  centerFrameProps={{}} 
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
                  centerFrameProps={{}} 
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
                  centerFrameProps={{}} 
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
                  centerFrameProps={{}} 
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
                  centerFrameProps={{}} 
                />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/my-account" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;