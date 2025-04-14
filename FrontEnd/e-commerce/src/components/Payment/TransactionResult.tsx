import React from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import CardIcon from './CardIcon';
import { CardType } from './utils/cardUtils';

interface TransactionResultProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  details: {
    id: string;
    amount: string;
    currency: string;
    reference: string;
    date: string;
    cardInfo: string;
    cardType: CardType;
  };
  productId: string;
  quantity: number;
  fullName: string;
  email: string;
  onContinue: () => void;
  onRetry: () => void;
  onCancel: () => void;
}

const TransactionResult: React.FC<TransactionResultProps> = ({
  status,
  details,
  productId,
  quantity,
  fullName,
  email,
  onContinue,
  onRetry,
  onCancel
}) => {
  // Renderizar el icono según el estado de la transacción
  const renderStatusIcon = () => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="h-16 w-16 text-green-500" />;
      case 'REJECTED':
        return <XCircleIcon className="h-16 w-16 text-red-500" />;
      case 'PENDING':
        return <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500" />;
      case 'CANCELED':
        return <XCircleIcon className="h-16 w-16 text-gray-500" />;
      default:
        return null;
    }
  };

  // Renderizar el mensaje según el estado de la transacción
  const renderStatusMessage = () => {
    switch (status) {
      case 'APPROVED':
        return 'Pago aprobado';
      case 'REJECTED':
        return 'Pago rechazado';
      case 'PENDING':
        return 'Procesando pago';
      case 'CANCELED':
        return 'Pago cancelado';
      default:
        return '';
    }
  };

  // Renderizar el icono de la tarjeta según el tipo
  const renderCardIcon = () => {
    return <CardIcon cardType={details.cardType} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-4">
        {renderStatusIcon()}
        <h3 className="mt-4 text-xl font-bold">{renderStatusMessage()}</h3>
        <p className="text-gray-400">
          {status === 'APPROVED' && 'Tu pago ha sido procesado exitosamente'}
          {status === 'REJECTED' && 'Tu pago no pudo ser procesado'}
          {status === 'PENDING' && 'Estamos procesando tu pago'}
          {status === 'CANCELED' && 'El proceso de pago ha sido cancelado'}
        </p>
      </div>

      <div className="bg-[#16213e] rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Producto:</span>
          <span className="font-medium">{productId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Cantidad:</span>
          <span className="font-medium">{quantity}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total:</span>
          <span className="font-bold text-[#08d9d6]">
            {details.currency} {details.amount}
          </span>
        </div>
      </div>

      <div className="bg-[#16213e] rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Nombre:</span>
          <span className="font-medium">{fullName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Email:</span>
          <span className="font-medium">{email}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Método de pago:</span>
          <div className="flex items-center space-x-2">
            {renderCardIcon()}
            <span className="font-medium">{details.cardInfo}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">ID de transacción:</span>
          <span className="font-medium text-xs">{details.id}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Fecha:</span>
          <span className="font-medium">{details.date}</span>
        </div>
      </div>

      <div className="pt-4 flex flex-col space-y-3">
        {status === 'APPROVED' && (
          <button
            onClick={onContinue}
            className="w-full bg-[#08d9d6] hover:bg-[#06b6b3] text-[#1a1a2e] font-bold py-2 px-4 rounded-md transition-colors"
          >
            Continuar
          </button>
        )}

        {status === 'REJECTED' && (
          <>
            <button
              onClick={onRetry}
              className="w-full bg-[#08d9d6] hover:bg-[#06b6b3] text-[#1a1a2e] font-bold py-2 px-4 rounded-md transition-colors"
            >
              Intentar nuevamente
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-transparent hover:bg-gray-800 text-white border border-gray-600 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Cancelar
            </button>
          </>
        )}

        {status === 'PENDING' && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#08d9d6]"></div>
          </div>
        )}

        {status === 'CANCELED' && (
          <button
            onClick={onRetry}
            className="w-full bg-[#08d9d6] hover:bg-[#06b6b3] text-[#1a1a2e] font-bold py-2 px-4 rounded-md transition-colors"
          >
            Intentar nuevamente
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionResult;