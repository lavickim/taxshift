import fs from 'fs';
import path from 'path';

export interface CsvPatternRule {
  regex: RegExp;
  category: string;
  pattern: string;
  confidence: number;
  description: string;
  normalizerType: string;
  normalizer?: (text: string) => string;
}

export interface MatchResult {
  matched: boolean;
  category: string | null;
  pattern: string | null;
  confidence: number;
  normalizedName: string | null;
  description: string | null;
}

export interface RuleStats {
  totalRules: number;
  enabledRules: number;
  disabledRules: number;
  categoryCounts: Record<string, number>;
  averageConfidence: number;
  lastLoadTime: Date;
}

interface CsvRuleRow {
  pattern: string;
  category: string;
  confidence: string;
  description: string;
  normalizer_type: string;
  enabled: string;
}

export class CsvRegexRuleEngine {
  private static instance: CsvRegexRuleEngine;
  private rules: CsvPatternRule[] = [];
  private csvFilePath: string;
  private lastLoadTime: Date = new Date();
  private originalRules: CsvPatternRule[] = []; // 파일 로딩 실패 시 백업용

  private constructor(csvFilePath: string) {
    this.csvFilePath = csvFilePath;
  }

  public static getInstance(): CsvRegexRuleEngine {
    if (!CsvRegexRuleEngine.instance) {
      const csvPath = path.join(process.cwd(), 'data', 'regex-rules.csv');
      CsvRegexRuleEngine.instance = new CsvRegexRuleEngine(csvPath);
    }
    return CsvRegexRuleEngine.instance;
  }

  /**
   * CSV 파일에서 규칙을 로드합니다
   */
  async loadRules(): Promise<void> {
    try {
      if (!fs.existsSync(this.csvFilePath)) {
        throw new Error(`CSV file not found: ${this.csvFilePath}`);
      }

      const csvContent = fs.readFileSync(this.csvFilePath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least header and one data row');
      }

      const headers = this.parseCsvLine(lines[0]);
      const expectedHeaders = ['pattern', 'category', 'confidence', 'description', 'normalizer_type', 'enabled'];
      
      if (!this.validateHeaders(headers, expectedHeaders)) {
        throw new Error(`Invalid CSV headers. Expected: ${expectedHeaders.join(', ')}`);
      }

      const newRules: CsvPatternRule[] = [];
      let hasValidData = false;
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCsvLine(lines[i]);
          
          if (values.length !== headers.length) {
            throw new Error(`Row ${i + 1}: column count mismatch (expected ${headers.length}, got ${values.length})`);
          }

          const row = this.createRowObject(headers, values);
          hasValidData = true;
          
          // enabled가 false인 경우 건너뛰기
          if (row.enabled.toLowerCase() !== 'true') {
            continue;
          }

          const rule = this.createPatternRule(row);
          if (rule) {
            newRules.push(rule);
          }
          // 잘못된 규칙은 건너뛰기 (로그만 출력)
        } catch (error) {
          // 데이터 형식 오류는 전체 로딩 실패로 처리
          if (error instanceof Error) {
            throw new Error(`Failed to parse CSV row ${i + 1}: ${error.message}`);
          }
          throw new Error(`Failed to parse CSV row ${i + 1}: ${error}`);
        }
      }

      if (!hasValidData) {
        throw new Error('No valid data rows found in CSV file');
      }

      // 성공적으로 로드된 경우에만 기존 규칙을 교체
      this.originalRules = [...this.rules]; // 백업 생성
      this.rules = newRules;
      this.lastLoadTime = new Date();
      
