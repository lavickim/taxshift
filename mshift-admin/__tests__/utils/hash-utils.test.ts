import { generateHash, normalizeText } from '@/lib/utils/hash-utils';

describe('hash-utils', () => {
  describe('generateHash', () => {
    it('문자열을 64자리 소문자 16진수 해시로 변환해야 함', () => {
      const input = 'test string';
      const result = generateHash(input);

      expect(result).toHaveLength(64);
      expect(result).toMatch(/^[a-f0-9]{64}$/);
      expect(typeof result).toBe('string');
    });

    it('동일한 입력에 대해 항상 동일한 해시를 생성해야 함', () => {
      const input = '박광업 (대림카센터)';
      const hash1 = generateHash(input);
      const hash2 = generateHash(input);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('서로 다른 입력에 대해 서로 다른 해시를 생성해야 함', () => {
      const input1 = '지에스25이천하이';
      const input2 = '세븐일레븐 충주기업';

      const hash1 = generateHash(input1);
      const hash2 = generateHash(input2);

      expect(hash1).not.toBe(hash2);
      expect(hash1).toHaveLength(64);
      expect(hash2).toHaveLength(64);
    });

    it('빈 문자열을 처리할 수 있어야 함', () => {
      const result = generateHash('');

      expect(result).toHaveLength(64);
      expect(result).toMatch(/^[a-f0-9]{64}$/);
      expect(result).toBe(
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      ); // 빈 문자열의 SHA256
    });

    it('null과 undefined를 적절히 처리해야 함', () => {
      expect(() => generateHash(null as any)).toThrow(
        'Input text cannot be null or undefined'
      );
      expect(() => generateHash(undefined as any)).toThrow(
        'Input text cannot be null or undefined'
      );
    });

    it('한국어 문자열을 올바르게 처리해야 함', () => {
      const koreanText = '(주)부자 충주(상)주';
      const result = generateHash(koreanText);

      expect(result).toHaveLength(64);
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    it('특수 문자와 숫자가 포함된 문자열을 처리해야 함', () => {
      const specialText = 'DNH*GODADDY#32131232131123';
      const result = generateHash(specialText);

      expect(result).toHaveLength(64);
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    it('공백이 포함된 문자열을 처리해야 함', () => {
      const textWithSpaces = '  건강보험료   ';
      const result = generateHash(textWithSpaces);

      expect(result).toHaveLength(64);
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    it('아주 긴 문자열을 처리할 수 있어야 함', () => {
      const longText = 'a'.repeat(10000);
      const result = generateHash(longText);

      expect(result).toHaveLength(64);
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    it('성능 요구사항을 만족해야 함 (1000건 < 50ms)', () => {
      const testTexts = Array.from(
        { length: 1000 },
        (_, i) => `test string ${i}`
      );

      const startTime = Date.now();
      testTexts.forEach(text => generateHash(text));
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50);
    });
  });

  describe('normalizeText', () => {
    it('앞뒤 공백을 제거해야 함', () => {
      const input = '  박광업 (대림카센터)  ';
      const result = normalizeText(input);

      expect(result).toBe('박광업 (대림카센터)');
    });

    it('중간의 여러 공백을 하나로 통일해야 함', () => {
      const input = '박광업     (대림카센터)';
      const result = normalizeText(input);

      expect(result).toBe('박광업 (대림카센터)');
    });

    it('탭과 줄바꿈을 공백으로 변환해야 함', () => {
      const input = '박광업\t(대림카센터)\n추가정보';
      const result = normalizeText(input);

      expect(result).toBe('박광업 (대림카센터) 추가정보');
    });

    it('대소문자를 소문자로 통일해야 함', () => {
      const input = 'GS25 STORE';
      const result = normalizeText(input);

      expect(result).toBe('gs25 store');
    });

    it('한글과 영문이 혼합된 텍스트를 처리해야 함', () => {
      const input = '  GS25  이천하이  STORE  ';
      const result = normalizeText(input);

      expect(result).toBe('gs25 이천하이 store');
    });

    it('특수문자를 유지해야 함', () => {
      const input = 'DNH*GODADDY#123';
      const result = normalizeText(input);

      expect(result).toBe('dnh*godaddy#123');
    });

    it('빈 문자열을 처리해야 함', () => {
      expect(normalizeText('')).toBe('');
      expect(normalizeText('   ')).toBe('');
    });

    it('null과 undefined를 적절히 처리해야 함', () => {
      expect(() => normalizeText(null as any)).toThrow(
        'Input text cannot be null or undefined'
      );
      expect(() => normalizeText(undefined as any)).toThrow(
        'Input text cannot be null or undefined'
      );
    });

    it('동일한 의미의 텍스트가 동일하게 정규화되어야 함', () => {
      const input1 = '  박광업   (대림카센터)  ';
      const input2 = '박광업 (대림카센터)';
      const input3 = '\t박광업\t(대림카센터)\n';

      const result1 = normalizeText(input1);
      const result2 = normalizeText(input2);
      const result3 = normalizeText(input3);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe('박광업 (대림카센터)');
    });

    it('성능 요구사항을 만족해야 함 (1000건 < 30ms)', () => {
      const testTexts = Array.from(
        { length: 1000 },
        (_, i) => `  test   string   ${i}  `
      );

      const startTime = Date.now();
      testTexts.forEach(text => normalizeText(text));
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(30);
    });
  });

  describe('통합 테스트', () => {
    it('normalizeText 후 generateHash가 일관된 결과를 생성해야 함', () => {
      const input1 = '  박광업   (대림카센터)  ';
      const input2 = '박광업 (대림카센터)';

      const normalized1 = normalizeText(input1);
      const normalized2 = normalizeText(input2);

      const hash1 = generateHash(normalized1);
      const hash2 = generateHash(normalized2);

      expect(normalized1).toBe(normalized2);
      expect(hash1).toBe(hash2);
    });

    it('실제 거래 데이터 예시들을 처리할 수 있어야 함', () => {
      const realTransactionTexts = [
        '박광업 (대림카센터)',
        '지에스25이천하이',
        '세븐일레븐 충주기업',
        '(주)부자 충주(상)주',
        '구글페이먼트코리아',
        '건강보험료',
        'DNH*GODADDY#32131232131123',
        '김용훈',
        '체크입금',
      ];

      realTransactionTexts.forEach(text => {
        const normalized = normalizeText(text);
        const hash = generateHash(normalized);

        expect(normalized).toBeTruthy();
        expect(hash).toHaveLength(64);
        expect(hash).toMatch(/^[a-f0-9]{64}$/);
      });
    });

    it('대량 거래 데이터 처리 성능 테스트', () => {
      const largeDataset = Array.from(
        { length: 5000 },
        (_, i) => `거래 데이터 ${i}`
      );

      const startTime = Date.now();
      largeDataset.forEach(text => {
        const normalized = normalizeText(text);
        generateHash(normalized);
      });
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(200); // 5000건 < 200ms
    });
  });
});
