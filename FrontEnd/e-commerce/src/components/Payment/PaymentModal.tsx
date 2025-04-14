import React, { useState, useEffect } from 'react';
import { XMarkIcon, XCircleIcon } from '@heroicons/react/24/outline';
import PaymentForm from './PaymentForm';
import TransactionResult from './TransactionResult';
import PaymentAdapter, { PaymentProcessResult } from './PaymentAdapter';
import { AcceptanceTokensResponse, PaymentFormData } from '../../types/payment.types';
import { paymentService } from '../../services/paymentService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quantity: number;
  productId: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  quantity,
  productId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<PaymentProcessResult | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED' | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  
  // Datos del formulario para usar en el resultado de la transacción
  const [formData, setFormData] = useState<PaymentFormData | null>(null);
  
  // Estado para almacenar los tokens de aceptación
  const [acceptanceTokens, setAcceptanceTokens] = useState<AcceptanceTokensResponse>({
    acceptanceToken: '',
    endUserAcceptanceToken: '',
    endUserTermsUrl: '#',
    endUserTermsType: '',
    personalDataAcceptanceToken: '',
    personalDataTermsUrl: '#',
    personalDataTermsType: '',
    termsAndConditionsUrl: '#'
  });
  
  // Function to process payment using the adapter
  const processPayment = async (paymentFormData: PaymentFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setFormData(paymentFormData);
      
      // Mostrar el spinner por al menos 1 segundo para mejor experiencia de usuario
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Procesar el pago usando el adaptador y pasando los tokens de aceptación
      const result = await PaymentAdapter.processPayment(paymentFormData, productId, quantity, {
        acceptanceToken: acceptanceTokens.acceptanceToken,
        endUserAcceptanceToken: acceptanceTokens.endUserAcceptanceToken,
        endUserTermsUrl: acceptanceTokens.endUserTermsUrl,
        endUserTermsType: acceptanceTokens.endUserTermsType,
        personalDataAcceptanceToken: acceptanceTokens.personalDataAcceptanceToken,
        personalDataTermsUrl: acceptanceTokens.personalDataTermsUrl,
        personalDataTermsType: acceptanceTokens.personalDataTermsType,
        termsAndConditionsUrl: acceptanceTokens.termsAndConditionsUrl
      });
      
      setTransaction(result);
      setTransactionStatus(result.status || 'REJECTED');
      
      if (result.success && result.details) {
        setTransactionDetails({
          id: result.transactionId || '',
          amount: result.details.amount?.toString() || '0',
          currency: result.details.currency || 'COP',
          reference: result.details.reference || '',
          date: result.details.date || new Date().toLocaleString(),
          cardInfo: result.details.cardInfo || '',
          cardType: result.details.cardType || 'unknown'
        });
      } else {
        setError(result.error || 'Ocurrió un error al procesar el pago');
      }
      
    } catch (e: any) {
      console.error('Error al procesar el pago:', e);
      setError(e.message || 'Ocurrió un error al procesar el pago. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to cancel the transaction
  const cancelTransaction = async (transactionId: string) => {
    try {
      await PaymentAdapter.cancelTransaction(transactionId);
      console.log('Transacción cancelada exitosamente:', transactionId);
    } catch (error) {
      console.error('Error al cancelar la transacción:', error);
    }
  };

  // Cargar los términos y condiciones cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const fetchAcceptanceTerms = async () => {
        try {
          const response = await paymentService.getAcceptanceTerms();
          setAcceptanceTokens({
            acceptanceToken: response.acceptanceToken,
            endUserAcceptanceToken: response.endUserAcceptanceToken,
            endUserTermsUrl: response.endUserTermsUrl,
            endUserTermsType: response.endUserTermsType,
            personalDataAcceptanceToken: response.personalDataAcceptanceToken,
            personalDataTermsUrl: response.personalDataTermsUrl,
            personalDataTermsType: response.personalDataTermsType,
            termsAndConditionsUrl: response.termsAndConditionsUrl
          });
        } catch (error) {
          console.error('Error al obtener los términos de aceptación:', error);
          setError('No se pudieron cargar los términos y condiciones. Por favor, inténtelo de nuevo.');
        }
      };
      
      fetchAcceptanceTerms();
    }
  }, [isOpen]);

  // We also need to handle closing the modal
  const handleClose = () => {
    // If there's an ongoing transaction that hasn't been completed, cancel it
    if (transaction && transaction.transactionId && 
        (transactionStatus === 'PENDING' || !transactionStatus)) {
      cancelTransaction(transaction.transactionId);
    }
    
    // Reset state for next time the modal is opened
    resetForm();
    onClose();
  };
  
  // Function to reset the form and start a new payment
  const resetForm = () => {
    setFormData(null);
    setTransactionStatus(null);
    setTransactionDetails(null);
    setTransaction(null);
    setError(null);
    setIsLoading(false);
  };
  
  const handleNewPayment = () => {
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto py-10"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md p-6 mx-auto bg-[#1a1a2e] rounded-xl shadow-xl text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        
        {/* Conditional rendering based on transaction status */}
        {transactionStatus && transactionDetails && formData ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-[#08d9d6]">Resultado de la Transacción</h2>
            <TransactionResult 
              status={transactionStatus}
              details={transactionDetails}
              productId={productId}
              quantity={quantity}
              fullName={formData.fullName}
              email={formData.email}
              onContinue={handleClose}
              onRetry={handleNewPayment}
              onCancel={handleClose}
            />
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 text-[#08d9d6]">Datos de Pago</h2>
            
            {isLoading && (
              <div className="flex flex-col items-center justify-center my-4 py-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#08d9d6] mb-4"></div>
                <p className="text-[#08d9d6] font-medium">Procesando pago...</p>
              </div>
            )}
            
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center my-6 py-6">
                <XCircleIcon className="h-16 w-16 text-red-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Ha fallado el pago</h3>
                <p className="text-gray-400 text-center mb-6">Por favor, inténtalo más tarde.</p>
                <button
                  onClick={handleClose}
                  className="w-full bg-[#08d9d6] hover:bg-[#06b6b3] text-[#1a1a2e] font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Cerrar
                </button>
              </div>
            )}
            
            {!isLoading && !error && (
              <PaymentForm 
                onSubmit={processPayment}
                isLoading={isLoading}
                error={error}
                acceptanceTokens={acceptanceTokens}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
 
