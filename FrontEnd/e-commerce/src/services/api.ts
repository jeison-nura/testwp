import axios from 'axios';
import { Product } from '../types/product.types';
import { PaymentRequest, PaymentResponse, PaymentCardTokenRequest, PaymentCardTokenResponse } from '../types/payment.types';

// Crear una instancia de axios con la URL base del backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000', // URL del backend desde variables de entorno
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiPaymentGateway = axios.create({
  baseURL: import.meta.env.VITE_PAYMENT_GATEWAY_URL || 'https://api-sandbox.payment-gateway.dev/v1', // URL de la pasarela de pago desde variables de entorno
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_PAYMENT_GATEWAY_PUBLIC_KEY}`, // Clave pública para autenticación
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

export default api;
export { apiPaymentGateway };