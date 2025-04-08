export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

export interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
}