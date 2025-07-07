/**
 * 정규식 규칙 엔진
 * Layer 1 - 패턴 매칭을 통한 거래 분류 시스템
 * 95% 룰엔진 시스템의 핵심 구성 요소
 */

export interface MatchResult {
  matched: boolean;
  category: string | null;
  pattern: string | null;
  confidence: number;
  normalizedName: string | null;
}

export interface PatternRule {
  regex: RegExp;
  category: string;
  pattern: string;
  confidence: number;
  normalizer: (match: RegExpMatchArray, input: string) => string;
}

export class RegexRuleEngine {
  private rules: PatternRule[] = [];

  constructor() {
    this.initializeRules();
  }

  /**
   * 패턴 매칭을 수행하고 결과를 반환합니다.
   * @param input 입력 텍스트
   * @returns 매칭 결과
   */
  public matchPattern(input: string | null | undefined): MatchResult {
    // 빈 문자열이나 null 처리
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return {
        matched: false,
        category: null,
        pattern: null,
        confidence: 0,
        normalizedName: null
      };
    }

    const cleanInput = input.trim();
    let bestMatch: MatchResult = {
      matched: false,
      category: null,
      pattern: null,
      confidence: 0,
      normalizedName: null
    };

    // 모든 규칙에 대해 매칭 테스트
    for (const rule of this.rules) {
      const match = cleanInput.match(rule.regex);
      if (match) {
        // 현재 매치가 더 높은 신뢰도를 가지면 업데이트
        if (rule.confidence > bestMatch.confidence) {
          bestMatch = {
            matched: true,
            category: rule.category,
            pattern: rule.pattern,
            confidence: rule.confidence,
            normalizedName: rule.normalizer(match, cleanInput)
          };
        }
      }
    }

