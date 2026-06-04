import React, { useState, useEffect } from 'react';
import useAuthStore from '../../features/auth';
import './recent-exercises.scss';

interface RecentExercise {
  id: number;
  exercise_id: number;
  exercise_name: string;
  last_used: string;
  use_count: number;
}

const RecentExercisesPage: React.FC = () => {
  const [recentExercises, setRecentExercises] = useState<RecentExercise[]>([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const accessToken = useAuthStore((state) => state._accessToken);
  const isAuth = useAuthStore((state) => state.isAuth);

  useEffect(() => {
    if (isAuth && accessToken) {
      fetchRecentExercises();
    } else if (!isAuth) {
      setLoading(false);
    }
  }, [isAuth, accessToken]);

  const fetchRecentExercises = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/exercises/recent/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecentExercises(data);
      } else if (response.status === 401) {
        setSnackbarMessage('❌ Сессия истекла, войдите заново');
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 3000);
      } else {
        setSnackbarMessage('❌ Ошибка загрузки упражнений');
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 3000);
      }
    } catch (error) {
      console.error('Error fetching recent exercises:', error);
      setSnackbarMessage('❌ Ошибка соединения с сервером');
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updateExerciseUsage = async (exerciseId: number, exerciseName: string) => {
    try {
      const response = await fetch('/api/exercises/recent/update/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exercise_id: exerciseId }),
      });

      if (response.ok) {
        const updatedExercise = await response.json();
        
        setRecentExercises(prev => {
          const existingIndex = prev.findIndex(e => e.exercise_id === exerciseId);
          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = updatedExercise;
            return updated.sort((a, b) => new Date(b.last_used).getTime() - new Date(a.last_used).getTime());
          }
          return [updatedExercise, ...prev];
        });
        
        setSnackbarMessage(`✅ ${exerciseName} добавлено в недавние`);
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 3000);
      } else {
        setSnackbarMessage(`❌ Ошибка при добавлении`);
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 2000);
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      setSnackbarMessage(`❌ Ошибка соединения`);
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    }
  };

  const handleExerciseClick = (exercise: RecentExercise) => {
    updateExerciseUsage(exercise.exercise_id, exercise.exercise_name);
  };

  const goToExercisesPage = () => {
    window.location.href = '/exercises';
  };

  if (loading) {
    return (
      <div className="recent-exercises-container">
        <div className="loading-spinner">Загрузка упражнений...</div>
      </div>
    );
  }

  return (
    <div className="recent-exercises-container">
      <div className="recent-exercises-header">
        <h1 className="recent-exercises-title">Недавние упражнения</h1>
        <button onClick={goToExercisesPage} className="check-button" title="Все упражнения">
          ✓
        </button>
      </div>

      {recentExercises.length === 0 ? (
        <div className="empty-state">
          <p>У вас пока нет недавних упражнений</p>
          <p className="empty-state-hint">Начните добавлять упражнения из раздела "Упражнения"</p>
        </div>
      ) : (
        <div className="recent-exercises-list">
          {recentExercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => handleExerciseClick(exercise)}
              className="recent-exercise-item"
            >
              <div className="exercise-name">{exercise.exercise_name}</div>
              <div className="exercise-meta">
                <span className="use-count">🔁 {exercise.use_count} раз</span>
                <span className="last-used">
                  📅 {new Date(exercise.last_used).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSnackbar && (
        <div className="snackbar">
          {snackbarMessage}
        </div>
      )}
    </div>
  );
};

export default RecentExercisesPage;