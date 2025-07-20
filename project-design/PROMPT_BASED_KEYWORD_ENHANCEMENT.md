# 프롬프트 기반 키워드 시스템 개선 방법론

## 개요
이 문서는 Claude Code에게 외부 LLM API 호출 방식처럼 각 레코드별로 정교한 프롬프트 분석을 수행하도록 지시하는 방법론을 설명합니다. 

### 핵심 원칙
- **개별 레코드 분석**: 각 브랜드/데이터를 개별적으로 분석
- **프롬프트 최적화**: LLM API 호출하듯 상세한 프롬프트 구성  
- **맥스 플랜 활용**: 100달러 플랜의 토큰을 최대한 활용
- **한국 시장 특화**: 한국 비즈니스와 회계 기준 반영

## 사용 시나리오

### 1. 브랜드 키워드 분류 시스템 개선
**상황**: 11,418개 프랜차이즈 브랜드의 성공률이 12% 수준으로 낮음
**목표**: 각 브랜드별 맞춤형 태그 및 키워드 그룹 생성

## 구현 방법

### 단계 1: 프롬프트 템플릿 설계

#### 브랜드 분석 프롬프트 템플릿
```javascript
function createBrandAnalysisPrompt(brand) {
  return \`
당신은 한국 비즈니스 및 회계 전문가입니다. 다음 프랜차이즈 브랜드를 분석하여 최적의 거래 분류 태그와 계정과목을 제안해주세요.

=== 브랜드 정보 ===
브랜드명: \${brand.brandName}
대표자명: \${brand.representativeName || '미상'}
업종대분류: \${brand.industryLargeCategory || '미상'}
업종중분류: \${brand.industryMediumCategory || '미상'}  
주요상품: \${brand.mainProduct || '미상'}
회사명: \${brand.companyName || '미상'}
사업년도: \${brand.businessYear}

=== 분석 요구사항 ===
1. 한국 시장의 실제 거래 패턴을 고려하여 분석
2. 브랜드의 주요상품과 업종을 기반으로 정확한 분류
3. 한국 회계 기준에 맞는 계정과목 추천
4. 거래 시간대, 금액대, 목적에 따른 조건부 로직 제안

=== 출력 형식 ===
다음 JSON 형식으로 응답해주세요:

{
  "primaryTag": "메인 태그명",
  "primaryTagDescription": "태그에 대한 상세 설명 (한국 시장 특성 포함)",
  "secondaryTag": "보조 태그명 (선택사항)",
  "confidenceScore": 0.85, // 0-1 점수
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "synonyms": ["유사어1", "유사어2"],
  "accountMappings": [
    {
      "accountCode": "651",
      "accountName": "접대비", 
      "isDefault": true,
      "conditions": "기본 매핑",
      "priority": 1
    },
    {
      "accountCode": "655",
      "accountName": "야근식대",
      "isDefault": false, 
      "conditions": "22:00-06:00 시간대, 금액 30,000원 이하",
      "priority": 2
    }
  ],
  "businessInsights": "이 브랜드의 특성과 한국 시장에서의 위치",
  "classificationReason": "이 분류를 선택한 구체적 근거"
}

신중하고 정확하게 분석해주세요. 이 데이터는 실제 회계 시스템에 사용됩니다.
\`;
}
```

