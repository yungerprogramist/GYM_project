import React, { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardMedia,
  Chip,
} from '@mui/material';

import ProgramDetailsPage, {
  ProgramDay,
} from '../program-details/program-details';

import ex1 from '../program-details/assets/exercise_1.png';
import ex2 from '../program-details/assets/exercise_2.png';
import ex3 from '../program-details/assets/exercise_3.png';
import ex4 from '../program-details/assets/exercise_4.png';
import ex5 from '../program-details/assets/exercise_5.png';
import ex6 from '../program-details/assets/exercise_6.png';
import ex7 from '../program-details/assets/exercise_7.png';

// Импортируем фото из папки image
import img10Nedel from './image/10nedel-ectomorph.jpg';
import imgGanteli from './image/ganteli.jpg';
import img4Dnya from './image/4dnya.jpg';
import imgLorenc from './image/lorenc.jpg';
import img12Nedel from './image/12nedel.jpg';
import imgFullbody from './image/fullbody.png';

type Difficulty = 'Начинающий' | 'Средний' | 'Продвинутый';

interface Program {
  id: string;
  name: string;
  difficulty: Difficulty;
  image: string;
}

const difficultyColors = {
  'Начинающий': { bg: '#e8f5e9', color: '#2e7d32' },
  'Средний': { bg: '#fff3e0', color: '#ed6c02' },
  'Продвинутый': { bg: '#fce4ec', color: '#c62828' },
};

const mockPrograms: Program[] = [
  { id: '1', name: '10-недельная программа на массу', difficulty: 'Продвинутый', image: img10Nedel },
  { id: '2', name: 'Программа с гантелями для дома и зала', difficulty: 'Начинающий', image: imgGanteli },
  { id: '3', name: '4-дневный сплит "Сила, Мышцы и Огонь"', difficulty: 'Средний', image: img4Dnya },
  { id: '4', name: 'Программа набора массы для эктоморфа', difficulty: 'Начинающий', image: img10Nedel },
  { id: '5', name: '5-дневная программа Дуга Лоренса', difficulty: 'Средний', image: imgLorenc },
  { id: '6', name: '12-недельная программа тренировок для новичков', difficulty: 'Начинающий', image: img12Nedel },
  { id: '7', name: 'Программа Фулбоди на силу', difficulty: 'Продвинутый', image: imgFullbody },
];

// Данные для точного соответствия макетам Frame 71/72.
const FIGMA_PROGRAM_TITLE = 'Сила Гипертрофия Верх Низ';

const FIGMA_DAYS: ProgramDay[] = [
  {
    dayNumber: 1,
    title: 'Сила верха',
    dots: ['green', 'green', 'purple', 'purple', 'blue', 'pink', 'pink'],
    exercises: [
      { id: 'd1-e1', name: 'Жим лежа - штанга', rightLabel: '3 ПОДХ', color: 'green', iconSrc: ex1 },
      { id: 'd1-e2', name: 'Жим лежа (наклон) - гантели', rightLabel: '3 ПОДХ', color: 'green', iconSrc: ex2 },
      { id: 'd1-e3', name: 'Тяга в наклоне - штанга', rightLabel: '3 ПОДХ', color: 'purple', iconSrc: ex3 },
      { id: 'd1-e4', name: 'Вертикальная тяга - верхний блок', rightLabel: '3 ПОДХ', color: 'purple', iconSrc: ex4 },
      { id: 'd1-e5', name: 'Жим над головой - штанга', rightLabel: '2 ПОДХ', color: 'blue', iconSrc: ex5 },
      { id: 'd1-e6', name: 'Сгибание рук - штанга', rightLabel: '2 ПОДХ', color: 'pink', iconSrc: ex6 },
      { id: 'd1-e7', name: 'Разгибание рук лежа - штанга', rightLabel: '2 ПОДХ', color: 'pink', iconSrc: ex7 },
    ],
  },
  {
    dayNumber: 2,
    title: 'Сила низа',
    dots: ['green', 'green', 'green', 'green', 'green'],
    exercises: [],
  },
  {
    dayNumber: 4,
    title: 'Гипертрофия верха',
    dots: ['green', 'green', 'purple', 'purple', 'blue', 'pink', 'pink'],
    exercises: [],
  },
  {
    dayNumber: 5,
    title: 'Гипертрофия низа',
    dots: ['green', 'green', 'green', 'green', 'green'],
    exercises: [],
  },
];

const ProgramCard = ({ program, onClick }: { program: Program; onClick: (id: string) => void }) => {
  return (
    <Card 
      onClick={() => onClick(program.id)} 
      sx={{ 
        cursor: 'pointer', 
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        '&:hover': { 
          transform: 'translateY(-4px)', 
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)' 
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={program.image}
          alt={program.name}
          sx={{ objectFit: 'cover' }}
        />
        {/* Затемнение для лучшей читаемости текста */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
          }}
        />
        {/* Текст поверх фото */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            color: 'white',
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 600, 
              fontSize: '0.95rem', 
              lineHeight: 1.3,
              mb: 1,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            {program.name}
          </Typography>
          <Chip 
            label={program.difficulty} 
            size="small" 
            sx={{ 
              bgcolor: difficultyColors[program.difficulty].bg, 
              color: difficultyColors[program.difficulty].color, 
              fontWeight: 600,
              fontSize: '0.7rem'
            }} 
          />
        </Box>
      </Box>
    </Card>
  );
};

const TrainingPrograms = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    return (
      <ProgramDetailsPage
        programTitle={FIGMA_PROGRAM_TITLE}
        days={FIGMA_DAYS}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5',
      py: 4,
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Программы тренировок
      </Typography>
      
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)' 
          }, 
          gap: 3 
        }}
      >
        {mockPrograms.map((program) => (
          <ProgramCard key={program.id} program={program} onClick={setSelectedId} />
        ))}
      </Box>
    </Box>
  );
};

export default TrainingPrograms;
