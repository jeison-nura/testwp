import React from 'react';
import ProductList from '../components/Products/ProductList';
import Layout from '../components/Layout/Layout';

const HomePage: React.FC = () => {
  return (
    <Layout>
      <ProductList />
    </Layout>
  );
};

export default HomePage;