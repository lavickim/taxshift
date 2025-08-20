import { TransactionData } from '../types/Transaction';
import { apiCall, API_CONFIG } from '../config/api';

class TransactionService {
  private static instance: TransactionService;
  private transactionData: TransactionData | null = null;

  private constructor() {}

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  public async loadTransactionData(): Promise<TransactionData> {
    try {
      console.log('Loading transaction data from API...');
      
      // API에서 거래 데이터 로드
      const response = await apiCall(API_CONFIG.ENDPOINTS.TRANSACTIONS_BANK_A);
      
      if (response.ok) {
        const data = await response.json();
        this.transactionData = data;
        console.log('Transaction data loaded successfully from API.');
        console.log('Account info:', data.accountInfo);
        console.log('Transactions count:', data.transactions?.length || 0);
        return data;
      } else {
        console.error('Failed to load transaction data from API:', response.status, response.statusText);
        throw new Error(`API call failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to load transaction data from API:', error);
      
      // API 실패 시에도 에러를 던져서 UI에서 에러 처리하도록 함
      throw error;
    }
  }

  public async refreshData(): Promise<TransactionData> {
    this.transactionData = null;
    return await this.loadTransactionData();
  }

  public getTransactionData(): TransactionData | null {
    return this.transactionData;
  }
}

export default TransactionService;