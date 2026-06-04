import { useEffect, ReactNode, ComponentType } from 'react';
import './App.scss';
import CenterDisplay from '../pages/center-display';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from "react-router-dom";
import TrainingPrograms from '../pages/training-programs/training-programs';
import WeightTracker from '../pages/weight-tracker/weight-tracker';
import LoginPage from '../pages/login-page/login-page';
import MyAccountPage from '../pages/my-account/my-account';
import useAuthStore from '../features/auth';
import RecentExercisesPage from '../pages/recent-exercises/RecentExercisesPage';

// Компоненты-заглушки
const ExercisesPage = () => <h2>Упражнения</h2>;
const NotebookPage = () => <h2>Блокнот</h2>;
const SettingsPage = () => <h2>Настройки</h2>;
const ActionManagerPage = () => <h2>Управление действиями</h2>;

// Компонент для обработки logout
const LogoutRoute = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const doLogout = async () => {
      await logout();
      navigate('/login', { replace: true });
    };
    doLogout();
  }, [logout, navigate]);

  return <div>Выход из аккаунта...</div>;
};

// Layout для защищённых страниц — проверка авторизации + Outlet
const ProtectedLayout = () => {
  const isAuthenticated = useAuthStore(state => state.isAuth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

function App() {
  const _initAuth = useAuthStore((state) => state._initAuth);
  const loading = useAuthStore((state) => state.isAppLoading);
  const isAuthenticated = useAuthStore(state => state.isAuth);

  useEffect(() => {
    _initAuth();
  }, [_initAuth]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <CenterDisplay>
          <Routes>
            {/* Публичные роуты */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                <Navigate to="/my-account" replace /> : 
                <LoginPage onLoginSuccess={() => {}} />
              } 
            />

            <Route path="/logout" element={<LogoutRoute />} />

            {/* Все защищённые роуты в одном месте */}
            <Route element={<ProtectedLayout />}>
              <Route path="/recent-exercises" element={<RecentExercisesPage />} />
              <Route path="/weight-tracker" element={<WeightTracker />} />
              <Route path="/training-programs" element={<TrainingPrograms />} />
              <Route path="/exercises" element={<ExercisesPage />} />
              <Route path="/notebook" element={<NotebookPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/my-account" element={<MyAccountPage />} />
              <Route path="/action-manager" element={<ActionManagerPage />} />
            </Route>

            {/* Корневой редирект */}
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/my-account" : "/login"} replace />} 
            />
            
            <Route path="*" element={
              // по идее сюра нужно добавить страницу: 404 стриница не найдена 
              <Navigate to="/" replace />
            } />
          </Routes>
        </CenterDisplay>
      </div>
    </BrowserRouter>
  );
}

export default App;