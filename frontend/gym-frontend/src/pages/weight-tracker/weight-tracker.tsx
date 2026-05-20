import React, { useState } from 'react';
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Typography,
  Box,
  Stack,
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

// Тип данных записи замера
interface WeightRecord {
  date: string;
  weight: number;
  comment?: string;
}

// Начальные данные (2 записи)
const mockWeightRecords: WeightRecord[] = [
  { date: '2026-04-03', weight: 74.8 },
  { date: '2026-04-09', weight: 74.3, comment: 'Прогресс' },
];

const WeightTracker: React.FC = () => {
  const [records, setRecords] = useState<WeightRecord[]>(mockWeightRecords);
  const [weightInput, setWeightInput] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecordIndex, setSelectedRecordIndex] = useState<number | null>(
    null
  );

  // Открытие меню троеточия
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecordIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRecordIndex(null);
  };

  // Добавление комментария (через prompt)
  const handleAddComment = () => {
    if (selectedRecordIndex !== null) {
      const comment = prompt('Введите комментарий к замеру:', '');
      if (comment !== null) {
        const updatedRecords = [...records];
        updatedRecords[selectedRecordIndex] = {
          ...updatedRecords[selectedRecordIndex],
          comment: comment || undefined,
        };
        setRecords(updatedRecords);
      }
    }
    handleMenuClose();
  };

  // Редактирование веса
  const handleEditWeight = () => {
    if (selectedRecordIndex !== null) {
      const currentWeight = records[selectedRecordIndex].weight;
      const newWeightStr = prompt('Введите новый вес (кг):', String(currentWeight));
      const newWeight = parseFloat(newWeightStr || '');
      if (!isNaN(newWeight) && newWeight > 0) {
        const updatedRecords = [...records];
        updatedRecords[selectedRecordIndex] = {
          ...updatedRecords[selectedRecordIndex],
          weight: newWeight,
        };
        setRecords(updatedRecords);
      } else {
        alert('Пожалуйста, введите корректное число');
      }
    }
    handleMenuClose();
  };

  // Удаление записи
  const handleDeleteRecord = () => {
    if (selectedRecordIndex !== null) {
      const confirmDelete = window.confirm('Удалить запись?');
      if (confirmDelete) {
        const updatedRecords = records.filter(
          (_, idx) => idx !== selectedRecordIndex
        );
        setRecords(updatedRecords);
      }
    }
    handleMenuClose();
  };

  // Добавление новой записи о весе
    const handleAddWeight = () => {
      const weightNum = parseFloat(weightInput);
      if (isNaN(weightNum) || weightNum <= 0) {
        alert('Введите корректный вес (положительное число)');
        return;
      }

      // Автоматически ставим сегодняшнюю дату
      const today = new Date().toISOString().split('T')[0];
  
      const newRecord: WeightRecord = {
        date: today,
        weight: weightNum,
      };
  
      const newRecords = [...records, newRecord].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setRecords(newRecords);
      setWeightInput('');
    };

  // Подготовка данных для графика
  const chartData = records
    .map((record) => ({
      date: record.date.split('-').slice(1).reverse().join('.'), // ← только ДД.ММ
      weight: record.weight,
      fullDate: record.date,
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  return (
    <Paper sx={{ p: 1.5, maxWidth: 800, mx: 'auto', bgcolor: 'transparent', boxShadow: 'none' }}>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <IconButton 
        onClick={() => {
          window.location.href = '/';
        }}
        sx={{
	  width: 28,
          height: 28,
          border: '2px solid rgba(128, 128, 128, 1)',
          color: 'rgba(128, 128, 128, 1)',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(158, 158, 158, 0.1)',
            border: '2px solid rgba(128, 128, 128, 1)',
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
            }}
        >
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
        paddingBottom: 0,
        bgcolor: 'white'
      }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['auto', 'auto']} unit=" кг" />
              <Tooltip
                formatter={(value) => {
                  if (typeof value === 'number') {
                    return [`${value} кг`, 'Вес'];
                  }
                  return [value, 'Вес'];
                }}
                labelFormatter={(label) => `Дата: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#e53935"
                strokeWidth={2}
                dot={{ r: 4, fill: '#e53935', stroke: 'white', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#e53935', stroke: 'white', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Typography color="text.secondary">
            Нет данных для отображения графика. Добавьте замеры.
          </Typography>
        )}
      </Box>

      {/* Контейнер для контента шириной 2/3 от ширины графика, выравненный по центру */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '66.666%' }}>
          {/* Заголовок над подложкой */}
          <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 0.5, textAlign: 'left', color: 'rgba(128, 128, 128, 1)', fontFamily: 'Manrope, sans-serif', fontWeight: 'bold'}}>
            Отметки веса
          </Typography>

          {/* Форма добавления веса - карточка (подложка) */}
          <Box
            sx={{
              bgcolor: 'rgba(217, 217, 217, 0.4)',
              borderRadius: '16px',
              p: 2,
              mb: 0.5,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                type="number"
                label="Добавить вес"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="например: 74.5"
                fullWidth
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddWeight();
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    bgcolor: 'rgba(251, 251, 251, 0.66)',
                  },
                }}
              />
              <Button
                onClick={handleAddWeight}
                sx={{
                  minWidth: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  bgcolor: '#81c784',
                  '&:hover': {
                    bgcolor: '#a5d6a7',
                  },
                  p: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #1b5e20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AddIcon sx={{ color: '#1b5e20', fontSize: 24 }} />
                </Box>
              </Button>
            </Box>
          </Box>

          {/* Список замеров - каждая запись в отдельной карточке */}
          {records.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              Нет записей. Добавьте первый замер.
            </Typography>
          ) : (
            [...records]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((record, idx) => {
                const originalIndex = records.findIndex(
                  (r) => r.date === record.date && r.weight === record.weight
                );
                // Форматируем дату: "5 марта 2026"
                const formatDate = (dateString: string) => {
                  const date = new Date(dateString);
                  const months = [
                    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
                  ];
                  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
                };

                return (
                  <Box
                    key={record.date + record.weight}
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
                    {/* Левая часть: дата и комментарий */}
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body1" sx={{ color: 'rgba(128, 128, 128, 1)', fontFamily: 'Manrope, sans-serif', fontWeight: 'bold'}}>
                        {formatDate(record.date)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(128, 128, 128, 1)', fontFamily: 'Manrope, sans-serif', fontWeight: 500}}>
                        {record.comment || 'Без комментария'}
                      </Typography>
                    </Box>

                    {/* Правая часть: вес и троеточие */}
                    <Box sx={{ display: 'flex', alignItems: 'center'}}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'rgba(128, 128, 128, 0.4)' }}>
                        {record.weight}
                      </Typography>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuOpen(e, originalIndex)}
                        sx={{ p: 0.5, color: 'rgba(128, 128, 128, 1)' }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })
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