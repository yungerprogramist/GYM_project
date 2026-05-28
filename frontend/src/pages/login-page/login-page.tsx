import React, { useState } from 'react';
import { Container, Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Валидация
    if (!username.trim() || !password.trim()) {
      setError('Пожалуйста, заполните логин и пароль');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/users/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Сохраняем токены
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        
        // Можно также сохранить информацию о пользователе, если она приходит
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Вызываем callback успешного входа
        onLoginSuccess();
      } else {
        // Обработка ошибок от сервера
        const errorMessage = data.detail || data.message || 'Неверный логин или пароль';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ошибка соединения с сервером. Проверьте, запущен ли бэкенд.');
    } finally {
      setLoading(false);
    }
  };

  // Обработка нажатия Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  return (
    <Container
      className='login-form'
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 12,
      }}
    >
      <Box
        sx={{
          fontFamily: 'Manrope, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%',
          maxWidth: 400,
          height: '100%',
          minHeight: 450,
          p: 3,
          borderRadius: 10,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3, pt: 4, color: 'rgba(128, 128, 128, 1)' }}>
          <Typography variant="h4">
            Добро пожаловать!
          </Typography>
          <Typography variant="h5" sx={{ mt: 1, color: 'rgba(102, 102, 102, 1)' }}>
            Авторизация
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ mb: 1 }}
          variant="outlined"
          fullWidth
          disabled={loading}
          autoFocus
        />

        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          fullWidth
          disabled={loading}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          disabled={loading}
          sx={{
            height: 45,
            backgroundColor: loading ? '#e0e0e0' : '#c3c3c3',
            borderRadius: '32px',
            textTransform: 'none',
            mt: 3,
            '&:hover': {
              backgroundColor: loading ? '#e0e0e0' : '#99E471',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Log in'}
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;