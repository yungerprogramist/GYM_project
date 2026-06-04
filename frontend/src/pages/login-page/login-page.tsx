import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import useAuthStore from '../../features/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const storeLogin = useAuthStore((state) => state.login);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Пожалуйста, заполните логин и пароль');
      return;
    }

    setError(null);
    setLoading(true);

    const result = await storeLogin(username.trim(), password);

    setLoading(false);

    switch (result) {
      case "successful":
        navigate('/my-account');
        break;
      case "incorrect login or password":
        setError('Неверный логин или пароль');
        break;
      case "server error":
        setError('Ошибка соединения с сервером. Проверьте, запущен ли бэкенд.');
        break;
      default:
        setError('Произошла неизвестная ошибка');
        break;
    }
  };

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
            backgroundColor: loading ? '#e0e0e0' : '#388E3C',
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