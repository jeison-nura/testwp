import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchProductById,
  clearSelectedProduct,
} from "../../store/slices/productSlice";
import { PuzzlePieceIcon, CheckCircleIcon, CreditCardIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import PaymentModal from "../Payment/PaymentModal";

// Componente de calificación personalizado con Tailwind
const TailwindRating: React.FC<{ value: number, max?: number }> = ({ value, max = 5 }) => {
  return (
    <div className="flex items-center">
      {[...Array(max)].map((_, index) => (
        <span key={index}>
          {index < value ? (
            <StarIcon className="h-5 w-5 text-[#ff2e63]" />
          ) : (
            <StarOutlineIcon className="h-5 w-5 text-[#ff2e63]" />
          )}
        </span>
      ))}
    </div>
  );
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedProduct, loading, error } = useAppSelector(
    (state) => state.products
  );
  const [paymentSnackbarOpen, setPaymentSnackbarOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [randomRating] = useState(Math.floor(Math.random() * 5) + 1);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  const handleBack = () => {
    navigate("/");
  };

  const handlePayNow = () => {
    // Abrir el modal de pago
    setPaymentModalOpen(true);
  };
  
  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    // Mostrar mensaje de confirmación
    setPaymentSnackbarOpen(true);
    
    // Auto-cerrar el mensaje después de 3 segundos
    setTimeout(() => {
      setPaymentSnackbarOpen(false);
    }, 3000);
  };

  const handleIncreaseQuantity = () => {
    if (selectedProduct && quantity < selectedProduct.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue >= 1 && selectedProduct && newValue <= selectedProduct.quantity) {
      setQuantity(newValue);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#08d9d6]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2">
          {error}
        </div>
        <button 
          onClick={handleBack}
          className="border-2 border-[#08d9d6] text-[#08d9d6] hover:bg-[#08d9d6] hover:bg-opacity-10 px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 active:shadow-md ring-2 ring-[#08d9d6]/20 ring-offset-1"
        >
          Volver a la lista de productos
        </button>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="my-4">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-2">
          Producto no encontrado
        </div>
        <button 
          onClick={handleBack}
          className="border-2 border-[#08d9d6] text-[#08d9d6] hover:bg-[#08d9d6] hover:bg-opacity-10 px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 active:shadow-md ring-2 ring-[#08d9d6]/20 ring-offset-1"
        >
          Volver a la lista de productos
        </button>
      </div>
    );
  }

  // Asegurarse de que el precio sea un número y tenga 2 decimales
  const formattedPrice = selectedProduct
    ? typeof selectedProduct.price === "number"
      ? selectedProduct.price.toFixed(2)
      : parseFloat(String(selectedProduct.price)).toFixed(2)
    : "0.00";

  // Características del juego (simuladas)
  const gameFeatures = [
    "Gráficos de alta calidad",
    "Multijugador en línea",
    "Historia inmersiva",
    "Actualizaciones gratuitas",
    "Compatible con controladores",
  ];

  return (
    <div className="my-4">
      <button
        onClick={handleBack}
        className="mb-4 flex items-center border-2 border-[#08d9d6] text-[#08d9d6] hover:bg-[#08d9d6] hover:bg-opacity-10 px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 active:shadow-md ring-2 ring-[#08d9d6]/20 ring-offset-1"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" /> Volver a la tienda de juegos
      </button>

      {paymentSnackbarOpen && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Procesando pago para {quantity} unidad(es)...
        </div>
      )}
      
      {/* Modal de pago */}
      <PaymentModal 
        isOpen={paymentModalOpen}
        onClose={handleClosePaymentModal}
        quantity={quantity}
        productId={selectedProduct?.id || ""}
      />

      <div className="bg-[#1a1a2e] text-white rounded-xl overflow-hidden shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative">
            <div 
              className="h-[300px] md:h-[500px] bg-[#252a34] bg-cover bg-center rounded-lg relative"
              style={{ backgroundImage: `url(https://source.unsplash.com/random?videogame=${selectedProduct?.id})` }}
            >
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center mb-2">
              <PuzzlePieceIcon className="h-7 w-7 text-[#08d9d6] mr-2" />
              <h1 className="text-2xl md:text-3xl font-bold">
                {selectedProduct?.name}
              </h1>
            </div>

            <div className="flex items-center mb-3">
              <TailwindRating value={randomRating} />
              <span className={`ml-2 text-xs py-1 px-2 rounded-full ${selectedProduct?.quantity > 0 ? 'bg-[#08d9d6] bg-opacity-20 text-[#08d9d6]' : 'bg-[#ff2e63] bg-opacity-20 text-[#ff2e63]'} font-bold`}>
                Stock: {selectedProduct?.quantity}
              </span>
            </div>

            <div className="flex items-center mb-3">
              <div className="bg-[#252a34] text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1 w-fit">
                <CreditCardIcon className="h-4 w-4" />${formattedPrice}
              </div>
            </div>

            <div className="my-3 border-t border-[#252a34]"></div>

            <h2 className="text-lg font-bold text-[#08d9d6] mb-2">
              Cantidad
            </h2>
            
            <div className="flex items-center mb-4">
              <button 
                onClick={handleDecreaseQuantity}
                disabled={quantity <= 1}
                className={`w-10 h-10 flex items-center justify-center rounded-l-lg ${quantity <= 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-[#252a34] text-white hover:bg-[#323a47]'}`}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={selectedProduct?.quantity || 1}
                value={quantity}
                onChange={handleQuantityChange}
                onWheel={(e) => e.preventDefault()}
                className="w-16 h-10 text-center bg-[#252a34] text-white border-x-0 border-y border-[#323a47] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button 
                onClick={handleIncreaseQuantity}
                disabled={selectedProduct ? quantity >= selectedProduct.quantity : true}
                className={`w-10 h-10 flex items-center justify-center rounded-r-lg ${selectedProduct && quantity < selectedProduct.quantity ? 'bg-[#252a34] text-white hover:bg-[#323a47]' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
              >
                +
              </button>
              <span className="ml-3 text-[#eaeaea]">
                {selectedProduct && selectedProduct.quantity > 0 ? `Disponible: ${selectedProduct.quantity}` : 'Agotado'}
              </span>
            </div>

            <div className="flex items-center mb-4">
              <div className="bg-[#252a34] text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1 w-fit">
                <CreditCardIcon className="h-4 w-4" />Total: ${(parseFloat(formattedPrice) * quantity).toFixed(2)}
              </div>
            </div>

            <h2 className="text-lg font-bold text-[#08d9d6] mb-2">
              Descripción del juego
            </h2>

            <p className="text-[#eaeaea] mb-4">
              {selectedProduct?.description}
            </p>

            <h2 className="text-lg font-bold text-[#08d9d6] mt-3 mb-2">
              Características
            </h2>

            <ul className="space-y-1">
              {gameFeatures.map((feature, index) => (
                <li key={index} className="flex items-start mb-1">
                  <span className="mr-2 mt-1 min-w-[20px]">
                    <CheckCircleIcon className="h-4 w-4 text-[#ff2e63]" />
                  </span>
                  <span className="text-[#eaeaea]">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-2 mb-8">
              <button
                className={`w-full py-3 px-4 rounded-lg font-bold transform transition-all duration-200 border-2 shadow-md
                ${selectedProduct?.quantity > 0 
                  ? 'bg-[#ff2e63] text-white hover:bg-[#e0264f] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] border-[#ff2e63]/30 ring-2 ring-[#ff2e63]/20 ring-offset-1 ring-offset-[#1a1a2e]' 
                  : 'bg-[#252a34] text-gray-500 cursor-not-allowed border-gray-600/30'}`}
                disabled={selectedProduct?.quantity <= 0}
                onClick={handlePayNow}
              >
                Comprar {quantity} {quantity > 1 ? 'unidades' : 'unidad'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
