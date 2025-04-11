import React, { useEffect, useRef, useState } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { paymentService } from '../../services/api';
import { PaymentResponse } from '../../types/payment.types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number; // Keeping this as it might be used elsewhere
  quantity: number;
  productName: string;
  productId: string;
}

declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  quantity,
  productId,
  productName,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<any>(null);
  const [email, setEmail] = useState('');
  const [transaction, setTransaction] = useState<PaymentResponse | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED' | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [showForm, setShowForm] = useState(true);

  // Function to create a transaction in the backend
  const createTransaction = async (userEmail: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create the transaction in the backend with just email
      const paymentData = {
        id: productId,
        quantity: quantity,
        userEmail: userEmail,
      };
      
      const transactionResponse = await paymentService.createTransaction(paymentData);
      
      if (!transactionResponse || !transactionResponse.paymentConfig) {
        throw new Error('Invalid transaction response from server');
      }
      
      setTransaction(transactionResponse);
      setIsLoading(false);
      setShowForm(false);
      
    } catch (e) {
      console.error('Error creating transaction:', e);
      setError('An error occurred while processing the payment. Please try again.');
      setIsLoading(false);
    }
  };

  // Function to cancel the transaction
  const cancelTransaction = async (transactionId: string) => {
    try {
      await paymentService.updateTransactionStatus(transactionId, 'CANCELED');
      console.log('Transaction successfully canceled:', transactionId);
    } catch (error) {
      console.error('Error canceling transaction:', error);
    }
  };

  // We also need to handle closing the modal
  const handleClose = () => {
    // If there's an ongoing transaction that hasn't been completed, cancel it
    if (transaction && transaction.transaction && transaction.transaction.id && !transactionStatus) {
      cancelTransaction(transaction.transaction.id);
    }
    
    // Reset state for next time the modal is opened
    setTransactionStatus(null);
    setTransactionDetails(null);
    setShowForm(true);
    setError(null);
    
    onClose();
  };
  
  // Function to reset the form and start a new payment
  const handleNewPayment = () => {
    setTransactionStatus(null);
    setTransactionDetails(null);
    setShowForm(true);
    setError(null);
  };

  // Load the Wompi script when the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setError(null);

    // Load the Wompi widget script if it's not already loaded
    if (!document.getElementById('wompi-script')) {
      const script = document.createElement('script');
      script.id = 'wompi-script';
      script.src = 'https://checkout.wompi.co/widget.js';
      script.async = true;
      script.onload = () => setIsLoading(false);
      script.onerror = () => {
        setError('Could not load the payment widget. Please try again.');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    } else {
      setIsLoading(false);
    }

    return () => {
      // Clean up the widget instance when unmounting the component
      if (widgetRef.current && typeof widgetRef.current.destroy === 'function') {
        try {
          widgetRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying widget:', e);
        }
      }
      widgetRef.current = null;
    };
  }, [isOpen]);

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    createTransaction(email);
  };

  // Move the useEffect for the Wompi button to the component level
  useEffect(() => {
    // Only run this effect if we have a transaction and we're not showing the form
    if (!transaction || !transaction.paymentConfig || showForm) return;
    
    const { publicKey, currency, amountInCents, reference, signature } = transaction.paymentConfig;
    const {expDate} = transaction.transaction
    
    // Remove any existing Wompi button script
    const existingScript = document.getElementById('wompi-button-script');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Create the script element for the Wompi button
    const script = document.createElement('script');
    script.id = 'wompi-button-script';
    script.src = 'https://checkout.wompi.co/widget.js';
    // Add crossorigin attribute to help with CSP issues
    script.setAttribute('data-render', 'button');
    script.setAttribute('data-public-key', publicKey);
    script.setAttribute('data-currency', currency);
    script.setAttribute('data-amount-in-cents', amountInCents.toString());
    script.setAttribute('data-reference', reference);
    script.setAttribute('data-signature:integrity', signature);
    script.setAttribute('data-expiration-time', expDate)
    // Add event listener for transaction status
    const handleWompiSuccess = (event: any) => {
      console.log('Payment success:', event.detail);
      setTransactionStatus('APPROVED');
      setTransactionDetails({
        id: event.detail.transaction.id,
        amount: (event.detail.transaction.amountInCents / 100).toFixed(2),
        currency: event.detail.transaction.currency,
        paymentMethod: event.detail.transaction.paymentMethodType,
        reference: event.detail.transaction.reference,
        date: new Date().toLocaleString()
      });
      
      // Update transaction status in backend
      if (transaction.transaction && transaction.transaction.id) {
        paymentService.updateTransactionStatus(transaction.transaction.id, 'APPROVED', {
          wompiTransactionId: event.detail.transaction.id
        });
      }
    };
    
    const handleWompiError = (event: any) => {
      console.error('Payment error:', event.detail);
      setTransactionStatus('REJECTED');
      setTransactionDetails(event.detail);
      
      // Update transaction status in backend
      if (transaction.transaction && transaction.transaction.id) {
        paymentService.updateTransactionStatus(transaction.transaction.id, 'REJECTED');
      }
    };
    
    window.addEventListener('onWompiSuccess', handleWompiSuccess);
    window.addEventListener('onWompiError', handleWompiError);
    
    // Append the script to the Wompi button container
    const container = document.getElementById('wompi-button-container');
    if (container) {
      container.appendChild(script);
    }
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('onWompiSuccess', handleWompiSuccess);
      window.removeEventListener('onWompiError', handleWompiError);
    };
  }, [transaction, showForm]);

  // Function to render the Wompi button (without hooks inside)
  const renderWompiButton = () => {
    if (!transaction || !transaction.paymentConfig) return null;
    
    return (
      <div id="wompi-button-container" className="mt-4">
        {/* The Wompi button will be rendered here by the script */}
        <p className="text-center mb-4">Haga clic en el botón para realizar el pago</p>
      </div>
    );
  };

  if (!isOpen) return null;

  // Function to render transaction result UI based on status
  const renderTransactionResult = () => {
    if (!transactionStatus || !transactionDetails) return null;
    
    const statusConfig = {
      'APPROVED': {
        icon: <CheckCircleIcon className="h-12 w-12 text-green-500" />,
        title: 'Pago Aprobado',
        bgColor: 'bg-green-500 bg-opacity-10',
        borderColor: 'border-green-500',
        textColor: 'text-green-400'
      },
      'REJECTED': {
        icon: <ExclamationCircleIcon className="h-12 w-12 text-red-500" />,
        title: 'Pago Rechazado',
        bgColor: 'bg-red-500 bg-opacity-10',
        borderColor: 'border-red-500',
        textColor: 'text-red-400'
      },
      'CANCELED': {
        icon: <InformationCircleIcon className="h-12 w-12 text-yellow-500" />,
        title: 'Pago Cancelado',
        bgColor: 'bg-yellow-500 bg-opacity-10',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-400'
      },
      'PENDING': {
        icon: <InformationCircleIcon className="h-12 w-12 text-blue-500" />,
        title: 'Pago Pendiente',
        bgColor: 'bg-blue-500 bg-opacity-10',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-400'
      }
    };
    
    const config = statusConfig[transactionStatus];
    
    return (
      <div className={`p-6 ${config.bgColor} border ${config.borderColor} rounded-lg mb-4`}>
        <div className="flex flex-col items-center mb-4">
          {config.icon}
          <h3 className={`text-xl font-bold mt-2 ${config.textColor}`}>{config.title}</h3>
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-white"><span className="font-semibold">Producto:</span> {productName}</p>
          <p className="text-white"><span className="font-semibold">Cantidad:</span> {quantity}</p>
          <p className="text-white"><span className="font-semibold">Referencia:</span> {transactionDetails.reference}</p>
          <p className="text-white"><span className="font-semibold">Monto:</span> ${transactionDetails.amount} {transactionDetails.currency}</p>
          <p className="text-white"><span className="font-semibold">Fecha:</span> {transactionDetails.date}</p>
          {transactionStatus === 'APPROVED' && (
            <p className="text-white"><span className="font-semibold">Método de pago:</span> {transactionDetails.paymentMethod}</p>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          {transactionStatus === 'APPROVED' ? (
            <button
              onClick={handleClose}
              className="w-full py-3 px-4 rounded-lg font-bold transform transition-all duration-200 bg-[#08d9d6] hover:bg-[#07c2c0] text-white border-2 border-[#08d9d6] hover:scale-[1.02] shadow-lg"
            >
              Continuar
            </button>
          ) : (
            <>
              <button
                onClick={handleNewPayment}
                className="w-full py-3 px-4 rounded-lg font-bold transform transition-all duration-200 bg-[#ff2e63] hover:bg-[#e0264f] text-white border-2 border-[#08d9d6] hover:scale-[1.02] shadow-lg"
              >
                Intentar de nuevo
              </button>
              <button
                onClick={handleClose}
                className="w-full py-2 px-4 rounded-lg font-bold transform transition-all duration-200 bg-transparent hover:bg-[#252a34] text-white border border-[#252a34] hover:border-[#323a47]"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md p-6 mx-auto bg-[#1a1a2e] rounded-xl shadow-xl text-white">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        
        {/* Conditional rendering based on transaction status */}
        {transactionStatus ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-[#08d9d6]">Resultado de la Transacción</h2>
            {renderTransactionResult()}
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 text-[#08d9d6]">Pago Seguro</h2>
            
            {/* Simplified form to capture only email */}
            {showForm ? (
              <form onSubmit={handleFormSubmit} className="mb-4">
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm mb-1">Email:</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-2 rounded text-black"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Ingrese su correo electrónico"
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
                    className={`w-full py-3 px-4 rounded-lg font-bold transform transition-all duration-200 ${
                      isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#ff2e63] hover:bg-[#e0264f] hover:scale-[1.02] shadow-lg'
                    } text-white border-2 border-[#08d9d6]`}
                  >
                    {isLoading ? 'Procesando...' : 'Continuar al Pago'}
                  </button>
                </div>
              </form>
            ) : (
              // Show Wompi button after form submission
              <>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#08d9d6] mb-4"></div>
                    <p className="text-[#08d9d6]">Preparando el pago...</p>
                  </div>
                ) : (
                  // Render the Wompi button
                  renderWompiButton()
                )}
              </>
            )}
            
            <div className="mt-4 text-sm text-gray-400">
              <p className="flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#08d9d6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pago seguro con tarjeta de crédito
              </p>
              <p className="text-center text-xs">Todos los datos son procesados de forma segura</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
 
