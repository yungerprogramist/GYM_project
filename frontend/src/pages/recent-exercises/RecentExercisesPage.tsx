import React, { useState } from 'react';
import './recent-exercises.scss';

// Импорт иконок для упражнений
import ChestIcon1 from '../exercises-by-section/assets/chest_1.png';
import ChestIcon2 from '../exercises-by-section/assets/chest_2.png';
import ChestIcon3 from '../exercises-by-section/assets/chest_3.png';
import ChestIcon4 from '../exercises-by-section/assets/chest_4.png';
import ChestIcon5 from '../exercises-by-section/assets/chest_5.png';

interface RecentExercise {
  id: number;
  name: string;
  icon: string;
}

const mockRecentExercises: RecentExercise[] = [
  { id: 1, name: "Жим лежа - штанга", icon: ChestIcon1 },
  { id: 2, name: "Жим лежа - гантели", icon: ChestIcon2 },
  { id: 3, name: "Жим лежа - нижний блок", icon: ChestIcon3 },
  { id: 4, name: "Жим лежа - тренажер Смита", icon: ChestIcon4 },
  { id: 5, name: "Жим лежа (наклон) - штанга", icon: ChestIcon5 },
];

const RecentExercisesPage: React.FC = () => {
  const [recentExercises] = useState<RecentExercise[]>(mockRecentExercises);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleExerciseClick = (exercise: RecentExercise) => {
    setSnackbarMessage(`✅ ${exercise.name} добавлено в Мой аккаунт`);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 2000);
  };

  const goToExercisesPage = () => {
    window.location.href = '/exercises';
  };

  return (
    <div className="recent-exercises-container">
      <div className="recent-exercises-header">
        <button onClick={goToExercisesPage} className="back-button">
          ←
        </button>
        <h1 className="recent-exercises-title">Недавние упражнения</h1>
      </div>

      <div className="recent-exercises-list">
        {recentExercises.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => handleExerciseClick(exercise)}
            className="recent-exercise-item"
          >
            <img src={exercise.icon} alt="icon" className="exercise-icon" />
            <span className="exercise-name">{exercise.name}</span>
          </div>
        ))}
      </div>

      {showSnackbar && (
        <div className="snackbar">
          {snackbarMessage}
        </div>
      )}
    </div>
  );
};

export default RecentExercisesPage;