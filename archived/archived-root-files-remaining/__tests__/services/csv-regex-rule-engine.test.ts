import { CsvRegexRuleEngine } from '@/lib/services/csv-regex-rule-engine';
import fs from 'fs';
import path from 'path';

describe('CsvRegexRuleEngine 테스트', () => {
  let ruleEngine: CsvRegexRuleEngine;
  const testCsvPath = path.join(process.cwd(), 'data/test-regex-rules.csv');
  
  beforeEach(async () => {
    // 테스트용 CSV 파일 생성 - 실제 사용되는 모든 패턴 포함
    const testCsvContent = `pattern,category,confidence,description,normalizer_type,enabled
"GS25",편의점,0.95,"GS25 편의점 패턴",convenience_store,true
"(.+?)카센터",카센터,0.9,"카센터 키워드 패턴",car_center,true
"(GOOGLE|구글)",온라인서비스,0.95,"Google 온라인서비스 패턴",online_service,true
"(지에스칼텍스|에스케이엔크린)\(상\)주",주유소,0.98,"한글 표기 상행선 주유소 패턴",gas_station,true
"(.+?)\(상\)주",주유소,0.95,"상행선 주유소 패턴",gas_station,true
"(.+?)주유소",주유소,0.8,"일반 주유소 키워드 패턴",gas_station_generic,true
"테스트패턴",테스트,0.5,"비활성화된 패턴",test,false`;
    
    fs.writeFileSync(testCsvPath, testCsvContent);
    
    ruleEngine = new CsvRegexRuleEngine(testCsvPath);
    await ruleEngine.loadRules();
  });

  afterEach(() => {
    // 테스트 파일 정리
    if (fs.existsSync(testCsvPath)) {
      fs.unlinkSync(testCsvPath);
    }
  });

  describe('CSV 파일 로딩 및 파싱', () => {
    it('CSV 파일에서 규칙을 올바르게 로드해야 함', async () => {
      const rules = ruleEngine.getRules();
      
      // enabled=true인 규칙만 로드되어야 함 (6개)
      expect(rules).toHaveLength(6);
      
      // 규칙 구조 검증
      const gs25Rule = rules.find(r => r.pattern === 'GS25');
      expect(gs25Rule).toEqual({
        regex: expect.any(RegExp),
        category: '편의점',
        pattern: 'GS25',
        confidence: 0.95,
        description: 'GS25 편의점 패턴',
        normalizerType: 'convenience_store',
        normalizer: expect.any(Function)
      });
    });

    it('비활성화된 규칙은 로드하지 않아야 함', async () => {
      const rules = ruleEngine.getRules();
      const testRule = rules.find(r => r.pattern === '테스트패턴');
      
      expect(testRule).toBeUndefined();
    });

    it('잘못된 CSV 형식일 때 에러를 발생시켜야 함', async () => {
      const invalidCsvContent = `pattern,category,confidence
"GS25",편의점`; // 헤더와 데이터 불일치 (6개 vs 2개 컬럼)
      
      fs.writeFileSync(testCsvPath, invalidCsvContent);
      
      // 새로운 엔진 인스턴스로 테스트 (기존 규칙이 로드된 상태가 아님)
      const newEngine = new CsvRegexRuleEngine(testCsvPath);
      await expect(newEngine.loadRules()).rejects.toThrow();
    });

    it('존재하지 않는 파일 경로일 때 에러를 발생시켜야 함', async () => {
      const invalidEngine = new CsvRegexRuleEngine('/nonexistent/path.csv');
      
      await expect(invalidEngine.loadRules()).rejects.toThrow();
    });

    it('신뢰도가 범위를 벗어날 때 해당 규칙을 건너뛰어야 함', async () => {
      const invalidCsvContent = `pattern,category,confidence,description,normalizer_type,enabled
"GS25",편의점,0.95,"정상 규칙",convenience_store,true
"invalid_pattern",테스트,1.5,"잘못된 신뢰도",test,true
"GOOGLE",온라인서비스,0.9,"정상 규칙2",online_service,true`;
      
      fs.writeFileSync(testCsvPath, invalidCsvContent);
      
      // 새로운 엔진 인스턴스로 테스트
      const newEngine = new CsvRegexRuleEngine(testCsvPath);
      await newEngine.loadRules(); // 에러 없이 로드되어야 함
      
      const rules = newEngine.getRules();
      // 잘못된 규칙은 제외하고 정상 규칙 2개만 로드되어야 함
      expect(rules).toHaveLength(2);
      expect(rules.some(r => r.pattern === 'GS25')).toBe(true);
      expect(rules.some(r => r.pattern === 'GOOGLE')).toBe(true);
      expect(rules.some(r => r.pattern === 'invalid_pattern')).toBe(false);
    });
  });

  describe('패턴 매칭 기능', () => {
    it('CSV에서 로드된 패턴으로 매칭해야 함', () => {
      const result = ruleEngine.matchPattern('GS25강남역');
      
      expect(result).toEqual({
        matched: true,
        category: '편의점',
        pattern: 'GS25',
        confidence: 0.95,
        normalizedName: 'GS25',
        description: 'GS25 편의점 패턴'
      });
    });

    it('여러 패턴이 매칭될 때 높은 신뢰도를 우선해야 함', () => {
      // 주유소 패턴과 편의점 패턴이 모두 매칭될 수 있는 경우
      const result = ruleEngine.matchPattern('GS25주유소');
      
      // GS25 (편의점, 0.95)가 주유소 패턴(0.8)보다 우선되어야 함
      expect(result.category).toBe('편의점');
      expect(result.confidence).toBe(0.95);
    });

    it('매칭되지 않는 텍스트에 대해 올바른 결과를 반환해야 함', () => {
      const result = ruleEngine.matchPattern('매칭되지않는텍스트');
      
      expect(result).toEqual({
        matched: false,
        category: null,
        pattern: null,
        confidence: 0,
        normalizedName: null,
        description: null
      });
    });
  });

  describe('정규화 기능', () => {
    it('편의점 정규화가 올바르게 작동해야 함', () => {
      const result = ruleEngine.matchPattern('GS25이천하이');
      
      expect(result.normalizedName).toBe('GS25');
    });

    it('주유소 정규화가 올바르게 작동해야 함', () => {
      // 확실히 매칭되는 일반적인 패턴으로 테스트
      const result = ruleEngine.matchPattern('테스트주유소');
      
      expect(result.matched).toBe(true);
      expect(result.category).toBe('주유소');
      expect(result.normalizedName).toBe('테스트 주유소');
    });

    it('카센터 정규화가 올바르게 작동해야 함', () => {
      const result = ruleEngine.matchPattern('현대카센터강남');
      
      expect(result.normalizedName).toBe('현대 카센터');
    });

    it('온라인서비스 정규화가 올바르게 작동해야 함', () => {
      const result = ruleEngine.matchPattern('GOOGLE PLAY');
      
      expect(result.normalizedName).toBe('Google');
    });
  });

  describe('파일 변경 감지 및 리로드', () => {
    it('CSV 파일 변경 시 자동으로 규칙을 리로드해야 함', async () => {
      // 초기 상태 확인
      let result = ruleEngine.matchPattern('새로운패턴');
      expect(result.matched).toBe(false);

      // CSV 파일에 새 규칙 추가
      const updatedCsvContent = `pattern,category,confidence,description,normalizer_type,enabled
"GS25",편의점,0.95,"GS25 편의점 패턴",convenience_store,true
"(.+?)카센터",카센터,0.9,"카센터 키워드 패턴",car_center,true
"(GOOGLE|구글)",온라인서비스,0.95,"Google 온라인서비스 패턴",online_service,true
"(.+?)\(상\)주",주유소,0.95,"상행선 주유소 패턴",gas_station,true
"새로운패턴",새카테고리,0.8,"새로 추가된 패턴",test,true`;

      fs.writeFileSync(testCsvPath, updatedCsvContent);
      
      // 파일 변경 감지 시뮬레이션 (실제로는 파일 시스템 감시자가 처리)
      await ruleEngine.loadRules();

      // 새 패턴이 매칭되는지 확인
      result = ruleEngine.matchPattern('새로운패턴테스트');
      expect(result.matched).toBe(true);
      expect(result.category).toBe('새카테고리');
    });

    it('잘못된 형식으로 파일을 변경했을 때 기존 규칙을 유지해야 함', async () => {
      // 초기 상태에서 매칭되는지 확인
      let result = ruleEngine.matchPattern('GS25강남역');
      expect(result.matched).toBe(true);

      // 잘못된 형식으로 파일 변경
      const invalidCsvContent = `잘못된,CSV,형식`;
      fs.writeFileSync(testCsvPath, invalidCsvContent);

      // 에러가 발생하지만 기존 규칙은 유지되어야 함
      try {
        await ruleEngine.loadRules();
      } catch (error) {
        // 에러 발생 예상
      }

      // 기존 규칙이 여전히 작동하는지 확인
      result = ruleEngine.matchPattern('GS25강남역');
      expect(result.matched).toBe(true);
    });
  });

  describe('성능 테스트', () => {
    it('CSV 규칙 로딩이 1초 미만이어야 함', async () => {
      const startTime = Date.now();
      await ruleEngine.loadRules();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('1000건 패턴 매칭이 100ms 미만이어야 함', () => {
      const testTexts = Array.from({ length: 1000 }, (_, i) => 
        `GS25테스트${i}`
      );

      const startTime = Date.now();
      
      testTexts.forEach(text => {
        ruleEngine.matchPattern(text);
      });
      
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('동시 패턴 매칭 안정성 테스트', async () => {
              // 테스트용 CSV에 확실히 매칭되는 패턴들만 사용
        const testTexts = [
          'GS25',           // 편의점 (확실히 매칭)
          '현대카센터',     // 카센터 (확실히 매칭)
          'GOOGLE'          // 온라인서비스 (확실히 매칭)
        ];

              // 각 텍스트를 여러 번씩 테스트
        const simultaneousRequests = Array.from({ length: 30 }, (_, i) => 
          new Promise<any>(resolve => {
            const text = testTexts[i % testTexts.length];
            // 약간의 지연으로 실제 비동기 상황 시뮬레이션
            setTimeout(() => {
              resolve(ruleEngine.matchPattern(text));
            }, Math.random() * 10);
          })
        );

      const results = await Promise.all(simultaneousRequests);

      // 모든 결과가 올바르게 매칭되어야 함
      results.forEach((result, index) => {
        const originalText = testTexts[index % testTexts.length];
        
        expect(result.matched).toBe(true);
        expect(result.confidence).toBeGreaterThan(0);
        expect(typeof result.category).toBe('string');
        
        // 각 텍스트별로 예상 카테고리 검증
        if (originalText.includes('GS25')) {
          expect(result.category).toBe('편의점');
        } else if (originalText.includes('카센터')) {
          expect(result.category).toBe('카센터');
        } else if (originalText.includes('GOOGLE')) {
          expect(result.category).toBe('온라인서비스');
        }
      });
    });
  });

  describe('규칙 통계 및 정보', () => {
    it('로드된 규칙 통계를 제공해야 함', () => {
      const stats = ruleEngine.getStats();
      
      expect(stats).toEqual({
        totalRules: 6,
        enabledRules: 6,
        disabledRules: 0,
        categoryCounts: {
          '편의점': 1,
          '카센터': 1,
          '온라인서비스': 1,
          '주유소': 3  // 한글 상행선, 일반 상행선, 일반 주유소 패턴
        },
        averageConfidence: expect.any(Number),
        lastLoadTime: expect.any(Date)
      });
    });

    it('특정 카테고리의 규칙만 조회할 수 있어야 함', () => {
      const convenienceRules = ruleEngine.getRulesByCategory('편의점');
      
      expect(convenienceRules).toHaveLength(1);
      expect(convenienceRules[0].category).toBe('편의점');
    });

    it('규칙 검색 기능이 작동해야 함', () => {
      const foundRules = ruleEngine.searchRules('GS25');
      
      expect(foundRules).toHaveLength(1);
      expect(foundRules[0].pattern).toBe('GS25');
    });
  });

  describe('에러 처리 및 검증', () => {
    it('빈 문자열이나 null 입력에 대해 적절히 처리해야 함', () => {
      const testCases = ['', '   ', null, undefined];

      testCases.forEach(input => {
        const result = ruleEngine.matchPattern(input as any);
        expect(result).toEqual({
          matched: false,
          category: null,
          pattern: null,
          confidence: 0,
          normalizedName: null,
          description: null
        });
      });
    });

    it('잘못된 정규식 패턴이 있을 때 해당 규칙을 건너뛰어야 함', async () => {
      const invalidRegexCsv = `pattern,category,confidence,description,normalizer_type,enabled
"[invalid regex",편의점,0.95,"잘못된 정규식",convenience_store,true
"GS25",편의점,0.95,"올바른 패턴",convenience_store,true`;
      
      fs.writeFileSync(testCsvPath, invalidRegexCsv);
      
      // 에러가 발생하지 않고 올바른 규칙만 로드되어야 함
      await ruleEngine.loadRules();
      
      const rules = ruleEngine.getRules();
      expect(rules).toHaveLength(1); // 올바른 규칙 1개만
      expect(rules[0].pattern).toBe('GS25');
    });
  });
}); 