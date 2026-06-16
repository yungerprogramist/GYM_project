import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Card,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import img10Nedel from './image/10nedel-ectomorph.jpg';
import imgGanteli from './image/ganteli.jpg';
import img4Dnya from './image/4dnya.jpg';
import imgLorenc from './image/lorenc.jpg';
import img12Nedel from './image/12nedel.jpg';
import imgFullbody from './image/fullbody.png';

// API сервис
import { getPrograms, type Program } from '../../shared/api/endpoints/training-programs';

// Мок-данные 
const mockPrograms: Program[] = [
  { id: '1', name: '10-недельная программа на массу', difficulty: 'Продвинутый', image: img10Nedel, description: '', daysCount: 0 },
  { id: '2', name: 'Программа с гантелями для дома и зала', difficulty: 'Начинающий', image: imgGanteli, description: '', daysCount: 0 },
  { id: '3', name: '4-дневный сплит "Сила, Мышцы и Огонь"', difficulty: 'Средний', image: img4Dnya, description: '', daysCount: 0 },
  { id: '4', name: 'Программа набора массы для эктоморфа', difficulty: 'Начинающий', image: img10Nedel, description: '', daysCount: 0 },
  { id: '5', name: '5-дневная программа Дуга Лоренса', difficulty: 'Средний', image: imgLorenc, description: '', daysCount: 0 },
  { id: '6', name: '12-недельная программа тренировок для новичков', difficulty: 'Начинающий', image: img12Nedel, description: '', daysCount: 0 },
  { id: '7', name: 'Программа Фулбоди на силу', difficulty: 'Продвинутый', image: imgFullbody, description: '', daysCount: 0 },
];

const difficultyColors: Record<Program['difficulty'], { bg: string; color: string }> = {
  'Начинающий': { bg: '#e8f5e9', color: '#2e7d32' },
  'Средний': { bg: '#fff3e0', color: '#ed6c02' },
  'Продвинутый': { bg: '#fce4ec', color: '#c62828' },
};

// Карточка программы 
const ProgramCard = ({ program, onClick }: { program: Program; onClick: (id: string) => void }) => (
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
        image={program.image || imgGanteli}
        alt={program.name}
        sx={{ objectFit: 'cover' }}
      />
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
      }} />
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, color: 'white' }}>
        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3, mb: 1, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
          {program.name}
        </Typography>
        {/* Отображение дней */}
        {program.daysCount && (
          <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.9 }}>
            {program.daysCount} {program.daysCount === 1 ? 'день' : program.daysCount < 5 ? 'дня' : 'дней'}
          </Typography>
        )}
        <Chip label={program.difficulty} size="small" sx={{ 
          bgcolor: difficultyColors[program.difficulty].bg, 
          color: difficultyColors[program.difficulty].color, 
          fontWeight: 600, fontSize: '0.7rem' 
        }} />
      </Box>
    </Box>
  </Card>
);

// Главный компонент
const TrainingPrograms = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false); // Флаг для отличия ошибки сети от пустого списка

  useEffect(() => {
    const loadPrograms = async () => {
      setLoading(true);
      setError(null);
      setIsNetworkError(false);
      
      const response = await getPrograms();
      
      if (response.status === 200) {
        if (response.data.length > 0) {
          setPrograms(response.data);
        } else {
          // Показываем текст "Программ пока нет"
          setPrograms([]);
        }
      } else if (response.status === 401) {
        setError('Требуется авторизация');
        setIsNetworkError(true);
        setPrograms(mockPrograms); //Только при ошибке авторизации показываем мок
      } else {
        // Ошибка сервера/сети — мок-данные
        setIsNetworkError(true);
        setPrograms(mockPrograms);
        setError('Не удалось загрузить программы. Показаны демо-данные.');
      }
      
      setLoading(false);
    };
    
    loadPrograms();
  }, []);

  // Детали программы 
  if (selectedId) {
    const program = programs.find(p => p.id === selectedId);
    if (!program) {
      return (
        <Box sx={{ py: 4, px: 2 }}>
          <IconButton onClick={() => setSelectedId(null)} sx={{ mb: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography>Программа не найдена</Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ bgcolor: '#f5f5f5', py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <IconButton onClick={() => setSelectedId(null)} sx={{ border: '2px solid rgba(128,128,128,0.5)', borderRadius: '12px' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{program.name}</Typography>
          <Chip label={program.difficulty} sx={{ 
            bgcolor: difficultyColors[program.difficulty].bg,
            color: difficultyColors[program.difficulty].color
          }} />
        </Box>
        
        <CardMedia component="img" height="400" image={program.image || imgGanteli} alt={program.name} sx={{ borderRadius: '16px', mb: 3, objectFit: 'cover' }} />
        
        <Box sx={{ p: 3, bgcolor: 'white', borderRadius: '16px' }}>
          <Typography variant="h6" gutterBottom>О программе</Typography>
          
          {/* Отображение description*/}
          {program.description ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, whiteSpace: 'pre-line' }}>
              {program.description}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Описание отсутствует.
            </Typography>
          )}
          
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Эта программа рассчитана на {program.difficulty.toLowerCase()} уровень подготовки.
            {program.daysCount && ` Количество тренировочных дней: ${program.daysCount}.`}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Загрузка
  if (loading) {
    return (
      <Box sx={{ bgcolor: '#f5f5f5', py: 8, px: { xs: 2, sm: 3, md: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">Загрузка программ...</Typography>
      </Box>
    );
  }

  // Список
  return (
    <Box sx={{ bgcolor: '#f5f5f5', py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {error && <Alert severity={isNetworkError ? "warning" : "info"} sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Программы тренировок</Typography>
      
      {programs.length === 0 ? (
        // Текст когда действительно ошибка
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            {isNetworkError 
              ? 'Демо-данные временно недоступны.' 
              : 'Программ пока нет. Добавьте их через админ-панель.'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} onClick={setSelectedId} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TrainingPrograms;