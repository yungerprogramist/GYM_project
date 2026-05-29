import React, { useMemo, useState } from 'react';
import './exercises-by-section.scss';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Alert, Box, IconButton, List, ListItem, Snackbar, Typography } from '@mui/material';
import type { Exercise } from '../exercises/my-account-exercises';
import { addExerciseToMyAccount } from '../exercises/my-account-exercises';

export interface ExercisesBySectionProps {
  section: 'chest' | 'back' | 'shoulders';
  exercises: Exercise[]; // отфильтрованные по разделу
  onBack: () => void;
}

const SECTION_TITLES: Record<ExercisesBySectionProps['section'], string> = {
  chest: 'Грудь',
  back: 'Спина',
  shoulders: 'Плечи',
};

type ExerciseWithIcon = Exercise & { iconSrc?: string };

const ExercisesBySectionPage: React.FC<ExercisesBySectionProps> = ({ section, exercises, onBack }) => {
  const title = useMemo(() => SECTION_TITLES[section], [section]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarKey, setSnackbarKey] = useState(0);

  const handleAdd = (exercise: Exercise) => {
    addExerciseToMyAccount(exercise);
    // Snackbar на каждое добавление
    setSnackbarKey((k) => k + 1);
    setSnackbarOpen(true);
  };

  return (
    <Box className="exercises-section">
      <Box className="exercises-section__header">
        <IconButton
          className="exercises-section__back"
          onClick={onBack}
          aria-label="Назад"
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography className="exercises-section__title" variant="h4">
          {title}
        </Typography>
      </Box>

      <Box className="exercises-section__content">
        <List className="exercises-section__list" disablePadding>
          {(exercises as ExerciseWithIcon[]).map((exercise) => (
            <ListItem
              key={exercise.id}
              className="exercises-section__item"
              disablePadding
              onClick={() => handleAdd(exercise)}
            >
              <Box className="exercises-section__card">
                {exercise.iconSrc ? (
                  <img className="exercises-section__icon" src={exercise.iconSrc} alt="" />
                ) : (
                  <Box className="exercises-section__icon exercises-section__icon--empty" />
                )}
                <Typography className="exercises-section__name">{exercise.name}</Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      <Snackbar
        key={snackbarKey}
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSnackbarOpen(false)}>
          Упражнение добавлено
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExercisesBySectionPage;