      console.log(`Successfully loaded ${newRules.length} rules from ${this.csvFilePath}`);
      
    } catch (error) {
      console.error('Failed to load CSV rules:', error);
      
      // 기존 규칙이 없는 경우에만 에러를 던짐 (처음 로딩 시)
      if (this.rules.length === 0 && this.originalRules.length === 0) {
        throw error;
      }
      
      // 기존 규칙 복원 (파일 변경으로 인한 오류 시)
      if (this.originalRules.length > 0) {
        console.log('Reverting to previous rules due to loading error');
        this.rules = [...this.originalRules];
      }
    }
  }

  /**
   * 텍스트와 매칭되는 패턴을 찾습니다
   */
  matchPattern(text: string): MatchResult {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return this.createEmptyResult();
    }

    const cleanText = text.trim();
    let bestMatch: CsvPatternRule | null = null;
    let bestConfidence = 0;

    // 모든 규칙을 순회하며 가장 높은 신뢰도의 매칭을 찾음
    for (const rule of this.rules) {
      try {
        if (rule.regex.test(cleanText)) {
          if (rule.confidence > bestConfidence) {
            bestMatch = rule;
            bestConfidence = rule.confidence;
          }
        }
      } catch (error) {
        console.warn(`Error testing pattern "${rule.pattern}":`, error);
        continue;
      }
    }

    if (!bestMatch) {
      return this.createEmptyResult();
    }

    const normalizedName = bestMatch.normalizer 
      ? bestMatch.normalizer(cleanText)
      : cleanText;

    return {
      matched: true,
      category: bestMatch.category,
      pattern: bestMatch.pattern,
      confidence: bestMatch.confidence,
      normalizedName,
      description: bestMatch.description
    };
  }

  /**
   * 로드된 모든 규칙을 반환합니다
   */
  getRules(): CsvPatternRule[] {
    return [...this.rules];
  }

  /**
   * 특정 카테고리의 규칙들을 반환합니다
   */
  getRulesByCategory(category: string): CsvPatternRule[] {
    return this.rules.filter(rule => rule.category === category);
  }

  /**
   * 패턴이나 설명에서 키워드를 검색합니다
   */
  searchRules(keyword: string): CsvPatternRule[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.rules.filter(rule => 
      rule.pattern.toLowerCase().includes(lowerKeyword) ||
      rule.description.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * 규칙이 로드되었는지 확인합니다
   */
  isLoaded(): boolean {
    return this.rules.length > 0;
  }

  /**
   * 규칙 통계를 반환합니다
   */
  getStats(): RuleStats {
    const categoryCounts: Record<string, number> = {};
    let totalConfidence = 0;

    this.rules.forEach(rule => {
      categoryCounts[rule.category] = (categoryCounts[rule.category] || 0) + 1;
      totalConfidence += rule.confidence;
    });

    return {
      totalRules: this.rules.length,
      enabledRules: this.rules.length,
      disabledRules: 0, // CSV에서 enabled=false인 것들은 로드하지 않으므로
      categoryCounts,
      averageConfidence: this.rules.length > 0 ? totalConfidence / this.rules.length : 0,
      lastLoadTime: this.lastLoadTime
    };
  }

  /**
   * CSV 라인을 파싱합니다 (간단한 CSV 파서)
   */
  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // 이스케이프된 따옴표
          current += '"';
          i += 2;
        } else {
          // 따옴표 시작/끝
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // 필드 구분자
        values.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // 마지막 필드 추가
    values.push(current.trim());

    return values;
  }

  /**
   * CSV 헤더 검증
   */
  private validateHeaders(headers: string[], expected: string[]): boolean {
    if (headers.length !== expected.length) {
      return false;
    }

    return expected.every(expectedHeader => 
      headers.some(header => header.toLowerCase() === expectedHeader.toLowerCase())
    );
  }

  /**
   * CSV 행을 객체로 변환
   */
  private createRowObject(headers: string[], values: string[]): CsvRuleRow {
    const row: any = {};
    
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().replace(/\s+/g, '_');
      row[normalizedHeader] = values[index] || '';
    });

    return row as CsvRuleRow;
  }

  /**
   * CSV 행에서 PatternRule 생성
   */
  private createPatternRule(row: CsvRuleRow): CsvPatternRule | null {
    try {
      const confidence = parseFloat(row.confidence);
      
      if (isNaN(confidence) || confidence < 0 || confidence > 1) {
        throw new Error('Confidence must be between 0 and 1');
      }

      // 정규식 컴파일 테스트
      const regex = new RegExp(row.pattern, 'i');
      
      const rule: CsvPatternRule = {
        regex,
        category: row.category,
        pattern: row.pattern,
        confidence,
        description: row.description,
        normalizerType: row.normalizer_type
      };

      // 정규화 함수 할당
      rule.normalizer = this.getNormalizer(row.normalizer_type);

      return rule;
      
    } catch (error) {
      console.warn(`Invalid pattern rule: ${row.pattern}`, error);
      return null;
    }
  }

  /**
   * 정규화 타입에 따른 정규화 함수 반환
   */
  private getNormalizer(type: string): (text: string) => string {
    switch (type) {
      case 'gas_station':
        return this.normalizeGasStation.bind(this);
      case 'gas_station_self':
        return this.normalizeGasStationSelf.bind(this);
      case 'gas_station_generic':
        return this.normalizeGasStationGeneric.bind(this);
      case 'convenience_store':
        return this.normalizeConvenienceStore.bind(this);
      case 'car_center':
        return this.normalizeCarCenter.bind(this);
      case 'car_center_service':
        return this.normalizeCarCenterService.bind(this);
      case 'car_center_garage':
        return this.normalizeCarCenterGarage.bind(this);
      case 'online_service':
        return this.normalizeOnlineService.bind(this);
      default:
        return (text: string) => text;
    }
  }

  /**
   * 정규화 함수들
   */
  private normalizeGasStation(text: string): string {
    const match = text.match(/(.+?)\((상|하)\)주/);
    if (match) {
      return this.normalizeBrandName(match[1]);
    }
    return this.normalizeBrandName(text);
  }

  private normalizeGasStationSelf(text: string): string {
    const match = text.match(/(GS칼텍스|SK엔크린|에쓰오일|현대오일뱅크|S-?OIL)셀프/i);
    if (match) {
      return `${this.normalizeBrandName(match[1])} 셀프`;
    }
    return this.normalizeBrandName(text);
  }

  private normalizeGasStationGeneric(text: string): string {
    const match = text.match(/(.+?)주유소/);
    if (match) {
      return `${this.normalizeBrandName(match[1])} 주유소`;
    }
    return this.normalizeBrandName(text);
  }

  private normalizeConvenienceStore(text: string): string {
    if (text.includes('GS25')) return 'GS25';
    if (text.match(/\bCU\b/)) return 'CU';
    if (text.match(/(세븐일레븐|7-?ELEVEN|7일레븐|세븐이레븐|SEVEN\s*ELEVEN)/i)) return '세븐일레븐';
    if (text.match(/(이마트24|EMART24)/i)) return '이마트24';
    if (text.match(/(미니스톱|MINISTOP)/i)) return '미니스톱';
    return text;
  }

  private normalizeCarCenter(text: string): string {
    const match = text.match(/(.+?)카센터/);
    if (match) {
      return `${match[1].trim()} 카센터`;
    }
    return text;
  }

  private normalizeCarCenterService(text: string): string {
    const match = text.match(/(현대|기아|벤츠|BMW|아우디|볼보)(?:자동차)?(?:서비스센터|서비스|정비)/i);
    if (match) {
      return `${match[1]} 서비스센터`;
    }
    return text;
  }

  private normalizeCarCenterGarage(text: string): string {
    const match = text.match(/(.+?)정비소/);
    if (match) {
      return `${match[1].trim()} 정비소`;
    }
    return text;
  }

  private normalizeOnlineService(text: string): string {
    if (text.match(/(GODADDY|고대디)/i)) return 'GoDaddy';
    if (text.match(/(GOOGLE|구글)/i)) return 'Google';
    if (text.match(/(AMAZON|아마존|AWS)/i)) return 'Amazon';
    if (text.match(/(MICROSOFT|마이크로소프트|MSFT)/i)) return 'Microsoft';
    return text;
  }

  private normalizeBrandName(text: string): string {
    const brandMap: Record<string, string> = {
      '지에스칼텍스': 'GS칼텍스',
      'GS칼텍스': 'GS칼텍스',
      '에스케이엔크린': 'SK엔크린',
      'SK엔크린': 'SK엔크린',
      '에쓰오일': 'S-OIL',
      'S-OIL': 'S-OIL',
      'SOIL': 'S-OIL',
      '현대오일뱅크': '현대오일뱅크'
    };

    const normalized = brandMap[text] || text;
    return normalized.trim();
  }

  private createEmptyResult(): MatchResult {
    return {
      matched: false,
      category: null,
      pattern: null,
      confidence: 0,
      normalizedName: null,
      description: null
    };
  }
} 