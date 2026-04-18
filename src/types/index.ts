export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;          // Maps to UUID
  user_id: string;     // Maps to UUID
  amount: number;      // Maps to NUMERIC
  type: TransactionType;
  category: string;
  description: string | null; // Can be empty
  date: string;        // We'll treat the DATE as a string in JS
  created_at: string;
}