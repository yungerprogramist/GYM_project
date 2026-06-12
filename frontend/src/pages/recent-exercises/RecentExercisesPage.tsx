import React, { useState, useEffect } from 'react';
import './recent-exercises.scss';

// Импорт иконок (оставляем, они локальные)
import ChestIcon1 from '../exercises-by-section/assets/chest_1.png';
import ChestIcon2 from '../exercises-by-section/assets/chest_2.png';
import ChestIcon3 from '../exercises-by-section/assets/chest_3.png';
import ChestIcon4 from '../exercises-by-section/assets/chest_4.png';
import ChestIcon5 from '../exercises-by-section/assets/chest_5.png';

interface RecentExercise {
  id: number;
  exercise_id: number;
  exercise_name: string;
  muscle_group_name?: string;
  last_used: string;
  use_count: number;
}

// Маппинг иконок по id упражнения (временный, пока бэкенд не отдаёт иконки)
const getIconById = (id: number) => {
  const icons = [ChestIcon1, ChestIcon2, ChestIcon3, ChestIcon4, ChestIcon5];
  return icons[(id - 1) % icons.length];
};

const RecentExercisesPage: React.FC = () => {
  const [recentExercises, setRecentExercises] = useState<RecentExercise[]>([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Получение токена из localStorage
  const getToken = () => localStorage.getItem('accessToken');

  // Загрузка списка недавних упражнений
  const fetchRecentExercises = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/v1/exercises/recent/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentExercises(data);
      } else if (response.status === 401) {
        setSnackbarMessage('❌ Сессия истекла, войдите заново');
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 3000);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setSnackbarMessage('❌ Ошибка соединения с сервером');
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Обновление/добавление упражнения
  const updateExerciseUsage = async (exerciseId: number, exerciseName: string) => {
    try {
      const token = getToken();
      const response = await fetch('/api/v1/exercises/recent/update/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exercise_id: exerciseId }),
      });

      if (response.ok) {
        // Обновляем список после успешного добавления
        await fetchRecentExercises();
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

  useEffect(() => {
    fetchRecentExercises();
  }, []);

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
        <button onClick={goToExercisesPage} className="back-button">
          ←
        </button>
        <h1 className="recent-exercises-title">Недавние упражнения</h1>
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
              <img 
                src={getIconById(exercise.exercise_id)} 
                alt="icon" 
                className="exercise-icon" 
              />
              <div className="exercise-info">
                <div className="exercise-name">{exercise.exercise_name}</div>
                <div className="exercise-meta">
                  <span className="use-count">🔁 {exercise.use_count} раз</span>
                  <span className="last-used">
                    📅 {new Date(exercise.last_used).toLocaleDateString('ru-RU')}
                  </span>
                </div>
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