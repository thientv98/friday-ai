export type CategoryId = string;

export type TransactionType = 'EXPENSE' | 'INCOME';

export interface Category {
  id: CategoryId;
  name: string;
  color: string;
  icon: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: CategoryId;
  createdAt: number; // timestamp
  source: 'voice' | 'manual';
  type: TransactionType;
}

export interface ParsedExpense {
  title: string;
  amount: number;
  categoryId: CategoryId;
  type: TransactionType;
}

// Web Speech API Types
export interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}