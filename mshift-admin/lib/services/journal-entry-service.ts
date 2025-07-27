/**
 * Phase 4: 복식부기 분개 관리 클라이언트 서비스
 * 백엔드 API를 호출하여 분개 생성, 승인, 전기 프로세스를 처리합니다.
 * 비즈니스 로직은 모두 백엔드로 이전되었습니다.
 */

export interface JournalEntryRequest {
  companyId: string;
  entryDate: string;
  description: string;
  debitAccountCode: string;
  creditAccountCode: string;
  amount: number;
}

export interface JournalEntryLine {
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
}

export interface JournalEntry {
  id: number;
  companyId: string;
  entryDate: string;
  description: string;
  totalDebitAmount: number;
  totalCreditAmount: number;
  status: 'DRAFT' | 'APPROVED' | 'POSTED';
  details?: JournalEntryDetail[];
}

export interface JournalEntryDetail {
  id: number;
  lineNumber: number;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
}

export class JournalEntryService {
  private readonly baseUrl = '/api/v2/accounting';

  /**
   * 거래에서 분개 자동 생성 (백엔드 API 호출)
   */
  async createJournalEntryFromTransaction(transactionId: number): Promise<{
    success: boolean;
    journalEntry?: JournalEntry;
    message?: string;
  }> {
    const response = await fetch(
      `${this.baseUrl}/journal-entries/from-transaction`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      }
    );

    return await response.json();
  }

  /**
   * 분개 생성 (백엔드 API 호출)
   */
  async createJournalEntry(request: JournalEntryRequest): Promise<{
    success: boolean;
    journalEntry?: JournalEntry;
    message?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/journal-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    return await response.json();
  }

  /**
   * 분개 승인 처리 (백엔드 API 호출)
   */
  async approveJournalEntry(journalEntryId: number): Promise<{
    success: boolean;
    journalEntry?: JournalEntry;
    message?: string;
  }> {
    const response = await fetch(
      `${this.baseUrl}/journal-entries/${journalEntryId}/approve`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return await response.json();
  }

  /**
   * 분개를 총계정원장에 전기 (백엔드 API 호출)
   */
  async postJournalEntryToGL(
    journalEntryId: number
  ): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(
      `${this.baseUrl}/journal-entries/${journalEntryId}/post`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return await response.json();
  }

  /**
   * 분개 목록 조회 (백엔드 API 호출)
   */
  async getJournalEntries(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
    companyId?: string;
  }): Promise<{ journalEntries: JournalEntry[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(
      `${this.baseUrl}/journal-entries?${queryParams}`
    );
    return await response.json();
  }

  /**
   * 분개 상세 조회 (백엔드 API 호출)
   */
  async getJournalEntry(journalEntryId: number): Promise<JournalEntry> {
    const response = await fetch(
      `${this.baseUrl}/journal-entries/${journalEntryId}`
    );
    return await response.json();
  }

  /**
   * 복합 분개 생성 (백엔드 API 호출)
   */
  async createComplexJournalEntry(
    companyId: string,
    entryDate: string,
    description: string,
    lines: JournalEntryLine[]
  ): Promise<{
    success: boolean;
    journalEntry?: JournalEntry;
    message?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/journal-entries/complex`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, entryDate, description, lines }),
    });

    return await response.json();
  }

  /**
   * 분개 감사 추적 조회 (백엔드 API 호출)
   */
  async getJournalEntryAuditTrail(
    journalEntryId: number
  ): Promise<{ auditTrail: any[] }> {
    const response = await fetch(
      `${this.baseUrl}/journal-entries/${journalEntryId}/audit`
    );
    return await response.json();
  }
}

export const journalEntryService = new JournalEntryService();