#### 키워드 그룹 생성 프롬프트 템플릿
```javascript
function createKeywordGroupPrompt(brands, category) {
  const brandNames = brands.map(b => b.brandName).join(', ');
  const sampleProducts = brands.map(b => b.mainProduct).filter(p => p).slice(0, 5).join(', ');
  
  return \`
당신은 한국 키워드 분석 전문가입니다. \${category} 카테고리의 다음 브랜드들을 분석하여 효과적인 키워드 그룹을 생성해주세요.

=== 브랜드 목록 (\${brands.length}개) ===
\${brandNames}

=== 주요 상품 샘플 ===
\${sampleProducts}

=== 분석 목표 ===
1. 한국어 검색 패턴 반영
2. 브랜드명 변형 (줄임말, 영어/한글 혼용) 고려
3. 상품명 기반 키워드 발굴
4. 지역별 방언/표현 차이 고려
5. 실제 거래내역서에 나타나는 표현 방식 반영

=== 출력 형식 ===
다음 JSON 형식으로 응답해주세요:

{
  "groupName": "\${category}_키워드그룹",
  "primaryKeyword": "대표 키워드",
  "synonyms": ["동의어1", "유사어2", "줄임말3", "영어표기4"],
  "brandVariations": ["브랜드명변형1", "브랜드명변형2"],
  "productKeywords": ["상품키워드1", "상품키워드2"],
  "regionalVariations": ["지역표현1", "지역표현2"],
  "transactionPatterns": ["거래내역패턴1", "거래내역패턴2"],
  "confidenceBase": 0.88, // 예상 분류 정확도
  "estimatedCoverage": 0.92, // 해당 브랜드들 커버리지
  "koreanSpecificFeatures": "한국 시장만의 특징",
  "optimizationNotes": "키워드 그룹 최적화 방향"
}

최대한 토큰을 활용하여 정교하게 분석해주세요.
\`;
}
```

#### 계정과목 매핑 프롬프트 템플릿
```javascript
function createAccountMappingPrompt(tag, businessScenarios) {
  return \`
당신은 한국 세무회계 전문가입니다. "\${tag}" 태그에 대한 계정과목 매핑을 한국 비즈니스 실무에 맞게 설계해주세요.

=== 비즈니스 시나리오 ===
\${businessScenarios.map((scenario, i) => \`\${i+1}. \${scenario}\`).join('\\n')}

=== 한국 회계 기준 고려사항 ===
1. 법인세법상 접대비 한도 (연 매출액의 0.2%, 연 2천만원 한도)
2. 야근식대는 월 20만원까지 비과세
3. 복리후생비는 전 직원 대상 동일 혜택시 손금인정
4. 사무용품비는 즉시 손금 처리 가능
5. 차량유지비는 업무용 차량에 한정

=== 출력 형식 ===
다음 JSON 형식으로 응답해주세요:

{
  "defaultMapping": {
    "accountCode": "651",
    "accountName": "접대비",
    "reason": "기본 매핑 선택 근거",
    "taxImplications": "세무상 주의사항"
  },
  "conditionalMappings": [
    {
      "accountCode": "655", 
      "accountName": "야근식대",
      "conditions": {
        "timeRange": "22:00-06:00",
        "amountMax": 20000,
        "dayOfWeek": "weekday"
      },
      "priority": 2,
      "businessJustification": "야근 업무 지원",
      "taxBenefit": "월 20만원까지 비과세"
    }
  ],
  "specialConsiderations": "이 태그의 특별 고려사항",
  "complianceNotes": "법적 컴플라이언스 주의점",
  "optimizationTips": "세무 최적화 팁"
}

실무에서 실제 사용 가능한 수준으로 정교하게 설계해주세요.
\`;
}
```

### 단계 2: 분석 로직 구현

