export interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  rating: number;
  stock: number;
  image_url: string;
}

export interface Category {
  category_id: number;
  name: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: number;
  user_id: number;
  name: string;
  address: string;
  phone: string;
}

export interface Order {
  id: number;
  customer_id: number;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}