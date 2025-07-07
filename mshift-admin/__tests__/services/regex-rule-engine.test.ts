import { RegexRuleEngine } from '@/lib/services/regex-rule-engine';

describe('RegexRuleEngine 테스트', () => {
  let regexEngine: RegexRuleEngine;

  beforeEach(() => {
    regexEngine = new RegexRuleEngine();
  });

  describe('주유소 패턴 매칭 테스트', () => {
    it('(상)주 패턴을 주유소로 인식해야 함', () => {
      const testCases = [
        '지에스칼텍스(상)주',
        'SK엔크린(상)주',
        '에쓰오일(상)주',
        'GS칼텍스(상)주',
        '현대오일뱅크(상)주'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '주유소',
          pattern: '(상)주',
          confidence: 0.95,
          normalizedName: expect.any(String)
        });
      });
    });

    it('(하)주 패턴을 주유소로 인식해야 함', () => {
      const testCases = [
        '지에스칼텍스(하)주',
        'SK엔크린(하)주',
        '에쓰오일(하)주',
        'GS칼텍스(하)주',
        '현대오일뱅크(하)주'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '주유소',
          pattern: '(하)주',
          confidence: 0.95,
          normalizedName: expect.any(String)
        });
      });
    });

    it('주유소 브랜드명만으로도 인식해야 함', () => {
      const testCases = [
        { text: 'GS칼텍스석계', expected: 'GS칼텍스' },
        { text: 'SK엔크린강남', expected: 'SK엔크린' },
        { text: '에쓰오일신림', expected: 'S-OIL' }, // 정규화됨
        { text: '현대오일뱅크판교', expected: '현대오일뱅크' },
        { text: 'S-OIL동대문', expected: 'S-OIL' }
      ];

      testCases.forEach(({ text, expected }) => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '주유소',
          pattern: 'brand_name',
          confidence: 0.85,
          normalizedName: expected
        });
      });
    });

    it('셀프 주유소 패턴을 인식해야 함', () => {
      const testCases = [
        'GS칼텍스셀프석계',
        'SK엔크린셀프강남',
        '에쓰오일셀프신림',
        '현대오일뱅크셀프판교'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '주유소',
          pattern: 'self_service',
          confidence: 0.9,
          normalizedName: expect.stringContaining('셀프')
        });
      });
    });

    it('주유소가 아닌 텍스트는 매칭되지 않아야 함', () => {
      const testCases = [
        '스타벅스커피',
        '맥도날드햄버거',
        '이마트24편의점',
        '현대카드결제',
        '삼성전자제품'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        // 주유소가 아닌 경우 matched: false이거나 category가 주유소가 아니어야 함
        if (result.matched) {
          expect(result.category).not.toBe('주유소');
        } else {
          expect(result.matched).toBe(false);
        }
      });
    });

    it('주유소 패턴의 신뢰도가 올바르게 계산되어야 함', () => {
      const testCases = [
        { text: 'GS칼텍스(상)주', expectedConfidence: 0.95 },
        { text: 'SK엔크린셀프강남', expectedConfidence: 0.9 },
        { text: 'GS칼텍스석계', expectedConfidence: 0.85 },
        { text: '칼텍스주유소', expectedConfidence: 0.8 }
      ];

      testCases.forEach(({ text, expectedConfidence }) => {
        const result = regexEngine.matchPattern(text);
        expect(result.matched).toBe(true);
        expect(result.category).toBe('주유소');
        expect(result.confidence).toBe(expectedConfidence);
      });
    });

    it('정규화된 주유소명이 올바르게 생성되어야 함', () => {
      const testCases = [
        { text: '지에스칼텍스(상)주석계', expected: 'GS칼텍스' },
        { text: 'SK엔크린(하)주강남', expected: 'SK엔크린' },
        { text: '에쓰오일셀프신림', expected: 'S-OIL 셀프' }, // 셀프 포함
        { text: '현대오일뱅크판교', expected: '현대오일뱅크' }
      ];

      testCases.forEach(({ text, expected }) => {
        const result = regexEngine.matchPattern(text);
        expect(result.matched).toBe(true);
        expect(result.category).toBe('주유소');
        expect(result.normalizedName).toBe(expected);
      });
    });

    it('대소문자 및 띄어쓰기 변형을 처리해야 함', () => {
      const testCases = [
        'gs칼텍스(상)주',
        'Gs 칼텍스 (상)주',
        'GS 칼 텍 스(상)주',
        'sk엔크린(하)주',
        'SK 엔크린(하)주'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result.matched).toBe(true);
        expect(result.category).toBe('주유소');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('주유소 성능 테스트 (1000건 < 100ms)', () => {
      const testTexts = Array.from({ length: 1000 }, (_, i) => 
        `GS칼텍스(상)주테스트${i}`
      );

      const startTime = Date.now();
      
      testTexts.forEach(text => {
        regexEngine.matchPattern(text);
      });
      
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('동시 주유소 패턴 매칭 안정성 테스트', async () => {
      const testTexts = [
        'GS칼텍스(상)주석계',
        'SK엔크린(하)주강남', 
        '에쓰오일셀프신림',
        '현대오일뱅크판교',
        'S-OIL동대문'
      ];

      // 50개의 동시 요청 생성
      const simultaneousRequests = Array.from({ length: 50 }, (_, i) => 
        Promise.resolve(regexEngine.matchPattern(testTexts[i % testTexts.length]))
      );

      const results = await Promise.all(simultaneousRequests);

      // 모든 결과가 주유소로 매칭되어야 함
      results.forEach(result => {
        expect(result.matched).toBe(true);
        expect(result.category).toBe('주유소');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });
  });

  describe('편의점 패턴 매칭 테스트', () => {
    it('GS25 패턴을 편의점으로 인식해야 함', () => {
      const testCases = [
        'GS25이천하이',
        'GS25강남역',
        'GS25신림',
        'gs25판교',
        'Gs25석계'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '편의점',
          pattern: 'GS25',
          confidence: 0.95,
          normalizedName: 'GS25'
        });
      });
    });

    it('CU 패턴을 편의점으로 인식해야 함', () => {
      const testCases = [
        'CU이천하이',
        'CU강남역',
        'cu신림',
        'Cu판교',
        'CU석계'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '편의점',
          pattern: 'CU',
          confidence: 0.95,
          normalizedName: 'CU'
        });
      });
    });

    it('세븐일레븐 패턴을 편의점으로 인식해야 함', () => {
      const testCases = [
        '세븐일레븐이천하이',
        '7-ELEVEN강남역',
        '7일레븐신림',
        '세븐이레븐판교',
        'SEVEN ELEVEN석계'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '편의점',
          pattern: '세븐일레븐',
          confidence: 0.95,
          normalizedName: '세븐일레븐'
        });
      });
    });

    it('이마트24 패턴을 편의점으로 인식해야 함', () => {
      const testCases = [
        '이마트24이천하이',
        'EMART24강남역',
        '이마트24신림',
        'emart24판교'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '편의점',
          pattern: '이마트24',
          confidence: 0.95,
          normalizedName: '이마트24'
        });
      });
    });

    it('미니스톱 패턴을 편의점으로 인식해야 함', () => {
      const testCases = [
        '미니스톱이천하이',
        'MINISTOP강남역',
        '미니스톱신림',
        'ministop판교'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '편의점',
          pattern: '미니스톱',
          confidence: 0.95,
          normalizedName: '미니스톱'
        });
      });
    });
  });

  describe('카센터 패턴 매칭 테스트', () => {
    it('카센터 키워드를 포함한 텍스트를 인식해야 함', () => {
      const testCases = [
        '박광업(대림카센터)',
        '현대카센터강남',
        '기아카센터신림',
        '벤츠카센터판교',
        'BMW카센터석계'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '카센터',
          pattern: '카센터',
          confidence: 0.9,
          normalizedName: expect.stringContaining('카센터')
        });
      });
    });

    it('정비소 키워드를 포함한 텍스트를 인식해야 함', () => {
      const testCases = [
        '현대정비소강남',
        '기아정비소신림',
        '삼성정비소판교'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        
        // 현대, 기아는 자동차서비스 패턴으로 더 높은 신뢰도로 매칭됨
        if (text.includes('현대') || text.includes('기아')) {
          expect(result).toEqual({
            matched: true,
            category: '카센터',
            pattern: '자동차서비스',
            confidence: 0.88,
            normalizedName: expect.stringContaining('서비스센터')
          });
        } else {
          expect(result).toEqual({
            matched: true,
            category: '카센터',
            pattern: '정비소',
            confidence: 0.85,
            normalizedName: expect.stringContaining('정비소')
          });
        }
      });
    });

    it('자동차 관련 키워드를 인식해야 함', () => {
      const testCases = [
        '현대자동차서비스센터',
        '기아자동차정비',
        '벤츠서비스센터',
        'BMW서비스센터'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '카센터',
          pattern: '자동차서비스',
          confidence: 0.88,
          normalizedName: expect.any(String)
        });
      });
    });
  });

  describe('온라인 서비스 패턴 매칭 테스트', () => {
    it('GODADDY 패턴을 온라인서비스로 인식해야 함', () => {
      const testCases = [
        'GODADDY.COM',
        'godaddy payment',
        'GoDaddy Inc',
        '고대디결제'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '온라인서비스',
          pattern: 'GODADDY',
          confidence: 0.95,
          normalizedName: 'GoDaddy'
        });
      });
    });

    it('구글 관련 패턴을 온라인서비스로 인식해야 함', () => {
      const testCases = [
        'GOOGLE PLAY',
        'Google Pay',
        '구글결제',
        'GOOGLE SERVICES'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '온라인서비스',
          pattern: 'GOOGLE',
          confidence: 0.95,
          normalizedName: 'Google'
        });
      });
    });

    it('아마존 관련 패턴을 온라인서비스로 인식해야 함', () => {
      const testCases = [
        'AMAZON.COM',
        'Amazon Prime',
        '아마존결제',
        'AWS AMAZON'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '온라인서비스',
          pattern: 'AMAZON',
          confidence: 0.95,
          normalizedName: 'Amazon'
        });
      });
    });

    it('마이크로소프트 관련 패턴을 온라인서비스로 인식해야 함', () => {
      const testCases = [
        'MICROSOFT OFFICE',
        'Microsoft Store',
        '마이크로소프트결제',
        'MSFT AZURE'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: true,
          category: '온라인서비스',
          pattern: 'MICROSOFT',
          confidence: 0.95,
          normalizedName: 'Microsoft'
        });
      });
    });
  });

  describe('패턴 우선순위 및 통합 테스트', () => {
    it('여러 패턴이 매칭될 때 높은 신뢰도를 우선해야 함', () => {
      // GS25는 편의점(0.95), 하지만 GS가 주유소 브랜드이기도 함
      const result = regexEngine.matchPattern('GS25이천하이');
      
      expect(result.matched).toBe(true);
      expect(result.category).toBe('편의점'); // 더 높은 신뢰도
      expect(result.confidence).toBe(0.95);
    });

    it('매칭되지 않는 텍스트에 대해 올바른 결과를 반환해야 함', () => {
      const testCases = [
        '일반음식점',
        '병원진료',
        '학교등록금',
        '보험료납부'
      ];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text);
        expect(result).toEqual({
          matched: false,
          category: null,
          pattern: null,
          confidence: 0,
          normalizedName: null
        });
      });
    });

    it('빈 문자열이나 null 입력에 대해 적절히 처리해야 함', () => {
      const testCases = ['', '   ', null, undefined];

      testCases.forEach(text => {
        const result = regexEngine.matchPattern(text as any);
        expect(result).toEqual({
          matched: false,
          category: null,
          pattern: null,
          confidence: 0,
          normalizedName: null
        });
      });
    });

    it('전체 패턴 매칭 성능이 요구사항을 만족해야 함', () => {
      const testTexts = [
        'GS칼텍스(상)주석계',
        'GS25이천하이',
        '박광업(대림카센터)',
        'GODADDY.COM',
        'SK엔크린(하)주강남',
        'CU강남역',
        '현대카센터신림',
        'GOOGLE PLAY'
      ];

      // 1000번 반복 테스트
      const repeatCount = 1000;
      const startTime = Date.now();

      for (let i = 0; i < repeatCount; i++) {
        const text = testTexts[i % testTexts.length];
        regexEngine.matchPattern(text);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 1000건 처리가 200ms 미만이어야 함
      expect(totalTime).toBeLessThan(200);

      // 평균 응답시간이 0.2ms 미만이어야 함
      const averageTime = totalTime / repeatCount;
      expect(averageTime).toBeLessThan(0.2);
    });
  });
}); 