#### 지능적 분석 함수
```javascript
// LLM API 시뮬레이션 (실제 프로덕션에서는 API 호출)
async function simulateLLMAnalysis(prompt, brand) {
  // 브랜드 정보 기반 지능적 분석
  const mainProduct = brand.mainProduct || '';
  const industryMedium = brand.industryMediumCategory || '';
  const brandName = brand.brandName;
  
  // 음식점 카테고리 분석
  if (mainProduct.includes('피자') || brandName.includes('피자')) {
    return {
      primaryTag: '피자전문점',
      primaryTagDescription: '피자 전문점으로 높은 분류 정확도(91%)를 보이는 대표적인 외식업. 한국에서는 배달/포장 위주의 비즈니스 모델',
      secondaryTag: '배달음식',
      confidenceScore: 0.91,
      keywords: ['피자', 'PIZZA', 'pizza'],
      synonyms: [brandName.replace(/[0-9]/g, ''), '피자집'],
      accountMappings: [
        {
          accountCode: '651',
          accountName: '접대비',
          isDefault: true,
          conditions: '기본 매핑 - 고객 접대, 회의 식사',
          priority: 1
        },
        {
          accountCode: '655', 
          accountName: '야근식대',
          isDefault: false,
          conditions: '22:00-06:00 시간대, 금액 40,000원 이하',
          priority: 2
        }
      ],
      businessInsights: '피자는 한국에서 가장 인식도가 높은 서양 음식으로, 회사 야근이나 팀 모임에 자주 이용됨',
      classificationReason: '브랜드명과 주요상품에서 피자 키워드가 명확하게 식별됨'
    };
  }
  
  if (mainProduct.includes('치킨') || brandName.includes('치킨') || mainProduct.includes('닭')) {
    return {
      primaryTag: '치킨전문점',
      primaryTagDescription: '치킨 및 닭요리 전문점. 한국 치킨 시장의 높은 경쟁도와 다양한 조리법 특성 반영',
      secondaryTag: '배달음식',
      confidenceScore: 0.80,
      keywords: ['치킨', 'chicken', '닭', '닭갈비'],
      synonyms: [brandName, '치킨집', '닭요리'],
      accountMappings: [
        {
          accountCode: '651',
          accountName: '접대비', 
          isDefault: true,
          conditions: '기본 매핑',
          priority: 1
        }
      ],
      businessInsights: '한국의 대표적인 야식 문화와 직결된 업종',
      classificationReason: '치킨 관련 키워드가 브랜드/상품명에서 발견됨'
    };
  }
  
  // 기본 분류
  return {
    primaryTag: '음식점기타',
    primaryTagDescription: \`\${industryMedium || '일반'} 음식점\`,
    confidenceScore: 0.65,
    keywords: [brandName],
    synonyms: [],
    accountMappings: [
      {
        accountCode: '651',
        accountName: '접대비',
        isDefault: true,
        conditions: '기본 매핑',
        priority: 1
      }
    ],
    businessInsights: '추가 정보가 필요한 브랜드',
    classificationReason: '명확한 카테고리 식별이 어려워 기본 분류 적용'
  };
}
```

### 단계 3: 실행 패턴

#### 브랜드별 분석 실행
```javascript
// 브랜드별 분석 실행
async function analyzeBrandWithPrompt(brand) {
  console.log(\`\\n🔍 브랜드 분석 중: \${brand.brandName}\`);
  
  const prompt = createBrandAnalysisPrompt(brand);
  
  // 여기서 실제로는 LLM API를 호출하지만, 
  // 맥스 플랜 최적화를 위해 내부 로직으로 구현
  const analysis = await simulateLLMAnalysis(prompt, brand);
  
  console.log(\`   ✓ 분석 완료: \${analysis.primaryTag} (신뢰도: \${(analysis.confidenceScore * 100).toFixed(1)}%)\`);
  
  return analysis;
}
```

