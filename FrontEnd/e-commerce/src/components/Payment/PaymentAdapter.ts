import { paymentService } from '../../services/paymentService';
import { AcceptanceTokensResponse, PaymentFormData } from '../../types/payment.types';

// Interfaz para la respuesta de procesamiento de pago
export interface PaymentProcessResult {
  success: boolean;
  transactionId?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  error?: string;
  details?: {
    amount?: number;
    currency?: string;
    reference?: string;
    date?: string;
    cardInfo?: string;
    cardType?: string;
    expDate?: string;
  };
}

/**
 * Adaptador para manejar la comunicación entre el formulario de pago
 * y los endpoints del backend
 */
export const PaymentAdapter = {
  /**
   * Procesa un pago con los datos del formulario
   * @param formData Datos del formulario de pago
   * @param productId ID del producto a comprar
   * @param quantity Cantidad de productos
   * @param acceptanceTerms Tokens de aceptación obtenidos previamente
   * @returns Resultado del procesamiento
   */
  processPayment: async (formData: PaymentFormData, productId?: string, quantity?: number, acceptanceTerms?: AcceptanceTokensResponse): Promise<PaymentProcessResult> => {
    let transactionId: string | undefined;
    
    try {
      // Verificar que se hayan proporcionado los tokens de aceptación
      if (!acceptanceTerms || !acceptanceTerms.acceptanceToken) {
        throw new Error('No se proporcionaron los términos de aceptación');
      }
      
      // 2. Crear la transacción pendiente en nuestro backend
      const transactionData = {
        id: productId || '',
        quantity: quantity || 1,
        userEmail: formData.email
      };
      
      const paymentConfig = await paymentService.createTransaction(transactionData);
      transactionId = paymentConfig.reference;
      if (!paymentConfig || !paymentConfig.publicToken || !paymentConfig.paymentToken) {
        throw new Error('Respuesta de transacción inválida del servidor: faltan tokens necesarios');
      }
      
      // 3. Tokenizar la tarjeta usando el public token obtenido de la transacción
      const tokenResponse = await paymentService.createCardToken(formData);
      
      if (tokenResponse.status !== 'CREATED' || !tokenResponse.data) {
        // Si la tokenización falla, cancelar la transacción
        if (transactionId) {
          await paymentService.updateTransaction(transactionId, {
            status: 'CANCELED',
            error_message: tokenResponse.error?.reason || 'Error en la tokenización de la tarjeta'
          });
        }
        
        return {
          success: false,
          transactionId,
          status: 'REJECTED',
          error: tokenResponse.error?.reason || 'La transacción fue rechazada. Por favor, intente con otra tarjeta.'
        };
      }
      
      // 4. Crear el pago con los datos obtenidos
      const paymentResponse = await paymentService.createPayment(formData, productId || '', tokenResponse, acceptanceTerms, paymentConfig);
      
      // 5. Devolver el resultado
      return {
        success: true,
        transactionId: paymentResponse.id,
        status: paymentResponse.status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED',
        details: {
          amount: paymentResponse.amount_in_cents / 100,
          currency: paymentResponse.currency,
          reference: paymentResponse.reference,
          date: new Date().toLocaleString(),
          cardInfo: `**** **** **** ${formData.cardNumber.slice(-4)}`,
          cardType: formData.cardType,
          expDate: tokenResponse.data.exp_month + '/' + tokenResponse.data.exp_year
        }
      };
    } catch (error: any) {
      console.error('Error al procesar el pago:', error);
      
      // Si ocurre un error en cualquier parte del proceso, cancelar la transacción si existe
      if (transactionId) {
        try {
          await paymentService.updateTransaction(transactionId, {
            status: 'CANCELED',
            error_message: error.message || 'Error durante el procesamiento del pago'
          });
        } catch (cancelError) {
          console.error('Error al cancelar la transacción fallida:', cancelError);
        }
      }
      
      return {
        success: false,
        transactionId,
        status: 'REJECTED',
        error: error.message || 'Ocurrió un error al procesar el pago. Por favor, inténtelo de nuevo.'
      };
    }
  },
  
  // La función updateFailedTransaction ha sido eliminada porque no se utilizaba en ninguna parte del código
  
  
  /**
   * Cancela una transacción en curso
   * @param transactionId ID de la transacción
   * @returns Resultado de la cancelación
   */
  cancelTransaction: async (transactionId: string): Promise<PaymentProcessResult> => {
    try {
      const result = await paymentService.updateTransaction(transactionId, {
        status: 'CANCELED'
      });
      
      return {
        success: false,
        transactionId,
        status: 'CANCELED'
      };
    } catch (error: any) {
      console.error('Error al cancelar la transacción:', error);
      
      return {
        success: false,
        transactionId,
        status: 'REJECTED',
        error: error.message || 'Error al cancelar la transacción'
      };
    }
  }
};

export default PaymentAdapter;