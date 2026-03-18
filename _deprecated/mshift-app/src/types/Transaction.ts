// 거래 내역 타입 정의
export interface Transaction {
  id: string;
  date: string;
  displayDate: string;
  description: string;
  amount: number;
  displayAmount: string;
  balance: number;
  displayBalance: string;
  category: string;
  type: '입금' | '출금';
}

export interface AccountInfo {
  bankName: string;
  accountNumber: string;
  balance: string;
  currency: string;
}

export interface TransactionData {
  accountInfo: AccountInfo;
  transactions: Transaction[];
}