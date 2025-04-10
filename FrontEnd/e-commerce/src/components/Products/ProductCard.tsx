import React from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../../types/product.types";
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { PuzzlePieceIcon, CreditCardIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: Product;
}

// Componente de calificación personalizado con Tailwind
const TailwindRating: React.FC<{ value: number, max?: number }> = ({ value, max = 5 }) => {
  return (
    <div className="flex items-center mb-1">
      {[...Array(max)].map((_, index) => (
        <span key={index}>
          {index < value ? (
            <StarIcon className="h-4 w-4 text-secondary-main" />
          ) : (
            <StarOutlineIcon className="h-4 w-4 text-secondary-main" />
          )}
        </span>
      ))}
    </div>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const [randomRating] = React.useState(Math.floor(Math.random() * 5) + 1);

  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
  };

  // Asegurarse de que el precio sea un número y tenga 2 decimales
  const formattedPrice =
    typeof product.price === "number"
      ? product.price.toFixed(2)
      : parseFloat(String(product.price)).toFixed(2);

  return (
    <div className="w-full h-[450px] flex">
     <div className="w-full h-[450px] flex flex-col rounded-lg overflow-hidden bg-background-paper text-text-primary transition-all duration-300 hover:-translate-y-2 hover:shadow-lg border border-gray-700/30">
        {/* Sección de imagen */}
        <div 
         className="h-[180px] bg-background-header bg-cover bg-center relative w-full"
          style={{ backgroundImage: `url(https://source.unsplash.com/random?videogame=${product.id})` }}
        />
        
        {/* Sección de título y calificación - con fondo ligeramente diferente */}
        <div className="p-3 bg-background-paper border-b border-gray-700/50">
          {/* Título del producto */}
          <div className="flex items-center mb-1">
            <PuzzlePieceIcon className="h-5 w-5 text-primary-main mr-1" />
            <h2 className="font-bold text-lg m-0 h-[2.5em] overflow-hidden text-ellipsis line-clamp-2">
              {product.name}
            </h2>
          </div>

          {/* Calificación */}
          <div>
            <TailwindRating value={randomRating} />
          </div>
        </div>
        
        {/* Sección de descripción - con fondo ligeramente más oscuro */}
        <div className="p-3 bg-background-paper/90 border-b border-gray-700/50">
          {/* Descripción */}
          <p className="text-sm text-text-secondary h-[3em] min-h-[3em] overflow-hidden text-ellipsis line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Sección de precio y stock - con fondo ligeramente más claro */}
        <div className="p-3 bg-background-header/30 border-b border-gray-700/50">
          <div className="flex justify-between items-center">
            <div className="bg-background-header text-text-primary py-1 px-3 rounded-lg font-bold flex items-center gap-0.5 shadow-sm">
              <CreditCardIcon className="h-4 w-4" />${formattedPrice}
            </div>
            <div className={`text-xs py-1 px-2 rounded-full ${
              product.quantity > 0
                ? "bg-primary-main bg-opacity-20 text-primary-main"
                : "bg-secondary-main bg-opacity-20 text-secondary-main"
            } shadow-sm`}>
              Stock: {product.quantity}
            </div>
          </div>
        </div>

        {/* Sección de botón - con fondo diferente y efecto de elevación */}
        <div className="p-4 flex flex-col mt-auto bg-background-paper/80 relative z-10 shadow-inner">
          <button
            onClick={handleViewDetails}
            disabled={product.quantity <= 0}
            className={`w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 
              transform transition-all duration-200 
              border-2 shadow-md 
              ${
                product.quantity > 0
                 ? "bg-primary-main text-primary-contrastText hover:bg-primary-dark hover:shadow-xl hover:scale-105 border-primary-main/30 active:scale-95 ring-2 ring-primary-main/20 ring-offset-1 ring-offset-background-paper/80"
                 : "bg-gray-700 text-text-disabled cursor-not-allowed border-gray-600/30"
              }`}
          >
            <PuzzlePieceIcon className="h-5 w-5" /> Ver juego
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
