import axios from 'axios';
import { Product } from '../types/product.types';

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

export default api;