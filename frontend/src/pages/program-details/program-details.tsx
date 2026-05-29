import React, { useMemo, useState } from 'react';
import './program-details.scss';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import {
  Box,
  IconButton,
  List,
  ListItem,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

export interface Exercise {
  id: string;
  name: string;
  rightLabel?: string;
  color?: 'green' | 'purple' | 'blue' | 'pink';
  iconSrc?: string;
}

export interface ProgramDay {
  dayNumber: number;
  exercises: Exercise[];
  title?: string;
  dots?: Array<'green' | 'purple' | 'blue' | 'pink' | 'red'>;
}

export interface ProgramDetailsPageProps {
  programTitle: string;
  days: ProgramDay[];
  onBack?: () => void;
}

const SNACKBAR_TEXT = 'Упражнение добавлено';

type ViewMode = 'days' | 'day';

const DOT_COLORS: Record<NonNullable<ProgramDay['dots']>[number], string> = {
  green: '#BFE8A8',
  purple: '#CBB6FF',
  blue: '#7FB7FF',
  pink: '#F3A7A7',
  red: '#F26D6D',
};

const EXERCISE_BG: Record<NonNullable<Exercise['color']>, string> = {
  green: '#DFF2D5',
  purple: '#DCD2F4',
  blue: '#CFE3F4',
  pink: '#F2D2D2',
};

const ExerciseRow: React.FC<{
  exercise: Exercise;
  isAdded: boolean;
  onToggle: () => void;
}> = ({ exercise, isAdded, onToggle }) => {
  const bg = exercise.color ? EXERCISE_BG[exercise.color] : '#EDEDED';

  return (
    <ListItem className="program-details__exercise-item" disablePadding>
      <Box className="program-details__exercise-card" sx={{ background: bg }}>
        <Box className="program-details__exercise-left">
          {exercise.iconSrc ? (
            <img className="program-details__exercise-icon" src={exercise.iconSrc} alt="" />
          ) : (
            <Box className="program-details__exercise-icon program-details__exercise-icon--empty" />
          )}
          <Typography className="program-details__exercise-name">{exercise.name}</Typography>
        </Box>

        <Box className="program-details__exercise-right">
          <IconButton
            className="program-details__exercise-check"
            aria-label="Добавить упражнение"
            onClick={onToggle}
            size="small"
          >
            {isAdded ? <CheckCircleIcon fontSize="small" /> : <CheckCircleOutlinedIcon fontSize="small" />}
          </IconButton>

          {exercise.rightLabel ? (
            <Box className="program-details__exercise-pill">
              <Typography className="program-details__exercise-pill-text">
                {exercise.rightLabel}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Box>
    </ListItem>
  );
};

const DayCardLabel: React.FC<{ day: ProgramDay }> = ({ day }) => {
  const title = day.title ? `День ${day.dayNumber} - ${day.title}` : `День ${day.dayNumber}`;
  const dots = day.dots ?? [];

  return (
    <Box className="program-details__day-card">
      <Typography className="program-details__day-title">{title}</Typography>
      <Box className="program-details__day-dots" aria-hidden>
        {dots.map((dot, idx) => (
          <Box
            // eslint-disable-next-line react/no-array-index-key
            key={`${dot}-${idx}`}
            className="program-details__day-dot"
            sx={{ background: DOT_COLORS[dot] }}
          />
        ))}
      </Box>
    </Box>
  );
};

const ProgramDetailsPage: React.FC<ProgramDetailsPageProps> = ({
  programTitle,
  days,
  onBack,
}) => {
  const [mode, setMode] = useState<ViewMode>('days');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [addedExerciseIds, setAddedExerciseIds] = useState<Set<string>>(() => new Set());

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarKey, setSnackbarKey] = useState<number>(0);

  const currentDay: ProgramDay | undefined = useMemo(
    () => days[selectedDayIndex],
    [days, selectedDayIndex],
  );

  const handleBack = (): void => {
    if (mode === 'day') {
      setMode('days');
      return;
    }

    if (onBack) {
      onBack();
      return;
    }

    // Без изменения существующих файлов мы не можем гарантировать роутинг.
    // Поэтому по умолчанию делаем поведение как у кнопки "назад" в браузере.
    window.history.back();
  };

  const handleToggleExercise = (exerciseId: string): void => {
    setAddedExerciseIds((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });

    // Snackbar на каждое нажатие по галочке
    setSnackbarKey((k) => k + 1);
    setSnackbarOpen(true);
  };

  return (
    <Box className="program-details">
      <Box className="program-details__header">
        <IconButton
          aria-label="Назад"
          className="program-details__back"
          onClick={handleBack}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography className="program-details__title" variant="h4">
          {mode === 'days'
            ? programTitle
            : `День ${currentDay?.dayNumber ?? ''}${currentDay?.title ? ` - ${currentDay.title}` : ''}`}
        </Typography>

        {mode === 'day' ? (
          <IconButton className="program-details__top-check" aria-label="Добавлено">
            <CheckBoxOutlinedIcon />
          </IconButton>
        ) : null}
      </Box>

      <Box className="program-details__content">
        {mode === 'days' ? (
          <Tabs
            orientation="vertical"
            value={selectedDayIndex}
            onChange={(_, nextValue: number) => {
              setSelectedDayIndex(nextValue);
              setMode('day');
            }}
            className="program-details__days-tabs"
           sx={{ '& .MuiTabs-indicator': { display: 'none' } }}
          >
            {days.map((day, idx) => (
              <Tab
                key={day.dayNumber}
                value={idx}
                disableRipple
                className="program-details__days-tab"
                label={<DayCardLabel day={day} />}
              />
            ))}
          </Tabs>
        ) : (
          <List className="program-details__exercises-list">
            {(currentDay?.exercises ?? []).map((exercise) => {
              const isAdded = addedExerciseIds.has(exercise.id);
              return (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  isAdded={isAdded}
                  onToggle={() => handleToggleExercise(exercise.id)}
                />
              );
            })}
          </List>
        )}
      </Box>

      <Snackbar
        key={snackbarKey}
        open={snackbarOpen}
        message={SNACKBAR_TEXT}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default ProgramDetailsPage;
