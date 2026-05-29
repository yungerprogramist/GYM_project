import React, { useMemo, useState } from 'react';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import ExercisesBySectionPage from '../exercises-by-section/exercises-by-section';
import type { Exercise } from './my-account-exercises';

import chest1 from '../exercises-by-section/assets/chest_1.png';
import chest2 from '../exercises-by-section/assets/chest_2.png';
import chest3 from '../exercises-by-section/assets/chest_3.png';
import chest4 from '../exercises-by-section/assets/chest_4.png';
import chest5 from '../exercises-by-section/assets/chest_5.png';
import chest6 from '../exercises-by-section/assets/chest_6.png';
import chest7 from '../exercises-by-section/assets/chest_7.png';
import chest8 from '../exercises-by-section/assets/chest_8.png';
import chest9 from '../exercises-by-section/assets/chest_9.png';

type Section = 'chest' | 'back' | 'shoulders';

type ExerciseWithMeta = Exercise & { section: Section; iconSrc?: string };

const ALL_EXERCISES: ExerciseWithMeta[] = [
  // Frame 4 — Грудь
  { id: 'ch-1', name: 'Жим лежа - штанга', section: 'chest', iconSrc: chest1 },
  { id: 'ch-2', name: 'Жим лежа - гантели', section: 'chest', iconSrc: chest2 },
  { id: 'ch-3', name: 'Жим лежа - нижний блок', section: 'chest', iconSrc: chest3 },
  { id: 'ch-4', name: 'Жим лежа - тренажер Смита', section: 'chest', iconSrc: chest4 },
  { id: 'ch-5', name: 'Жим лежа(наклон) - штанга', section: 'chest', iconSrc: chest5 },
  { id: 'ch-6', name: 'Жим лежа (наклон) - гантели', section: 'chest', iconSrc: chest6 },
  { id: 'ch-7', name: 'Жим лежа (наклон) - нижний блок', section: 'chest', iconSrc: chest7 },
  { id: 'ch-8', name: 'Жим лежа (обратный наклон) - штанга', section: 'chest', iconSrc: chest8 },
  { id: 'ch-9', name: 'Жим от груди сидя - тренажер', section: 'chest', iconSrc: chest9 },

  { id: 'bk-1', name: 'Тяга в наклоне - штанга', section: 'back' },
  { id: 'bk-2', name: 'Вертикальная тяга - верхний блок', section: 'back' },
  { id: 'sh-1', name: 'Жим над головой - штанга', section: 'shoulders' },
  { id: 'sh-2', name: 'Разведения гантелей в стороны', section: 'shoulders' },
];

const SECTION_LABELS: Record<Section, string> = {
  chest: 'Грудь',
  back: 'Спина',
  shoulders: 'Плечи',
};

const ExercisesPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section | null>(null);

  const filtered = useMemo(() => {
    if (!activeSection) return [];
    return ALL_EXERCISES
      .filter((x) => x.section === activeSection)
      .map(({ id, name, iconSrc }) => ({ id, name, iconSrc }));
  }, [activeSection]);

  if (activeSection) {
    return (
      <ExercisesBySectionPage
        section={activeSection}
        exercises={filtered}
        onBack={() => setActiveSection(null)}
      />
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Упражнения
      </Typography>

      <List sx={{ bgcolor: 'white', borderRadius: '16px', overflow: 'hidden' }}>
        {(Object.keys(SECTION_LABELS) as Section[]).map((section) => (
          <ListItem
            key={section}
            divider
            onClick={() => setActiveSection(section)}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemText primary={SECTION_LABELS[section]} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ExercisesPage;
