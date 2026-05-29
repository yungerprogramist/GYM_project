import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Card,
  CardContent,
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

//  что возвращает бэкенд 
interface BackendProgram {
  id: number;
  title: string;                 
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced'; 
  duration_weeks?: number;
  image_url?: string;           
  created_at?: string;
  updated_at?: string;
}


export type Difficulty = 'Начинающий' | 'Средний' | 'Продвинутый';

export interface Program {
  id: string;
  name: string;
  difficulty: Difficulty;
  image: string;
}

//бэкенд на фронтенд
const mapBackendToProgram = (backend: BackendProgram): Program => ({
  id: String(backend.id),        
  name: backend.title,           
  difficulty: mapDifficulty(backend.difficulty),
  image: backend.image_url || '', // fallback, если картинки нет
});

const mapDifficulty = (diff: BackendProgram['difficulty']): Difficulty => {
  const map: Record<BackendProgram['difficulty'], Difficulty> = {
    'beginner': 'Начинающий',
    'intermediate': 'Средний',
    'advanced': 'Продвинутый',
  };
  return map[diff] || 'Начинающий';
};

// API запрос 
const fetchPrograms = async (): Promise<Program[]> => {
  try {
    const response = await fetch('/api/programs/', { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    let programsList: BackendProgram[] = [];
    
    if (data && data.results && Array.isArray(data.results)) {
      programsList = data.results;
    } else if (Array.isArray(data)) {
      programsList = data;
    } else {
      console.error('Неожиданный формат ответа:', data);
      return [];
    }
    
    return programsList.map(mapBackendToProgram);
    
  } catch (err) {
    console.error('Ошибка загрузки программ:', err);
    throw err; // кидаем ошибку выше для обработки в компоненте
  }
};

// резерв
const mockPrograms: Program[] = [
  { id: '1', name: '10-недельная программа на массу', difficulty: 'Продвинутый', image: img10Nedel },
  { id: '2', name: 'Программа с гантелями для дома и зала', difficulty: 'Начинающий', image: imgGanteli },
  { id: '3', name: '4-дневный сплит "Сила, Мышцы и Огонь"', difficulty: 'Средний', image: img4Dnya },
  { id: '4', name: 'Программа набора массы для эктоморфа', difficulty: 'Начинающий', image: img10Nedel },
  { id: '5', name: '5-дневная программа Дуга Лоренса', difficulty: 'Средний', image: imgLorenc },
  { id: '6', name: '12-недельная программа тренировок для новичков', difficulty: 'Начинающий', image: img12Nedel },
  { id: '7', name: 'Программа Фулбоди на силу', difficulty: 'Продвинутый', image: imgFullbody },
];


const difficultyColors = {
  'Начинающий': { bg: '#e8f5e9', color: '#2e7d32' },
  'Средний': { bg: '#fff3e0', color: '#ed6c02' },
  'Продвинутый': { bg: '#fce4ec', color: '#c62828' },
} as const;

// Компонент карточки 
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
          image={program.image || imgGanteli} // Fallback на заглушку
          alt={program.name}
          sx={{ objectFit: 'cover' }}
        />
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

// главный компонент
const TrainingPrograms = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //загрузка данных
  useEffect(() => {
    const loadPrograms = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchPrograms();
        
        if (data.length > 0) {
          setPrograms(data);
        } else {
          // бэкенд вернул пустой массив — показываем резерв
          setPrograms(mockPrograms);
        }
      } catch (err) {
        console.error('Failed to load programs:', err);
        //  ошибка сети — показываем резерв
        setPrograms(mockPrograms);
        setError('Не удалось подключиться к бэкенду. Показаны демо-данные.');
      } finally {
        setLoading(false);
      }
    };
    
    loadPrograms();
  }, []);

  // детали программы
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
      <Box sx={{ 
        bgcolor: '#f5f5f5',
        py: 4,
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <IconButton 
            onClick={() => setSelectedId(null)} 
            sx={{ border: '2px solid rgba(128,128,128,0.5)', borderRadius: '12px' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{program.name}</Typography>
          <Chip 
            label={program.difficulty} 
            sx={{ 
              bgcolor: difficultyColors[program.difficulty].bg,
              color: difficultyColors[program.difficulty].color
            }} 
          />
        </Box>
        
        <CardMedia 
          component="img" 
          height="400" 
          image={program.image || imgGanteli} 
          alt={program.name} 
          sx={{ borderRadius: '16px', mb: 3, objectFit: 'cover' }} 
        />
        
        <Box sx={{ p: 3, bgcolor: 'white', borderRadius: '16px' }}>
          <Typography variant="h6" gutterBottom>О программе</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Подробное описание программы "{program.name}". 
            Эта программа рассчитана на {program.difficulty.toLowerCase()} уровень подготовки.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Включает в себя комплекс упражнений для достижения максимальных результатов.
            Рекомендуемая частота тренировок: 3-4 раза в неделю.
          </Typography>
        </Box>
      </Box>
    );
  }

  // загрузочник
  if (loading) {
    return (
      <Box sx={{ 
        bgcolor: '#f5f5f5',
        py: 8,
        px: { xs: 2, sm: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Загрузка программ...
        </Typography>
      </Box>
    );
  }

  // основной список программ
  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5',
      py: 4,
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      {/*  предупреждение, если работаем на резерве (мок) */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Программы тренировок
      </Typography>
      
      {programs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            Программ пока нет. Добавьте их через админ-панель.
          </Typography>
        </Box>
      ) : (
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
          {programs.map((program) => (
            <ProgramCard 
              key={program.id} 
              program={program} 
              onClick={setSelectedId} 
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TrainingPrograms;