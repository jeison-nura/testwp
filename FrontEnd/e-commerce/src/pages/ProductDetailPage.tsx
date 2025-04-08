import React from 'react';
import ProductDetail from '../components/Products/ProductDetail';
import Layout from '../components/Layout/Layout';

const ProductDetailPage: React.FC = () => {
  return (
    <Layout>
      <ProductDetail />
    </Layout>
  );
};

export default ProductDetailPage;