    return bestMatch;
  }

  /**
   * 패턴 규칙들을 초기화합니다.
   */
  private initializeRules(): void {
    // 주유소 패턴 규칙들 (높은 신뢰도부터)
    this.addGasStationRules();
    
    // 편의점 패턴 규칙들
    this.addConvenienceStoreRules();
    
    // 카센터 패턴 규칙들
    this.addCarCenterRules();
    
    // 온라인 서비스 패턴 규칙들
    this.addOnlineServiceRules();
  }

  /**
   * 주유소 패턴 규칙들을 추가합니다.
   */
  private addGasStationRules(): void {
    // (상)주 패턴 - 최고 신뢰도
    this.rules.push({
      regex: /(.+?)\(상\)주/i,
      category: '주유소',
      pattern: '(상)주',
      confidence: 0.95,
      normalizer: (match, _input) => this.normalizeGasStationName(match[1])
    });

    // (하)주 패턴 - 최고 신뢰도
    this.rules.push({
      regex: /(.+?)\(하\)주/i,
      category: '주유소',
      pattern: '(하)주',
      confidence: 0.95,
      normalizer: (match, _input) => this.normalizeGasStationName(match[1])
    });

    // 셀프 주유소 패턴
    this.rules.push({
      regex: /(GS칼텍스|SK엔크린|에쓰오일|현대오일뱅크|S-?OIL)셀프/i,
      category: '주유소',
      pattern: 'self_service',
      confidence: 0.9,
      normalizer: (match, _input) => this.normalizeGasStationName(match[1]) + ' 셀프'
    });

    // 주유소 브랜드명 패턴 (셀프가 아닌 경우만)
    this.rules.push({
      regex: /(GS칼텍스|SK엔크린|에쓰오일|현대오일뱅크|S-?OIL)(?!셀프)/i,
      category: '주유소',
      pattern: 'brand_name',
      confidence: 0.85,
      normalizer: (match, _input) => this.normalizeGasStationName(match[1])
    });

    // 일반 주유소 키워드 패턴
    this.rules.push({
      regex: /(.+?)주유소/i,
      category: '주유소',
      pattern: 'generic_gas_station',
      confidence: 0.8,
      normalizer: (match, _input) => this.normalizeGasStationName(match[1]) + ' 주유소'
    });
  }

  /**
   * 편의점 패턴 규칙들을 추가합니다.
   */
  private addConvenienceStoreRules(): void {
    // GS25 패턴
    this.rules.push({
      regex: /GS25/i,
      category: '편의점',
      pattern: 'GS25',
      confidence: 0.95,
      normalizer: (_match, _input) => 'GS25'
    });

    // CU 패턴
    this.rules.push({
      regex: /\bCU\b/i,
      category: '편의점',
      pattern: 'CU',
      confidence: 0.95,
      normalizer: (_match, _input) => 'CU'
    });

    // 세븐일레븐 패턴 (다양한 표기법)
    this.rules.push({
      regex: /(세븐일레븐|7-?ELEVEN|7일레븐|세븐이레븐|SEVEN\s*ELEVEN)/i,
      category: '편의점',
      pattern: '세븐일레븐',
      confidence: 0.95,
      normalizer: (_match, _input) => '세븐일레븐'
    });

    // 이마트24 패턴
    this.rules.push({
      regex: /(이마트24|EMART24)/i,
      category: '편의점',
      pattern: '이마트24',
      confidence: 0.95,
      normalizer: (_match, _input) => '이마트24'
    });

    // 미니스톱 패턴
    this.rules.push({
      regex: /(미니스톱|MINISTOP)/i,
      category: '편의점',
      pattern: '미니스톱',
      confidence: 0.95,
      normalizer: (_match, _input) => '미니스톱'
    });
  }

  /**
   * 카센터 패턴 규칙들을 추가합니다.
   */
  private addCarCenterRules(): void {
    // 카센터 키워드
    this.rules.push({
      regex: /(.+?)카센터/i,
      category: '카센터',
      pattern: '카센터',
      confidence: 0.9,
      normalizer: (match, _input) => this.normalizeCarCenterName(match[1]) + ' 카센터'
    });

    // 자동차 서비스 센터
    this.rules.push({
      regex: /(현대|기아|벤츠|BMW|아우디|볼보)(?:자동차)?(?:서비스센터|서비스|정비)/i,
      category: '카센터',
      pattern: '자동차서비스',
      confidence: 0.88,
      normalizer: (match, _input) => match[1] + ' 서비스센터'
    });

    // 정비소 키워드
    this.rules.push({
      regex: /(.+?)정비소/i,
      category: '카센터',
      pattern: '정비소',
      confidence: 0.85,
      normalizer: (match, _input) => this.normalizeCarCenterName(match[1]) + ' 정비소'
    });
  }

  /**
   * 온라인 서비스 패턴 규칙들을 추가합니다.
   */
  private addOnlineServiceRules(): void {
    // GODADDY 패턴
    this.rules.push({
      regex: /(GODADDY|고대디)/i,
      category: '온라인서비스',
      pattern: 'GODADDY',
      confidence: 0.95,
      normalizer: (_match, _input) => 'GoDaddy'
    });

    // Google 패턴
    this.rules.push({
      regex: /(GOOGLE|구글)/i,
      category: '온라인서비스',
      pattern: 'GOOGLE',
      confidence: 0.95,
      normalizer: (_match, _input) => 'Google'
    });

    // Amazon 패턴
    this.rules.push({
      regex: /(AMAZON|아마존|AWS)/i,
      category: '온라인서비스',
      pattern: 'AMAZON',
      confidence: 0.95,
      normalizer: (_match, _input) => 'Amazon'
    });

    // Microsoft 패턴
    this.rules.push({
      regex: /(MICROSOFT|마이크로소프트|MSFT)/i,
      category: '온라인서비스',
      pattern: 'MICROSOFT',
      confidence: 0.95,
      normalizer: (_match, _input) => 'Microsoft'
    });
  }

  /**
   * 주유소명을 정규화합니다.
   */
  private normalizeGasStationName(name: string): string {
    const normalized = name.trim()
      .replace(/\s+/g, '') // 공백 제거
      .replace(/지에스/i, 'GS')
      .replace(/에쓰오일/i, 'S-OIL')
      .replace(/에스오일/i, 'S-OIL');

    // 브랜드명 매핑
    const brandMap: Record<string, string> = {
      'GS칼텍스': 'GS칼텍스',
      'SK엔크린': 'SK엔크린',
      'S-OIL': 'S-OIL',
      '현대오일뱅크': '현대오일뱅크',
      '칼텍스': 'GS칼텍스'
    };

    for (const [key, value] of Object.entries(brandMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }

    return normalized;
  }

  /**
   * 카센터명을 정규화합니다.
   */
  private normalizeCarCenterName(name: string): string {
    return name.trim()
      .replace(/\s+/g, '') // 공백 제거
      .replace(/\(.*?\)/g, ''); // 괄호 내용 제거
  }
} 