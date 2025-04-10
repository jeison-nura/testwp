import React, { useEffect, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { paymentService } from '../../services/api';
import { CustomerData, TransactionResponse } from '../../types/payment.types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  quantity: number;
  productName: string;
  productId: string; // Añadir el ID del producto
}

declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  quantity,
  productName,
  productId,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<any>(null);

  // Estados para capturar datos del usuario
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [legalId, setLegalId] = useState('');
  const [legalIdType, setLegalIdType] = useState('CC');

  // Estado para almacenar la transacción creada en el backend
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);

  // Función para crear una transacción en el backend y luego inicializar el widget de Wompi
  const createTransactionAndInitWidget = async (customerData: CustomerData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Crear la transacción en el backend
      const paymentData = {
        id: productId, // Usar el ID real del producto
        quantity: quantity,
        userEmail: customerData.email,
      };
      
      const transactionResponse = await paymentService.createTransaction(paymentData);
      setTransaction(transactionResponse);
      
      // Inicializar el widget con la información de la transacción
      initializeWidget(customerData, transactionResponse);
    } catch (e) {
      console.error('Error al crear la transacción:', e);
      setError('Ocurrió un error al procesar el pago. Por favor, intente nuevamente.');
      setIsLoading(false);
    }
  };

  // Función para cancelar la transacción
  const cancelTransaction = async (transactionId: string) => {
    try {
      await paymentService.updateTransactionStatus(transactionId, 'CANCELED');
      console.log('Transacción cancelada exitosamente:', transactionId);
    } catch (error) {
      console.error('Error al cancelar la transacción:', error);
    }
  };

  // Función para inicializar el widget de Wompi con los datos del cliente y la transacción
  const initializeWidget = (customerData: CustomerData, transactionData: TransactionResponse) => {
    if (!window.WidgetCheckout) {
      setError('El widget de pago no está disponible. Por favor, recargue la página.');
      setIsLoading(false);
      // Cancelar la transacción si el widget no está disponible
      if (transactionData && transactionData.id) {
        cancelTransaction(transactionData.id);
      }
      return;
    }
    try {
      // Destruir la instancia anterior del widget si existe
      if (widgetRef.current && typeof widgetRef.current.destroy === 'function') {
        widgetRef.current.destroy();
      }
      
      // Configurar el widget con los datos de la transacción
      const { paymentConfig } = transactionData;
      
      widgetRef.current = new window.WidgetCheckout({
        currency: paymentConfig.currency,
        amountInCents: paymentConfig.amountInCents,
        reference: paymentConfig.reference,
        publicKey: paymentConfig.publicKey,
        signature: paymentConfig.signature, // Código de integridad generado en el backend
        redirectUrl: paymentConfig.redirectUrl,
        customerData: customerData
      });
      
      setIsLoading(false);
      console.log('Widget inicializado con:', { customerData, transactionData });
      
      // Abrir el widget después de inicializarlo
      widgetRef.current.open((result: any) => {
        console.log('Widget result:', result);
        
        // Check if the transaction exists in the result
        if (result && result.transaction) {
          const transaction = result.transaction;
          console.log('Transaction ID: ', transaction.id);
          console.log('Transaction object: ', transaction);
          
          // If the transaction was approved, we don't need to cancel it
          if (transaction.status === 'APPROVED') {
            console.log('Payment approved successfully!');
          } else {
            // If the transaction was not approved (user closed widget or payment failed)
            console.log('Payment not completed. Status:', transaction.status);
            cancelTransaction(transactionData.id);
          }
        } else {
          // If there's no transaction in the result, the user likely closed the widget
          console.log('Widget closed without completing transaction');
          cancelTransaction(transactionData.id);
        }
      });
    } catch (e) {
      console.error('Error al inicializar el widget:', e);
      setError('Ocurrió un error al inicializar el widget de pago. Por favor, intente nuevamente.');
      setIsLoading(false);
      // Cancelar la transacción si hay un error al inicializar el widget
      if (transactionData && transactionData.id) {
        cancelTransaction(transactionData.id);
      }
    }
  };

  // También necesitamos manejar el cierre del modal
  const handleClose = () => {
    // Si hay una transacción en curso y no ha sido completada, cancelarla
    if (transaction && transaction.id) {
      cancelTransaction(transaction.id);
    }
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setError(null);

    // Cargar el script del widget de Wompi si no está ya cargado
    if (!document.getElementById('wompi-script')) {
      const script = document.createElement('script');
      script.id = 'wompi-script';
      script.src = 'https://checkout.wompi.co/widget.js';
      script.async = true;
      script.onload = () => setIsLoading(false);
      script.onerror = () => {
        setError('No se pudo cargar el widget de pago. Por favor, intente nuevamente.');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    } else {
      setIsLoading(false);
    }

    return () => {
      // Limpiar la instancia del widget al desmontar el componente
      if (widgetRef.current && typeof widgetRef.current.destroy === 'function') {
        try {
          widgetRef.current.destroy();
        } catch (e) {
          console.warn('Error al destruir el widget:', e);
        }
      }
      widgetRef.current = null;
    };
  }, [isOpen]);

  // Maneja el envío del formulario para capturar datos y crear la transacción
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Datos capturados:', { email, fullName, phoneNumber, legalId, legalIdType });
    if (!email || !fullName || !phoneNumber || !legalId) {
      setError('Por favor, complete todos los campos obligatorios.');
      return;
    }
    setError(null);
    const customerData = {
      email,
      fullName,
      phoneNumber,
      phoneNumberPrefix: '+57',
      legalId,
      legalIdType,
    };
    createTransactionAndInitWidget(customerData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md p-6 mx-auto bg-[#1a1a2e] rounded-xl shadow-xl text-white">
        <button
          onClick={handleClose} // Cambiado de onClose a handleClose
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Cerrar modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-[#08d9d6]">Pago Seguro</h2>

        {/* Formulario para capturar datos del cliente */}
        <form onSubmit={handleFormSubmit} className="mb-4">
          <div className="mb-2">
            <label htmlFor="email" className="block text-sm">Email:</label>
            <input
              type="email"
              id="email"
              className="w-full p-2 rounded text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-2">
            <label htmlFor="fullName" className="block text-sm">Nombre Completo:</label>
            <input
              type="text"
              id="fullName"
              className="w-full p-2 rounded text-black"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="mb-2">
            <label htmlFor="phoneNumber" className="block text-sm">Número de Teléfono:</label>
            <input
              type="tel"
              id="phoneNumber"
              className="w-full p-2 rounded text-black"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="mb-2">
            <label htmlFor="legalIdType" className="block text-sm">Tipo de Documento:</label>
            <select
              id="legalIdType"
              className="w-full p-2 rounded text-black"
              value={legalIdType}
              onChange={(e) => setLegalIdType(e.target.value)}
              required
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="PP">Pasaporte</option>
            </select>
          </div>
          <div className="mb-2">
            <label htmlFor="legalId" className="block text-sm">Número de Documento:</label>
            <input
              type="text"
              id="legalId"
              className="w-full p-2 rounded text-black"
              value={legalId}
              onChange={(e) => setLegalId(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-bold transform transition-all duration-200 ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#ff2e63] hover:bg-[#e0264f]'} text-white`}
            >
              {isLoading ? 'Cargando...' : 'Proceder al Pago'}
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-sm text-gray-400">
          <p className="flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#08d9d6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pago seguro con tarjeta de crédito
          </p>
          <p className="text-center text-xs">Todos los datos son procesados de forma segura</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
 
