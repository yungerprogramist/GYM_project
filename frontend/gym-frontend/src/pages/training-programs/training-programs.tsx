import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

//  ТИПЫ ДАННЫХ 
type Difficulty = 'Начинающий' | 'Средний' | 'Продвинутый';

interface Program {
  id: string;
  name: string;
  difficulty: Difficulty;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
}

interface ProgramDetails extends Program {
  description: string;
  duration: string;
  exercises: Exercise[];
}

//  ЦВЕТА ДЛЯ УРОВНЕЙ СЛОЖНОСТИ 
const difficultyColors: Record<Difficulty, { bg: string; color: string }> = {
  'Начинающий': { bg: '#e8f5e9', color: '#2e7d32' },
  'Средний': { bg: '#fff3e0', color: '#ed6c02' },
  'Продвинутый': { bg: '#fce4ec', color: '#c62828' },
};

//  НАЧАЛЬНЫЕ ДАННЫЕ 
const mockPrograms: Program[] = [
  { id: '1', name: '10-недельная программа на массу', difficulty: 'Продвинутый' },
  { id: '2', name: 'Программа с гантелями для дома и зала', difficulty: 'Начинающий' },
  { id: '3', name: '4-дневный сплит "Сила, Мышцы и Огонь"', difficulty: 'Средний' },
  { id: '4', name: 'Программа набора массы для эктоморфа', difficulty: 'Начинающий' },
  { id: '5', name: '5-дневная программа Дуга Лоренса', difficulty: 'Средний' },
  { id: '6', name: '12-недельная программа тренировок для новичков', difficulty: 'Начинающий' },
  { id: '7', name: 'Программа Фулбоди на силу', difficulty: 'Продвинутый' },
  { id: '8', name: '3-дневная программа для начинающих', difficulty: 'Начинающий' },
];

//  КОМПОНЕНТ КАРТОЧКИ ПРОГРАММЫ 
interface ProgramCardProps {
  program: Program;
  onProgramClick: (programId: string) => void;  
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, onProgramClick }) => {
  return (
    <Card
      onClick={() => onProgramClick(program.id)}  // ← передаем programId
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.3,
            minHeight: 52,
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          {program.name}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Chip
            label={program.difficulty}
            size="small"
            sx={{
              bgcolor: difficultyColors[program.difficulty].bg,
              color: difficultyColors[program.difficulty].color,
              fontWeight: 600,
              fontFamily: 'Manrope, sans-serif',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

//  КОМПОНЕНТ ДЕТАЛЕЙ ПРОГРАММЫ 
interface ProgramDetailsViewProps {
  programId: string;
  onBack: () => void;
}

const ProgramDetailsView: React.FC<ProgramDetailsViewProps> = ({ programId, onBack }) => {
  const [program, setProgram] = useState<ProgramDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const found = mockPrograms.find((p) => p.id === programId);
      if (found) {
        setProgram({
          ...found,
          description: `Подробное описание программы "${found.name}". Эта программа разработана профессиональными тренерами для достижения максимальных результатов.`,
          duration: '10 недель',
          exercises: [
            { id: '1', name: 'Приседания со штангой', sets: 4, reps: 12 },
            { id: '2', name: 'Жим штанги лежа', sets: 4, reps: 10 },
            { id: '3', name: 'Тяга штанги в наклоне', sets: 4, reps: 10 },
            { id: '4', name: 'Жим ногами', sets: 3, reps: 15 },
            { id: '5', name: 'Подтягивания', sets: 3, reps: 8 },
          ],
        });
      }
      setLoading(false);
    }, 500);
  }, [programId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!program) {
    return (
      <Typography sx={{ textAlign: 'center', p: 5, color: 'rgba(128, 128, 128, 1)' }}>
        Программа не найдена
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton
          onClick={onBack}
          sx={{
            width: 28,
            height: 28,
            border: '2px solid rgba(128, 128, 128, 1)',
            color: 'rgba(128, 128, 128, 1)',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(158, 158, 158, 0.1)',
            },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Typography
          variant="h5"
          sx={{
            color: 'rgba(128, 128, 128, 1)',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 'bold',
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
          }}
        />
      </Box>

      <Paper
        sx={{
          p: 3,
          mb: 2,
          borderRadius: '16px',
          bgcolor: 'rgba(217, 217, 217, 0.4)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 'bold',
            color: 'rgba(128, 128, 128, 1)',
          }}
        >
          О программе
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(128, 128, 128, 1)',
            fontFamily: 'Manrope, sans-serif',
            mb: 2,
          }}
        >
          {program.description}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(128, 128, 128, 1)',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 500,
          }}
        >
          Длительность: {program.duration}
        </Typography>
      </Paper>

      <Paper
        sx={{
          p: 3,
          borderRadius: '16px',
          bgcolor: 'rgba(217, 217, 217, 0.4)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 'bold',
            color: 'rgba(128, 128, 128, 1)',
          }}
        >
          Расписание тренировок
        </Typography>
        {program.exercises.map((exercise, index) => (
          <Box
            key={exercise.id}
            sx={{
              mb: 2,
              p: 2,
              bgcolor: 'white',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                fontFamily: 'Manrope, sans-serif',
                color: 'rgba(128, 128, 128, 1)',
              }}
            >
              {index + 1}. {exercise.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(128, 128, 128, 0.7)',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              {exercise.sets} × {exercise.reps}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

//  КОМПОНЕНТ БОКОВОЙ ПАНЕЛИ 
interface SidebarProps {
  activeItem: string;
  onItemClick: (itemId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick }) => {
  const menuItems = [
    { id: 'programs', label: 'Программы' },
    { id: 'measurements', label: 'Замеры' },
    { id: 'notes', label: 'Блокнот' },
    { id: 'settings', label: 'Настройки' },
    { id: 'account', label: 'Мой аккаунт' },
  ];

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        bgcolor: 'white',
        borderRight: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: 'Manrope, sans-serif' }}>
          Fitness App
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'Manrope, sans-serif' }}>
          Тренировочный портал
        </Typography>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        {menuItems.map((item) => (
          <Box
            key={item.id}
            onClick={() => onItemClick(item.id)}
            sx={{
              p: 1.5,
              mb: 1,
              borderRadius: '12px',
              cursor: 'pointer',
              bgcolor: activeItem === item.id ? 'rgba(128, 128, 128, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(128, 128, 128, 0.05)',
              },
            }}
          >
            <Typography
              sx={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: activeItem === item.id ? 600 : 400,
                color: activeItem === item.id ? '#000' : 'rgba(128, 128, 128, 1)',
              }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'Manrope, sans-serif' }}>
          Управление действиями
        </Typography>
      </Box>
    </Box>
  );
};

// ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ
const TrainingPrograms: React.FC = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('programs');
  const [view, setView] = useState<'list' | 'details'>('list');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPrograms(mockPrograms);
      setLoading(false);
    }, 500);
  }, []);

  const handleProgramClick = (programId: string) => {
    setSelectedProgramId(programId);
    setView('details');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedProgramId(null);
  };

  const handleMenuItemClick = (itemId: string) => {
    setActiveMenuItem(itemId);
    console.log('Переход на:', itemId);
  };

  const renderContent = () => {
    if (view === 'details' && selectedProgramId) {
      return <ProgramDetailsView programId={selectedProgramId} onBack={handleBackToList} />;
    }

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            color: 'rgba(128, 128, 128, 1)',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 'bold',
          }}
        >
          Программы тренировок
        </Typography>
        <Grid container spacing={3}>
          {programs.map((program) => (
            <Grid item xs={12} sm={6} md={4} key={program.id}>
              <ProgramCard program={program} onProgramClick={handleProgramClick} />
            </Grid>
          ))}
        </Grid>
      </>
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Sidebar activeItem={activeMenuItem} onItemClick={handleMenuItemClick} />
      <Box sx={{ flex: 1, p: 3 }}>
        <Paper
          sx={{
            p: 3,
            maxWidth: 1200,
            mx: 'auto',
            bgcolor: 'transparent',
            boxShadow: 'none',
          }}
        >
          {renderContent()}
        </Paper>
      </Box>
    </Box>
  );
};

export default TrainingPrograms;