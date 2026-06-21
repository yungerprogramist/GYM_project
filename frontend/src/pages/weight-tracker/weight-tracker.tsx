import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDateStore } from '../right-column/selectedDay';
import { authClient } from '../../shared/api/authClient';
import './weight-tracker.scss';

// Тип данных записи замера
interface WeightRecord {
  id: number;
  date: string;
  weight: number;
  comment?: string;
  user?: number | null;
  created_at?: string;
}

// Тип данных, которые приходят с бэкенда для графика
interface ChartDataPoint {
  date: string;
  weight: number;
}

// Тип для отформатированных данных графика
interface FormattedChartDataPoint extends ChartDataPoint {
  displayDate: string;
  fullDate: string;
}

const WeightTracker: React.FC = () => {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [chartData, setChartData] = useState<FormattedChartDataPoint[]>([]);
  const [weightInput, setWeightInput] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('year');
  const selectedDate = useDateStore(state => state.selectedDateISO);
  const setShowCalendar = useDateStore((state) => state.setShowCalendar); // для включения календаря

  const customGet = async (url: string) => {
    return await authClient.get<any>(url);
  }

  const customPost = async (url: string, data: any) => {
    return await authClient.post<any>(url, data);
  }

  const customPatch = async (url: string, data: any) => {
    return await authClient.patch<any>(url, data);
  }

  const customDelete = async (url: string) => {
    return await authClient.delete<any>(url);
  }

  // 1. Получение списка записей веса (с пагинацией)
  const fetchWeightRecords = async () => {
    try {
      const response = await customGet('/measurements/weight/');      
      const data = response.data;
      console.log('Получены записи (с пагинацией):', data);
      
      // Бэкенд возвращает { count, next, previous, results }
      if (data && data.results && Array.isArray(data.results)) {
        // Преобразуем вес из строки в число, если нужно
        const recordsWithNumberWeight = data.results.map((record: any) => ({
          ...record,
          weight: typeof record.weight === 'string' ? parseFloat(record.weight) : record.weight
        }));
        
        // Сортируем по date (от новых к старым — по дате замера)
        const sortedRecords = [...recordsWithNumberWeight].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setRecords(sortedRecords);
        return sortedRecords;
      } 
      // На всякий случай, если вдруг вернётся прямой массив
      else if (Array.isArray(data)) {
        // Сортируем по created_at (от новых к старым)
        const sortedRecords = [...data].sort((a, b) => {
          if (!a.created_at) return 1;
          if (!b.created_at) return -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setRecords(sortedRecords);
        return sortedRecords;
      }
      else {
        console.error('Бэкенд вернул неожиданный формат:', data);
        setRecords([]);
        return [];
      }
    } catch (err) {
      console.error('Ошибка загрузки записей веса:', err);
      setError('Не удалось загрузить записи веса');
      setRecords([]);
      return [];
    }
  };

  // 2. Получение данных для графика (прямой массив)
  const fetchChartData = async (selectedPeriod: 'week' | 'month' | 'year') => {
    try {
      const response = await customGet(`/measurements/weight/chart_data/?period=${selectedPeriod}`);
      const data = await response.data;
      console.log('Получены данные для графика (прямой массив):', data);
      
      // Для графика приходит прямой массив
      let chartDataArray: ChartDataPoint[] = [];
      
      if (Array.isArray(data)) {
        chartDataArray = data;
      } else if (data && data.results && Array.isArray(data.results)) {
        // Запасной вариант, если вдруг тоже с пагинацией
        chartDataArray = data.results;
      } else {
        console.error('Бэкенд вернул неожиданный формат для графика:', data);
        setChartData([]);
        return [];
      }
      
      const formattedData: FormattedChartDataPoint[] = chartDataArray.map(point => {
        const dateParts = point.date.split('-');
        const day = dateParts[2];
        const month = dateParts[1];
        const year = dateParts[0].slice(-2);
        
        return {
          date: point.date,
          weight: typeof point.weight === 'string' ? parseFloat(point.weight) : point.weight,
          displayDate: `${day}.${month}.${year}`,
          fullDate: point.date,
        };
      });
      
      setChartData(formattedData);
      return formattedData;
    } catch (err) {
      console.error('Ошибка загрузки данных для графика:', err);
      setError('Не удалось загрузить данные для графика');
      setChartData([]);
      return [];
    }
  };

  // 3. Загрузка всех данных при монтировании компонента и смене периода
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchWeightRecords(),
          fetchChartData(period),
        ]);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();

    setShowCalendar(true);
    return () => setShowCalendar(false); // Важно! Сброс при уходе со страницы
  }, [period, setShowCalendar]);

  // Открытие меню троеточия
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, recordId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecordId(recordId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRecordId(null);
  };

  // Добавление комментария (используем специальный эндпоинт update_comment)
  const handleAddComment = async () => {
    if (selectedRecordId !== null) {
      const comment = prompt('Введите комментарий к замеру:', '');
      if (comment !== null) {
        try {
          // Используем специальный эндпоинт для обновления комментария
          const response = await customPatch(`/measurements/weight/${selectedRecordId}/update_comment/`, { comment: comment || '' });
          const updatedRecord = response.data;
          setRecords(prevRecords =>
            prevRecords.map(record =>
              record.id === selectedRecordId 
                ? { ...updatedRecord, weight: typeof updatedRecord.weight === 'string' ? parseFloat(updatedRecord.weight) : updatedRecord.weight }
                : record
            )
          );
        } catch (err) {
          console.error('Ошибка:', err);
          alert('Не удалось добавить комментарий');
        }
      }
    }
    handleMenuClose();
  };

  // Редактирование веса (используем стандартный PATCH, так как специального эндпоинта нет)
  const handleEditWeight = async () => {
    if (selectedRecordId !== null) {
      const record = records.find(r => r.id === selectedRecordId);
      if (!record) return;
      
      const newWeightStr = prompt('Введите новый вес (кг):', String(record.weight));
      const newWeight = parseFloat(newWeightStr || '');
      
      if (!isNaN(newWeight) && newWeight > 0) {
        try {
          // Для редактирования веса используем стандартный PATCH к detail эндпоинту
          const response = await customPatch(`/measurements/weight/${selectedRecordId}/`, { weight: newWeight });
          const updatedRecord = response.data;
          setRecords(prevRecords =>
            prevRecords.map(record =>
              record.id === selectedRecordId 
                ? { ...updatedRecord, weight: typeof updatedRecord.weight === 'string' ? parseFloat(updatedRecord.weight) : updatedRecord.weight }
                : record
            )
          );
          await fetchChartData(period);
        } catch (err) {
          console.error('Ошибка:', err);
          alert('Не удалось изменить вес');
        }
      } else {
        alert('Пожалуйста, введите корректное число');
      }
    }
    handleMenuClose();
  };

  // Удаление записи (используем специальный эндпоинт delete_weight)
  const handleDeleteRecord = async () => {
    if (selectedRecordId !== null) {
      const confirmDelete = window.confirm('Удалить запись?');
      if (confirmDelete) {
        try {
          // Используем специальный эндпоинт для удаления
          const response = await customDelete(`/measurements/weight/${selectedRecordId}/delete_weight/`); 
          const result = response.data;
          console.log('Результат удаления:', result);
          
          setRecords(prevRecords => prevRecords.filter(record => record.id !== selectedRecordId));
          await fetchChartData(period);
        } catch (err) {
          console.error('Ошибка:', err);
          alert('Не удалось удалить запись');
        }
      }
    }
    handleMenuClose();
  };

  // Добавление новой записи о весе (используем perform_create через стандартный POST)
  const handleAddWeight = async () => {
    const weightNum = parseFloat(weightInput);
    if (isNaN(weightNum) || weightNum <= 20 || weightNum > 500) {
      alert('Введите корректный вес (положительное число, от 20 до 500)');
      return;
    }

    // Сегодняшняя дата в формате YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate > today) {
      alert('Выберите корректную дату (не позднее сегодняшней)');
      return;
    }

    const newRecord = {
      date: selectedDate ?? today,
      weight: weightNum,
    };

    try {
      // POST запрос вызовет perform_create в ViewSet, который сам обработает привязку к пользователю
      const response = await customPost(`/measurements/weight/`, newRecord);
      const createdRecord = response.data;
      
      const normalizedRecord = {
        ...createdRecord,
        weight: typeof createdRecord.weight === 'string' ? parseFloat(createdRecord.weight) : createdRecord.weight
      };
      
      // Добавляем новую запись и сортируем по date (от новых к старым)
      setRecords(prevRecords => {
        const updatedRecords = [...prevRecords, normalizedRecord];
        return updatedRecords.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      });
      
      await fetchChartData(period);
      setWeightInput('');
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Не удалось добавить запись');
    }
  };

  // Форматирование даты для отображения в списке
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 1.5, maxWidth: 800, mx: 'auto', bgcolor: 'transparent', boxShadow: 'none' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton 
          onClick={() => window.location.href = '/'}
          sx={{
            width: 28,
            height: 28,
            border: '2px solid rgba(128, 128, 128, 1)',
            color: 'rgba(128, 128, 128, 1)',
            backgroundColor: 'transparent',
            padding: '4px',
            '&:hover': {
              backgroundColor: 'rgba(158, 158, 158, 0.1)',
            },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Typography variant="h5" sx={{ color: 'rgba(128, 128, 128, 1)', fontFamily: 'Manrope, sans-serif',  fontSize: '1.9rem'}}>
          Вес
        </Typography>
      </Box>

      {/* График динамики веса */}
      <Box sx={{ 
        height: 300, 
        mb: 1,
        border: '1px solid #e0e0e0',
        borderRadius: '16px',
        p: 2,
        bgcolor: 'white'
      }} className='weight-plot' >
        {/* Переключатели периода */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {(['week', 'month', 'year'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setPeriod(p)}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                ...(period === p && { bgcolor: '#F884AC', '&:hover': { bgcolor: '#c62828' } })
              }}
            >
              {p === 'week' && 'Неделя'}
              {p === 'month' && 'Месяц'}
              {p === 'year' && 'Год'}
            </Button>
          ))}
        </Box>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayDate" />
              <YAxis domain={['auto', 'auto']} unit=" кг" />
              <Tooltip
                formatter={(value) => `${value} кг`}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload) {
                    return `Дата : ${payload[0].payload.fullDate}`;
                  }
                  return `Дата : ${label}`;
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                name="Вес"
                stroke="#F884AC"
                strokeWidth={2}
                dot={{ r: 4, fill: '#F884AC', stroke: 'white', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 10 }}>
            Нет данных для отображения графика. Добавьте замеры.
          </Typography>
        )}
      </Box>

      {/* Контейнер для контента */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '66.666%' }}>
          <Typography variant="h5" sx={{ mt: 1, mb: 0.5, color: 'rgba(128, 128, 128, 1)', fontWeight: 'bold', textAlign: 'left' }}>
            Отметки веса
          </Typography>

          {/* Форма добавления веса */}
          <Box sx={{ bgcolor: 'rgba(217, 217, 217, 0.4)', borderRadius: '16px', p: 2, mb: 0.5 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                type="number"
                label="Добавить вес"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="например: 74.5"
                fullWidth
                onKeyPress={(e) => e.key === 'Enter' && handleAddWeight()}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: 'rgba(251, 251, 251, 0.66)' }, '& .MuiInputLabel-root': { fontSize: '1.1rem', fontWeight: 'semibold', }, }}
              />
              <Button onClick={handleAddWeight} sx={{ minWidth: '56px', height: '56px', borderRadius: '16px', bgcolor: '#81c784',  padding: 0, }}>
                <Box sx={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #1b5e20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AddIcon sx={{ color: '#1b5e20', fontSize: 24 }} />
                </Box>
              </Button>
            </Box>
          </Box>

          {/* Список замеров - сортировка по created_at (новые сверху) */}
          {records.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              Нет записей. Добавьте первый замер.
            </Typography>
          ) : (
            records.map((record) => (
              <Box
                key={record.id}
                sx={{
                  bgcolor: 'rgba(217, 217, 217, 0.4)',
                  borderRadius: '16px',
                  p: 2,
                  mb: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography sx={{ color: 'rgba(128, 128, 128, 1)', fontWeight: 'bold' }}>
                    {formatDate(record.date)}
                  </Typography>
                  <Typography sx={{ color: 'rgba(128, 128, 128, 1)', fontSize: '1rem' }}>
                    {record.comment || 'Без комментария'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'rgba(128, 128, 128, 0.4)' }}>
                    {record.weight}
                  </Typography>
                  <IconButton onClick={(e) => handleMenuOpen(e, record.id)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* Меню троеточия */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleAddComment}>Добавить комментарий</MenuItem>
        <MenuItem onClick={handleEditWeight}>Редактировать вес</MenuItem>
        <MenuItem onClick={handleDeleteRecord} sx={{ color: 'error.main' }}>
          Удалить
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default WeightTracker;