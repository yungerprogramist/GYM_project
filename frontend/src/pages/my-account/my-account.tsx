import React, { useMemo, useState } from 'react';
import './my-account.scss';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Divider, Grid, IconButton, Paper, Typography } from '@mui/material';
import { format, isSameDay, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useDateStore } from '../right-column/selectedDay';


export interface Exercise {
  id: string;
  name: string;
  section: 'chest' | 'back' | 'shoulders';
  fromProgram?: string; // например "День 1 – Сила верха"
  sets: number;
  reps: number;
  weight: number;
}

const SECTION_TITLES: Record<Exercise['section'], string> = {
  chest: 'Грудь',
  back: 'Спина',
  shoulders: 'Плечи',
};

// Акцентные цвета как в макете (Frame 3).
const SECTION_COLORS: Record<Exercise['section'], string> = {
  chest: '#BFE8A8',
  back: '#CBB6FF',
  shoulders: '#7FB7FF',
};

// 5 упражнений (в сумме 8 подходов) — удобно проверять статистику как на макете.
const mockExercises: Exercise[] = [
  {
    id: 'ch-1',
    name: 'Жим лежа - штанга',
    section: 'chest',
    fromProgram: 'День 1 – Сила верха',
    sets: 2,
    reps: 10,
    weight: 0,
  },
  {
    id: 'ch-2',
    name: 'Жим лежа - тренажер Смита',
    section: 'chest',
    sets: 2,
    reps: 12,
    weight: 0,
  },
  {
    id: 'bk-1',
    name: 'Тяга в наклоне - штанга',
    section: 'back',
    fromProgram: 'День 1 – Сила верха',
    sets: 2,
    reps: 10,
    weight: 0,
  },
  {
    id: 'sh-1',
    name: 'Жим над головой - штанга',
    section: 'shoulders',
    sets: 1,
    reps: 10,
    weight: 0,
  },
  {
    id: 'sh-2',
    name: 'Разведения гантелей в стороны',
    section: 'shoulders',
    sets: 1,
    reps: 12,
    weight: 0,
  },
];

export interface MyAccountPageProps {
  onAddExercise?: (exerciseId: string) => void;
  onDeleteExercise?: (exerciseId: string) => void;
}

function sumStats(exercises: Exercise[]) {
  const totalExercises = exercises.length;
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const totalKg = exercises.reduce((acc, ex) => acc + ex.sets * ex.reps * ex.weight, 0);
  return { totalExercises, totalSets, totalKg };
}

function groupBySection(exercises: Exercise[]) {
  return exercises.reduce<Record<Exercise['section'], Exercise[]>>(
    (acc, ex) => {
      acc[ex.section].push(ex);
      return acc;
    },
    { chest: [], back: [], shoulders: [] },
  );
}

function formatDayTitle(selectedDayIso?: string): string {
  if (!selectedDayIso) return 'Сегодня';
  const selected = parseISO(selectedDayIso);
  const today = new Date();
  if (isSameDay(selected, today)) return 'Сегодня';
  return format(selected, 'd MMMM', { locale: ru });
}

const MyAccountPage: React.FC<MyAccountPageProps> = ({ onAddExercise, onDeleteExercise }) => {
  const selectedDayIso = useDateStore((s) => s.selectedDateISO);
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);

  const handleAdd = (exerciseId: string) => {
    if (onAddExercise) {
      onAddExercise(exerciseId);
      return;
    }
    // По ТЗ пока просто alert.
    // eslint-disable-next-line no-alert
    alert(`Добавить ещё раз: ${exerciseId}`);
  };

  const handleDelete = (exerciseId: string) => {
    if (onDeleteExercise) {
      onDeleteExercise(exerciseId);
      return;
    }
    setExercises((prev) => prev.filter((x) => x.id !== exerciseId));
  };

  const stats = useMemo(() => sumStats(exercises), [exercises]);
  const grouped = useMemo(() => groupBySection(exercises), [exercises]);
  const dayTitle = useMemo(() => formatDayTitle(selectedDayIso), [selectedDayIso]);
  const programLabel = useMemo(() => {
    const uniq = Array.from(new Set(exercises.map((x) => x.fromProgram).filter(Boolean)));
    return uniq.length === 1 ? uniq[0] : undefined;
  }, [exercises]);

  return (
    <Box className="my-account">
      {/* Верхняя статистика */}
      <Paper className="my-account__stats" elevation={0}>
        <Typography className="my-account__stats-text">
          {stats.totalExercises} упр • {stats.totalSets} подх • {stats.totalKg} кг
        </Typography>

        <Grid container className="my-account__sections" spacing={3}>
          {(Object.keys(SECTION_TITLES) as Exercise['section'][]).map((section) => (
            <Grid key={section} size="auto">
              <Typography
                className="my-account__section-title"
                sx={{ color: SECTION_COLORS[section] }}
              >
                {SECTION_TITLES[section]}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {programLabel ? (
          <Typography className="my-account__program-label">{programLabel}</Typography>
        ) : null}
      </Paper>

      {/* Заголовок дня */}
      <Typography className="my-account__day-title">{dayTitle}</Typography>

      {/* Разделы с упражнениями */}
      <Box className="my-account__list">
        {(Object.keys(SECTION_TITLES) as Exercise['section'][]).map((section) => {
          const items = grouped[section];
          if (items.length === 0) return null;

          return (
            <Box key={section} className="my-account__group">
              <Typography className="my-account__group-title">{SECTION_TITLES[section]}</Typography>
              <Divider className="my-account__divider" />

              <Box className="my-account__items">
                {items.map((ex) => (
                  <Paper key={ex.id} className="my-account__item" elevation={0}>
                    <Box className="my-account__item-main">
                      <Typography className="my-account__item-name">{ex.name}</Typography>
                      {ex.fromProgram ? (
                        <Typography className="my-account__item-subtitle">{ex.fromProgram}</Typography>
                      ) : null}
                    </Box>

                    <Box className="my-account__item-actions">
                      <IconButton
                        className="my-account__action-btn"
                        aria-label="Добавить ещё раз"
                        onClick={() => handleAdd(ex.id)}
                        size="small"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        className="my-account__action-btn"
                        aria-label="Удалить"
                        onClick={() => handleDelete(ex.id)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default MyAccountPage;
