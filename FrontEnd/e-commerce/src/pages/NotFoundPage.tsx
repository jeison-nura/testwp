import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
        <p className="mb-8 text-gray-300">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-primary-main hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </Layout>
  );
};

export default NotFoundPage;