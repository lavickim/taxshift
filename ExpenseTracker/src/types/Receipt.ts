export interface Receipt {
  id: string;
  userId: string;
  imageUri: string;
  amount: number;
  merchantName: string;
  category: string;
  date: Date;
  items: ReceiptItem[];
  ocrConfidence: number;
  rawOcrText: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  receiptId?: string;
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  date: Date;
  type: 'income' | 'expense';
  paymentMethod: string;
  location?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  isPremium: boolean;
  createdAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  currency: string;
  language: string;
  notifications: boolean;
  autoCategory: boolean;
  dataSharing: boolean;
}