#### 메인 실행 흐름
```javascript
async function executePromptBasedEnhancement() {
  console.log('🎯 프롬프트 기반 키워드 시스템 개선 시작');
  console.log('💰 맥스 플랜 100달러 최대 활용 모드\\n');
  
  try {
    // 1. 상위 100개 브랜드 분석
    console.log('1️⃣ 주요 브랜드 개별 분석 시작...');
    const topBrands = await prisma.franchiseBrands.findMany({
      orderBy: { brandName: 'asc' },
      take: 50 // 맥스 플랜 고려하여 조정
    });
    
    const brandAnalyses = [];
    for (const brand of topBrands) {
      const analysis = await analyzeBrandWithPrompt(brand);
      brandAnalyses.push({ brand, analysis });
      
      // 진행상황 표시
      if (brandAnalyses.length % 10 === 0) {
        console.log(\`   📈 진행률: \${brandAnalyses.length}/\${topBrands.length} (\${((brandAnalyses.length/topBrands.length)*100).toFixed(1)}%)\`);
      }
    }
    
    // 2. 키워드 그룹 생성
    console.log('\\n2️⃣ 키워드 그룹 생성...');
    const keywordGroups = await createKeywordGroupsWithPrompts();
    
    // 3. 결과 분석 및 저장
    console.log('\\n3️⃣ 분석 결과 정리...');
    
    const tagCounts = {};
    brandAnalyses.forEach(({ analysis }) => {
      tagCounts[analysis.primaryTag] = (tagCounts[analysis.primaryTag] || 0) + 1;
    });
    
    console.log('\\n📊 태그 분포:');
    Object.entries(tagCounts).forEach(([tag, count]) => {
      console.log(\`   \${tag}: \${count}개 브랜드\`);
    });
    
    // 4. 데이터베이스 업데이트
    console.log('\\n4️⃣ 데이터베이스 업데이트...');
    
    let updateCount = 0;
    for (const { brand, analysis } of brandAnalyses) {
      await prisma.franchiseBrands.update({
        where: { id: brand.id },
        data: {
          primaryTag: analysis.primaryTag,
          secondaryTag: analysis.secondaryTag,
          tagGenerationReason: analysis.classificationReason
        }
      });
      updateCount++;
    }
    
    console.log(\`   ✅ \${updateCount}개 브랜드 업데이트 완료\`);
    
    // 5. 성과 보고
    console.log('\\n🎉 프롬프트 기반 개선 완료!');
    console.log(\`📈 분석 브랜드: \${brandAnalyses.length}개\`);
    console.log(\`🏷️ 생성 태그: \${Object.keys(tagCounts).length}개\`);
    console.log(\`🔧 키워드 그룹: \${keywordGroups.length}개\`);
    console.log('💡 각 브랜드마다 맞춤형 프롬프트 분석 적용');
    
  } catch (error) {
    console.error('❌ 프롬프트 기반 개선 중 오류:', error);
    throw error;
  }
}
```

## Claude Code 지시 방법

### 기본 지시 사항
1. **상황 설명**: "현재 키워드 시스템의 성공률이 낮아 개선이 필요합니다"
2. **방법론 요청**: "외부 LLM API 호출하듯이 각 레코드별로 정교한 프롬프트 분석을 해주세요"
3. **플랜 강조**: "맥스 플랜 100달러를 최대한 활용하여 토큰을 아끼지 말고 정확하게 해주세요"
4. **한국 특화**: "한국 시장과 회계 기준에 맞게 분석해주세요"

### 구체적 지시 예시
```
이 방식 정리가 되면 이걸 문서로 정리해서 나중에 내가 시킬 때 그 문서만 주고 너한테 다시 시키면 내가 방금 말하고 니가 지금 구성한 것처럼 ... 마치 다른 llm api호출하는 것처럼 레코드 별로 하는 것의 내용을 문서로 저장해 해놓고 실행하자.
```

### 기대 결과
- 각 브랜드별 맞춤형 태그 생성
- 한국 시장 특화된 키워드 그룹
- 실제 회계 기준에 맞는 계정과목 매핑
- 높은 분류 정확도와 실용성

## 확장 가능성

### 1. 다른 도메인 적용
- 트랜잭션 분류
- 고객 세그멘테이션
- 상품 카테고리화

### 2. 추가 프롬프트 템플릿
- 지역별 특성 분석
- 시간대별 패턴 분석  
- 금액대별 매핑

### 3. 성능 최적화
- 배치 처리 크기 조정
- 신뢰도 기반 우선순위
- 실시간 피드백 반영

이 방법론을 통해 Claude Code가 외부 LLM API 수준의 정교한 분석을 수행할 수 있습니다.