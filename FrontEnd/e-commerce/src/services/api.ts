import axios from 'axios';
import { Product } from '../types/product.types';
import { PaymentRequest, PaymentResponse} from '../types/payment.types';

// Crear una instancia de axios con la URL base del backend
const api = axios.create({
  baseURL: 'http://localhost:3000', // Puerto del backend según el archivo .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// Servicios para productos
export const productService = {
  // Obtener todos los productos
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>('/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Obtener un producto por ID
  getById: async (id: string): Promise<Product> => {
    try {
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw error;
    }
  },
};

// In the paymentService object

// Servicios para pagos
export const paymentService = {
  // Crear una transacción de pago
  createTransaction: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    try {
      const response = await api.post<PaymentResponse>('/payments', paymentData);
      
      // Store the payment token when we receive the transaction
      if (response.data.paymentConfig && response.data.paymentConfig.paymentToken) {
        localStorage.setItem('paymentToken', response.data.paymentConfig.paymentToken);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }
  },
  
  updateTransactionStatus: async (
      transactionId: string, 
      status: 'APPROVED' | 'CANCELED' | 'REJECTED',
      additionalData?: any
    ): Promise<any> => {
      try {
        const paymentToken = localStorage.getItem('paymentToken') || '';
        // Ensure transactionId is a string
        const payload = {
          status,
          ...(additionalData || {})
        };
        
        const response = await api.post(
          `/transactions/${transactionId}/status`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${paymentToken}`
            }
          }
        );
        
        localStorage.removeItem('paymentToken');
        
        return response.data;
      } catch (error) {
        console.error('Error updating transaction status:', error);
        throw error;
      }
    },
  
  // Helper method to clear payment token when no longer needed
  clearPaymentToken: () => {
    localStorage.removeItem('paymentToken');
  }
};

export default api;