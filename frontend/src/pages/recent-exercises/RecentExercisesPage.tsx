import React, { useState, useEffect } from 'react';
import useAuthStore from '../../features/auth';
import './recent-exercises.scss';

interface Exercise {
  id: number;
  muscle_group: number;
  muscle_group_name: string;
  name: string;
  description: string;
  image: string | null;
}

const ExercisesPage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const accessToken = useAuthStore((state) => state._accessToken);
  const isAuth = useAuthStore((state) => state.isAuth);

  useEffect(() => {
    if (isAuth && accessToken) {
      fetchExercises();
    } else if (!isAuth) {
      setLoading(false);
    }
  }, [isAuth, accessToken]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/exercises/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExercises(data);
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
      console.error('Error fetching exercises:', error);
      setSnackbarMessage('❌ Ошибка соединения с сервером');
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseClick = (exercise: Exercise) => {
    // Можно просто показывать информацию об упражнении
    setSnackbarMessage(`📋 ${exercise.name} — ${exercise.muscle_group_name}`);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 2000);
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
        <h1 className="recent-exercises-title">Упражнения</h1>
      </div>

      {exercises.length === 0 ? (
        <div className="empty-state">
          <p>Упражнения пока не добавлены</p>
          <p className="empty-state-hint">Обратитесь к администратору</p>
        </div>
      ) : (
        <div className="recent-exercises-list">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => handleExerciseClick(exercise)}
              className="recent-exercise-item"
            >
              <div className="exercise-name">{exercise.name}</div>
              <div className="exercise-meta">
                <span className="last-used">💪 {exercise.muscle_group_name}</span>
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

export default ExercisesPage;