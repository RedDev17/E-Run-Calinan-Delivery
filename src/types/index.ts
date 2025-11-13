export interface Variation {
  id: string;
  name: string;
  price: number;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  image?: string;
  popular?: boolean;
  available?: boolean;
  variations?: Variation[];
  addOns?: AddOn[];
  // Discount pricing fields
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  discountActive?: boolean;
  // Computed effective price (calculated in the app)
  effectivePrice?: number;
  isOnDiscount?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedVariation?: Variation;
  selectedAddOns?: AddOn[];
  totalPrice: number;
}

export interface OrderData {
  items: CartItem[];
  customerName: string;
  contactNumber: string;
  serviceType: 'delivery'; // Only delivery is supported
  address: string; // Required for delivery
  paymentMethod: 'gcash' | 'maya' | 'bank-transfer';
  referenceNumber?: string;
  total: number;
  notes?: string;
  landmark?: string;
}

export type PaymentMethod = 'gcash' | 'maya' | 'bank-transfer';
export type ServiceType = 'delivery'; // Only delivery is supported

// Site Settings Types
export interface SiteSetting {
  id: string;
  value: string;
  type: 'text' | 'image' | 'boolean' | 'number';
  description?: string;
  updated_at: string;
}

export interface SiteSettings {
  site_name: string;
  site_logo: string;
  site_description: string;
  currency: string;
  currency_code: string;
}

// Restaurant Types
export interface Restaurant {
  id: string;
  name: string;
  type: 'Restaurant' | 'Cafe' | 'Fast Food' | 'Bakery' | 'Desserts';
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string; // e.g., "30-45 mins", "45-60 mins"
  deliveryFee: number; // e.g., 0
  description?: string;
  logo?: string;
  active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Restaurant Menu Item (different from general MenuItem)
export interface RestaurantMenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  image?: string;
  popular?: boolean;
  available?: boolean;
  variations?: Variation[];
  addOns?: AddOn[];
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  discountActive?: boolean;
  effectivePrice?: number;
  isOnDiscount?: boolean;
}