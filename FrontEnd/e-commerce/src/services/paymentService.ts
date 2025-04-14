import axios from 'axios';
import { AcceptanceTokensResponse, CreatePaymentResponse, PaymentCardTokenRequest, PaymentCardTokenResponse, PaymentConfig, PaymentFormData, TransactionData, TransactionResponse, UpdateTransactionStatusRequest } from '../types/payment.types';

// Crear una instancia de axios con la URL base del backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instancia para la pasarela de pago externa
const apiPaymentGateway = axios.create({
  baseURL: import.meta.env.VITE_PAYMENT_GATEWAY_URL || 'https://api-sandbox.payment-gateway.dev/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
// Servicio para manejar operaciones de pago
export const paymentService = {
  createPayment: async (formData: PaymentFormData, productId: string, cardData: PaymentCardTokenResponse, acceptanseTems: AcceptanceTokensResponse, paymentConfig: PaymentConfig): Promise<CreatePaymentResponse> => {
    try {
      // Formatear los datos según el DTO del backend
      const paymentData = {
        reference: paymentConfig.reference, 
        expiration_time: paymentConfig.expirationDate,
        acceptance_token: acceptanseTems.acceptanceToken,
        amount_in_cents: paymentConfig.amount,
        currency: "COP",
        customer_email: formData.email, 
        payment_method:{
          type: 'CARD',
          token: cardData.data?.id,
          installments: formData.installments,
        },
        customer_data: {
          phone_number: formData.phoneNumber,
          full_name: formData.fullName,
          legal_id: formData.identification,
          legal_id_type: 'CC' 
        },
        shipping_address: {
          address_line_1: formData.address,
          address_line_2: formData.address,
          country: formData.country,
          region: formData.region,
          city: formData.city,
          name: formData.fullName,
          phone_number: formData.phoneNumber,
          postal_code: formData.postalCode
        }
      };
      
      // Enviar solicitud al endpoint /payments/ para crear la transacción y obtener el public token
      const response = await api.post<CreatePaymentResponse>('/payments/create', paymentData);
      
      return response.data;
    } catch (error) {
      console.error('Error al crear el pago:', error);
      throw error;
    }
  },
  
  // Tokenizar tarjeta con la pasarela de pago
  createCardToken: async (formData: PaymentFormData): Promise<PaymentCardTokenResponse> => {
    try {
      // Extraer mes y año de expiración
      const [exp_month, exp_year] = formData.cardExpiry.split('/');
      
      // Obtener el publicToken almacenado que se obtuvo del endpoint /payments/
      const publicToken = localStorage.getItem('paymentPublicToken');
      
      if (!publicToken) {
        throw new Error('No se encontró el token público para la transacción. Por favor, inicie el proceso de pago nuevamente.');
      }
      
      // Preparar datos para tokenización
      const cardData: PaymentCardTokenRequest = {
        number: formData.cardNumber.replace(/\s+/g, ''),
        cvc: formData.cardCVC,
        exp_month, // Mes de expiración
        exp_year,  // Año de expiración
        card_holder: formData.fullName // Nombre del titular de la tarjeta
      };
      
      // Configurar headers con el token obtenido del backend
      const headers = {
        'Authorization': `Bearer ${publicToken}`
      };
      
      // Enviar solicitud a la pasarela de pago
      const response = await apiPaymentGateway.post<PaymentCardTokenResponse>('/tokens/cards', cardData, {
        headers
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al tokenizar la tarjeta:', error);
      throw error;
    }
  },
  
  // Actualizar estado de una transacción
  updateTransaction: async (transactionId: string, updateData: UpdateTransactionStatusRequest): Promise<any> => {
    try {
     
      const paymentJWT = localStorage.getItem('paymentJWT');
      
      // Configurar headers con el JWT específico para la transacción
      const headers: Record<string, string> = {};
      
      if (paymentJWT) {
        headers['Authorization'] = `Bearer ${paymentJWT}`;
      } else {
        console.warn('No se encontró el token JWT para la transacción');
      }
      
      // Enviar solicitud al endpoint /payments/update para actualizar la transacción
      const response = await api.post(`/transactions/${transactionId}/status`, {
        status: updateData.status,
      }, { headers });
      
      // Limpiar los tokens después de usarlos
      localStorage.removeItem('paymentJWT');
      localStorage.removeItem('paymentPublicToken');
      
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la transacción:', error);
      throw error;
    }
  },

  createTransaction: async (formData: TransactionData): Promise<PaymentConfig> => {
    try {
      const response = await api.post<{ paymentConfig: PaymentConfig }>('/payments', formData);
      const { paymentConfig } = response.data;
  
      localStorage.setItem('paymentJWT', paymentConfig.paymentToken || '');
      localStorage.setItem('paymentPublicToken', paymentConfig.publicToken || '');
  
      return paymentConfig;
    } catch (error) {
      console.error('Error al crear la transacción:', error);
      throw error;
    }
  },

  getAcceptanceTerms: async (): Promise<AcceptanceTokensResponse> => {
    try {
      const response = await api.get<AcceptanceTokensResponse>('/acceptanceTokens');
      return response.data;
    } catch (error) {
      console.error('Error al obtener los términos de aceptación:', error);
      throw error;
    }
  }
};

export default paymentService;