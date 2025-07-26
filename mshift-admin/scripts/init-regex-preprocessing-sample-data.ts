/**
 * 정규식 전처리 시스템 샘플 데이터 초기화 스크립트
 * 기본 카테고리와 샘플 규칙들을 생성합니다.
 */

import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 정규식 전처리 시스템 샘플 데이터 초기화 시작...');

  // 1. 기본 카테고리 생성
  console.log('📂 카테고리 생성 중...');
  
  const categories = [
    { name: '법인구조', description: '법인 형태 표시자 정규화 (주식회사, (주), (유) 등)', icon: 'building', color: '#3B82F6' },
    { name: '주유소', description: '주유소 거래 정규화 (상행선, 하행선, 브랜드별)', icon: 'fuel', color: '#EF4444' },
    { name: '마트', description: '대형마트/백화점 정규화', icon: 'shopping-cart', color: '#10B981' },
    { name: '해외서비스', description: '해외 서비스 거래 정규화', icon: 'globe', color: '#8B5CF6' },
    { name: '공공기관', description: '정부/공공기관 거래 정규화', icon: 'landmark', color: '#F59E0B' },
    { name: '카페', description: '카페/커피전문점 정규화', icon: 'coffee', color: '#8B4513' },
    { name: '편의점', description: '편의점 거래 정규화', icon: 'store', color: '#06B6D4' },
    { name: '기타', description: '기타 패턴', icon: 'tag', color: '#6B7280' }
  ];

  for (const [index, category] of categories.entries()) {
    await prisma.regexPreprocessingCategory.upsert({
      where: { categoryName: category.name },
      update: {},
      create: {
        categoryName: category.name,
        description: category.description,
        iconName: category.icon,
        colorHex: category.color,
        displayOrder: index
      }
    });
  }

  console.log(`✅ ${categories.length}개 카테고리 생성 완료`);

  // 2. 샘플 규칙 생성
  console.log('📝 샘플 규칙 생성 중...');

  const sampleRules = [
    // 법인구조 정규화 규칙
    {
      ruleName: '주식회사 표시 제거',
      description: '주식회사 표시자를 제거하고 핵심 업체명만 추출',
      category: '법인구조',
      inputPattern: '주식회사\\s*(.+)',
      outputTemplate: '$1',
      priority: 150,
      metadataTags: { companyType: 'corporation', extractionType: 'prefix_removal' },
      testCases: [
        { id: '1', input: '주식회사 삼성전자', expected: '삼성전자' },
        { id: '2', input: '주식회사코드쉬프트', expected: '코드쉬프트' },
        { id: '3', input: '주식회사 네이버', expected: '네이버' }
      ]
    },
    {
      ruleName: '(주) 표시 제거',
      description: '(주) 표시자를 제거하고 핵심 업체명만 추출',
      category: '법인구조',
      inputPattern: '\\(주\\)\\s*(.+)',
      outputTemplate: '$1',
      priority: 145,
      metadataTags: { companyType: 'corporation', extractionType: 'prefix_removal' },
      testCases: [
        { id: '1', input: '(주)코드쉬프트', expected: '코드쉬프트' },
        { id: '2', input: '(주) 삼성전자', expected: '삼성전자' },
        { id: '3', input: '(주)네이버', expected: '네이버' }
      ]
    },
    {
      ruleName: '(유) 표시 제거',
      description: '(유) 표시자를 제거하고 핵심 업체명만 추출',
      category: '법인구조',
      inputPattern: '\\(유\\)\\s*(.+)',
      outputTemplate: '$1',
      priority: 140,
      metadataTags: { companyType: 'limited_company', extractionType: 'prefix_removal' },
      testCases: [
        { id: '1', input: '(유)부자마트', expected: '부자마트' },
        { id: '2', input: '(유) 행복상회', expected: '행복상회' }
      ]
    },

    // 주유소 정규화 규칙
    {
      ruleName: '주유소 상하행선 분리',
      description: '주유소 거래에서 (상)주, (하)주를 상행선, 하행선으로 변환',
      category: '주유소',
      inputPattern: '(.+?)\\s*\\((상|하)\\)주',
      outputTemplate: '$1 $2행선 주유소',
      priority: 160,
      metadataTags: { industry: 'gas_station', location_type: 'highway', direction_specified: true },
      testCases: [
        { id: '1', input: 'Shell 강남(상)주', expected: 'Shell 강남 상행선 주유소' },
        { id: '2', input: 'GS칼텍스 서울(하)주', expected: 'GS칼텍스 서울 하행선 주유소' },
        { id: '3', input: 'SK에너지 부산(상)주 -80000', expected: 'SK에너지 부산 상행선 주유소' }
      ]
    },
    {
      ruleName: 'GS칼텍스 브랜드 정리',
      description: 'GS칼텍스 셀프 및 직영점 표시 정리',
      category: '주유소',
      inputPattern: 'GS칼텍스(셀프)?\\s*(.+?)\\s*(직영)?',
      outputTemplate: 'GS칼텍스 $2',
      priority: 155,
      metadataTags: { industry: 'gas_station', brand: 'gs_caltex', service_type: 'self_or_direct' },
      testCases: [
        { id: '1', input: 'GS칼텍스셀프 강남직영', expected: 'GS칼텍스 강남' },
        { id: '2', input: 'GS칼텍스 서초직영', expected: 'GS칼텍스 서초' }
      ]
    },

    // 해외서비스 정규화 규칙
    {
      ruleName: 'Claude AI 정규화',
      description: 'Claude AI 구독 서비스 거래 정규화',
      category: '해외서비스',
      inputPattern: 'CLAUDE\\.AI\\s+SUBSCRIPTION.*',
      outputTemplate: 'Claude AI',
      priority: 130,
      metadataTags: { service_type: 'ai_subscription', provider: 'anthropic', region: 'global' },
      testCases: [
        { id: '1', input: 'CLAUDE.AI SUBSCRIPTION SAN FRANCISCO USA', expected: 'Claude AI' },
        { id: '2', input: 'CLAUDE.AI SUBSCRIPTION MONTHLY', expected: 'Claude AI' }
      ]
    },
    {
      ruleName: 'Netflix 정규화',
      description: 'Netflix 구독 서비스 거래 정규화',
      category: '해외서비스',
      inputPattern: 'NETFLIX\\s+(COM\\s+)?BILL.*',
      outputTemplate: '넷플릭스',
      priority: 125,
      metadataTags: { service_type: 'streaming', provider: 'netflix', region: 'global' },
      testCases: [
        { id: '1', input: 'NETFLIX COM BILL', expected: '넷플릭스' },
        { id: '2', input: 'NETFLIX BILL MONTHLY', expected: '넷플릭스' }
      ]
    },

    // 마트 정규화 규칙
    {
      ruleName: '이마트 정규화',
      description: '이마트 에브리데이 등 이마트 계열 정규화',
      category: '마트',
      inputPattern: '이마트\\s*(에브리데이|트레이더스)?.*',
      outputTemplate: '이마트',
      priority: 120,
      metadataTags: { store_type: 'hypermarket', brand: 'emart' },
      testCases: [
        { id: '1', input: '이마트 에브리데이 서', expected: '이마트' },
        { id: '2', input: '이마트트레이더스 월계점', expected: '이마트' },
        { id: '3', input: '이마트 강남점', expected: '이마트' }
      ]
    },

    // 카페 정규화 규칙
    {
      ruleName: '스타벅스 정규화',
      description: '스타벅스 매장 표시 정리',
      category: '카페',
      inputPattern: '스타벅스\\s*(.+?)점?',
      outputTemplate: '스타벅스 $1점',
      priority: 115,
      metadataTags: { store_type: 'cafe', brand: 'starbucks' },
      testCases: [
        { id: '1', input: '스타벅스 강남역', expected: '스타벅스 강남역점' },
        { id: '2', input: '스타벅스강남점', expected: '스타벅스 강남점' }
      ]
    },

    // 충돌 테스트용 규칙들 (의도적 충돌)
    {
      ruleName: '스타벅스 대체 패턴',
      description: '스타벅스 다른 정규화 방식 (충돌 테스트용)',
      category: '카페',
      inputPattern: '스타벅스.*',
      outputTemplate: '스타벅스',
      priority: 110, // 우선순위가 낮아서 충돌 발생
      metadataTags: { store_type: 'cafe', brand: 'starbucks', test: 'conflict' },
      testCases: [
        { id: '1', input: '스타벅스 강남역', expected: '스타벅스' },
        { id: '2', input: '스타벅스 홍대점', expected: '스타벅스' }
      ]
    },
    {
      ruleName: '법인구조 광범위 패턴',
      description: '모든 법인 표시자 제거 (충돌 테스트용)',
      category: '법인구조',
      inputPattern: '.*(주|유|회사|법인).*(.+)',
      outputTemplate: '$2',
      priority: 135, // (주) 표시 제거와 비슷한 우선순위로 충돌 발생
      metadataTags: { companyType: 'all', test: 'conflict' },
      testCases: [
        { id: '1', input: '(주)테스트회사', expected: '테스트' },
        { id: '2', input: '주식회사 샘플기업', expected: '샘플기업' }
      ]
    }
  ];

  for (const rule of sampleRules) {
    await prisma.regexPreprocessingRule.create({
      data: {
        ruleName: rule.ruleName,
        description: rule.description,
        category: rule.category,
        inputPattern: rule.inputPattern,
        outputTemplate: rule.outputTemplate,
        priority: rule.priority,
        metadataTags: rule.metadataTags,
        testCases: rule.testCases
      }
    });
  }

  console.log(`✅ ${sampleRules.length}개 샘플 규칙 생성 완료 (충돌 테스트용 규칙 포함)`);

  // 3. 통계 표시
  const totalRules = await prisma.regexPreprocessingRule.count();
  const totalCategories = await prisma.regexPreprocessingCategory.count();

  console.log('');
  console.log('📊 생성 완료 통계:');
  console.log(`   - 카테고리: ${totalCategories}개`);
  console.log(`   - 규칙: ${totalRules}개`);
  console.log('');
  console.log('🎉 정규식 전처리 시스템 초기화 완료!');
  console.log('');
  console.log('🔗 테스트 URL:');
  console.log('   - 어드민 대시보드: http://localhost:3000');
  console.log('   - 규칙 목록 API: http://localhost:3000/api/regex-preprocessing/rules');
  console.log('   - 전처리 테스트 API: http://localhost:3000/api/regex-preprocessing/preprocess');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ 초기화 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });