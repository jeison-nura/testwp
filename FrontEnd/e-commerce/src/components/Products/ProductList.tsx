import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchProducts } from "../../store/slices/productSlice";
import ProductCard from "./ProductCard";
import { PuzzlePieceIcon } from '@heroicons/react/24/outline';

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center my-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#08d9d6]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="my-16 text-center text-white">
        <h5 className="text-xl font-medium">No hay juegos disponibles</h5>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-background-default -z-10"></div>
      <div className="flex items-center mb-8 bg-background-paper p-4 md:p-6 rounded-lg shadow-lg">
        <PuzzlePieceIcon className="h-8 w-8 text-[#08d9d6] mr-2" />
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Tienda de Juegos
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 relative">
        {products.map((product) => (
          <div key={product.id} className="flex h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </>
  );
};

export default ProductList;
