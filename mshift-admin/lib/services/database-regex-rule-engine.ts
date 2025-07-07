interface RegexRule {
  id: number;
  pattern: string;
  replacement?: string;
  description: string;
  category: string;
  enabled: boolean;
  priority: number;
  confidence?: number;
  normalizer_type?: string;
  created_at: string;
  updated_at: string;
}

interface RuleMatchResponse {
  matched: boolean;
  processedText: string;
  matchedRules: MatchedRule[];
  originalText: string;
}

interface MatchedRule {
  ruleId: number;
  pattern: string;
  replacement?: string;
  description: string;
  category: string;
  priority: number;
  matchedText: string;
  startIndex: number;
  endIndex: number;
}

export class DatabaseRegexRuleEngine {
  private static instance: DatabaseRegexRuleEngine;
  private apiBaseUrl: string;

  private constructor() {
    this.apiBaseUrl = process.env.JAVA_API_BASE_URL || 'http://localhost:8080/api';
  }

  public static getInstance(): DatabaseRegexRuleEngine {
    if (!DatabaseRegexRuleEngine.instance) {
      DatabaseRegexRuleEngine.instance = new DatabaseRegexRuleEngine();
    }
    return DatabaseRegexRuleEngine.instance;
  }

  /**
   * 모든 활성 규칙 조회
   */
  async getAllRules(): Promise<RegexRule[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/rule-engine/rules`);
      if (!response.ok) {
        throw new Error(`Failed to fetch rules: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching rules:', error);
      throw error;
    }
  }

  /**
   * 카테고리별 규칙 조회
   */
  async getRulesByCategory(category: string): Promise<RegexRule[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/rule-engine/rules/category/${category}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch rules by category: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching rules by category:', error);
      throw error;
    }
  }

  /**
   * 텍스트 매칭
   */
  async matchText(inputText: string, category?: string, returnAllMatches: boolean = false): Promise<RuleMatchResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/rule-engine/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputText,
          category,
          returnAllMatches,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to match text: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error matching text:', error);
      throw error;
    }
  }

  /**
   * 새 규칙 생성
   */
  async createRule(rule: Omit<RegexRule, 'id' | 'created_at' | 'updated_at'>): Promise<RegexRule> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
      });

      if (!response.ok) {
        throw new Error(`Failed to create rule: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating rule:', error);
      throw error;
    }
  }

  /**
   * 규칙 업데이트
   */
  async updateRule(id: number, rule: Partial<RegexRule>): Promise<RegexRule> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
      });

      if (!response.ok) {
        throw new Error(`Failed to update rule: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating rule:', error);
      throw error;
    }
  }

  /**
   * 규칙 삭제
   */
  async deleteRule(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/rules/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete rule: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      throw error;
    }
  }

  /**
   * 규칙 활성화
   */
  async enableRule(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/rules/${id}/enable`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Failed to enable rule: ${response.status}`);
      }
    } catch (error) {
      console.error('Error enabling rule:', error);
      throw error;
    }
  }

  /**
   * 규칙 비활성화
   */
  async disableRule(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/rules/${id}/disable`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Failed to disable rule: ${response.status}`);
      }
    } catch (error) {
      console.error('Error disabling rule:', error);
      throw error;
    }
  }

  /**
   * 캐시 새로고침
   */
  async refreshCache(): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/rule-engine/refresh-cache`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh cache: ${response.status}`);
      }
    } catch (error) {
      console.error('Error refreshing cache:', error);
      throw error;
    }
  }

  /**
   * 통계 정보 조회
   */
  async getStatistics(): Promise<{
    totalRules: number;
    activeRules: number;
    categoryCounts: Record<string, number>;
    averageConfidence: number;
  }> {
    try {
      const rules = await this.getAllRules();
      
      const totalRules = rules.length;
      const activeRules = rules.filter(rule => rule.enabled).length;
      
      const categoryCounts = rules.reduce((acc, rule) => {
        acc[rule.category] = (acc[rule.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const totalConfidence = rules.reduce((sum, rule) => sum + (rule.confidence || 0), 0);
      const averageConfidence = totalRules > 0 ? totalConfidence / totalRules : 0;
      
      return {
        totalRules,
        activeRules,
        categoryCounts,
        averageConfidence,
      };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      throw error;
    }
  }
}

export default DatabaseRegexRuleEngine;