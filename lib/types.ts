export interface Category {
  id: number;
  name_al: string;
  name_en: string;
  slug: string;
  icon?: string;
}

export interface Product {
  id: number;
  name_al: string;
  name_en: string;
  description_al?: string;
  description_en?: string;
  price: number;
  category_id: number;
  category_slug?: string;
  category_name_al?: string;
  category_name_en?: string;
  slug: string;
  stock: number;
  images: string[];
  featured: boolean;
  rating: number;
  review_count: number;
  old_price?: number | null;
  is_new: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';
export type OrderSource = 'online' | 'in_store';

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  notes?: string;
  status: OrderStatus;
  source: OrderSource;
  total: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface ReportSummary {
  revenue_total: number;
  revenue_online: number;
  revenue_instore: number;
  orders_total: number;
  orders_online: number;
  orders_instore: number;
  items_sold: number;
  avg_order_value: number;
}

export interface ReportData {
  period: 'daily' | 'monthly' | 'yearly';
  date: string;
  label: string;
  summary: ReportSummary;
  series: { bucket: string; revenue: number; orders: number }[];
  top_products: { name: string; quantity: number; revenue: number }[];
  by_status: { status: string; count: number; revenue: number }[];
  by_source: { source: string; count: number; revenue: number }[];
  generated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number;
  product_name: string;
  product_slug?: string;
  quantity: number;
  price: number;
}

export type Language = 'al' | 'en';

export interface Stats {
  total_orders: number;
  total_revenue: number;
  orders_today: number;
  revenue_today: number;
  orders_this_week: number;
  revenue_this_week: number;
  pending_orders: number;
  low_stock_products: number;
  top_products: { name: string; quantity: number; revenue: number }[];
  orders_by_status: { status: string; count: number }[];
}
