/**
 * CSV 기반 정규식 규칙 엔진
 */
export class CsvRegexRuleEngine {
  private static instance: CsvRegexRuleEngine;
  private rules: RegexRule[] = [];
  private loaded: boolean = false;

  private constructor() {}

  public static getInstance(): CsvRegexRuleEngine {
    if (!CsvRegexRuleEngine.instance) {
      CsvRegexRuleEngine.instance = new CsvRegexRuleEngine();
    }
    return CsvRegexRuleEngine.instance;
  }

  async loadRules(): Promise<void> {
    // 기본 규칙들 로드
    this.rules = [
      {
        id: 1,
        pattern: 'GS25|CU|세븐일레븐|미니스톱',
        businessType: '편의점',
        confidence: 95,
        enabled: true,
      },
      {
        id: 2,
        pattern: '주유소|SK에너지|GS칼텍스|현대오일뱅크',
        businessType: '주유소',
        confidence: 90,
        enabled: true,
      },
      {
        id: 3,
        pattern: '카페|스타벅스|투썸플레이스|이디야',
        businessType: '카페',
        confidence: 85,
        enabled: true,
      },
    ];
    this.loaded = true;
  }

  matchPattern(text: string): RegexRuleMatch | null {
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      const regex = new RegExp(rule.pattern, 'i');
      if (regex.test(text)) {
        return {
          ruleId: rule.id,
          businessType: rule.businessType,
          confidence: rule.confidence,
          matchedPattern: rule.pattern,
        };
      }
    }
    return null;
  }

  getAllRules(): RegexRule[] {
    return this.rules;
  }

  getRuleById(id: number): RegexRule | undefined {
    return this.rules.find(rule => rule.id === id);
  }

  get isLoaded(): boolean {
    return this.loaded;
  }
}

export interface RegexRule {
  id: number;
  pattern: string;
  businessType: string;
  confidence: number;
  enabled: boolean;
}

export interface RegexRuleMatch {
  ruleId: number;
  businessType: string;
  confidence: number;
  matchedPattern: string;
}
