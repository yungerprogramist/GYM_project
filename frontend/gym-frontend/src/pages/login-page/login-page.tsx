import React from 'react';
import { Container, Box, TextField, Button, Typography } from '@mui/material';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const handleLogin = () => {
    onLoginSuccess();
  };

  return (
    <Container
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

        <TextField
          label="Логин"
          sx={{ mb: 1 }}
          variant="outlined"
          fullWidth
        />

        <TextField
          label="Пароль"
          type="password"
          variant="outlined"
          fullWidth
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          sx={{
            height: 45,
            backgroundColor: 'rgba(102, 102, 102, 0.25)',
            borderRadius: '32px',
            textTransform: 'none',
            mt: 3,
            '&:hover': {
              backgroundColor: '#99E471', // меняем цвет при наведении
            },
          }}
        >
          Log in
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;