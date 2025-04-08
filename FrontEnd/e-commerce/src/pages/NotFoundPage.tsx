import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Página no encontrada
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          La página que estás buscando no existe o ha sido movida.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </Box>
    </Layout>
  );
};

export default NotFoundPage;