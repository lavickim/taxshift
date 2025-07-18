/**
 * LLM 프롬프트 중앙 관리 시스템
 * 프로젝트에서 사용되는 모든 LLM 프롬프트를 한 곳에서 관리
 */

// =============================================================================
// 1. Layer 3 (LLM) - 거래 텍스트 분류 프롬프트
// =============================================================================

export interface ClassificationPromptContext {
  amount?: number;
  date?: string;
  location?: string;
}

/**
 * 한국어 거래 텍스트 분류를 위한 주요 프롬프트
 * 사용처: lib/services/llm-inference.ts
 */
export function buildTransactionClassificationPrompt(
  text: string, 
  context?: ClassificationPromptContext
): string {
  const contextInfo = context ? 
    `거래 컨텍스트:
    - 금액: ${context.amount || '알 수 없음'}
    - 날짜: ${context.date || '알 수 없음'}
    - 위치: ${context.location || '알 수 없음'}
    
    ` : '';

  return `당신은 한국어 금융 거래 텍스트를 분석하는 전문가입니다.

${contextInfo}다음 거래 텍스트를 분석하여 적절한 카테고리와 상호명을 추출해주세요:

거래 텍스트: "${text}"

카테고리는 다음 중 하나를 선택해주세요:
- 식음료 (음식점, 카페, 주류 등)
- 교통 (대중교통, 택시, 주차, 톨게이트 등)
- 쇼핑 (마트, 백화점, 온라인쇼핑몰, 의류 등)
- 의료 (병원, 약국, 건강검진 등)
- 교육 (학원, 도서, 온라인강의 등)
- 문화 (영화, 공연, 전시, 게임 등)
- 생활 (미용, 세탁, 수리, 청소 등)
- 금융 (은행, 보험, 투자, 대출 등)
- 통신 (휴대폰, 인터넷, 케이블TV 등)
- 주거 (임대료, 관리비, 부동산 등)
- 기타

다음 JSON 형식으로만 응답해주세요:
{
  "matched": true/false,
  "category": "카테고리명 또는 null",
  "confidence": 0.0-1.0,
  "predictedName": "추출된 상호명 또는 null",
  "description": "분류 근거 설명",
  "reasoning": "상세한 분석 과정"
}

분류할 수 없거나 확실하지 않은 경우 matched를 false로 설정하고, confidence는 0.5 이하로 설정해주세요.`;
}

// =============================================================================
// 2. 거래 정규화 프롬프트 (transactions-analysis API용)
// =============================================================================

/**
 * 거래 내역 정규화를 위한 프롬프트
 * 사용처: app/api/transactions-analysis/route.ts
 */
export const TRANSACTION_NORMALIZATION_PROMPT = `
# ROLE & GOAL
당신은 **고효율 자연어 정규화(Normalization) 엔진**입니다. 당신의 유일한 목표는 입력된 원시 거래 문자열을 분석하여, 데이터베이스 조회에 사용될 일관되고 깨끗한 **'고유 키(unique_key)'**를 생성하는 것입니다. 당신의 판단 기준은 **속도와 일관성**입니다. 다른 부가적인 설명이나 추론은 필요 없습니다. 오직 요청된 형식의 JSON만 출력하십시오.

# CORE INSTRUCTIONS
1.  **거래처명 정규화 (Normalize Entity Name)**: \`raw_text\`에서 핵심적인 거래처명을 추출하여 \`normalized_entity_name\`을 생성합니다. 이때, 불필요한 법인 형태((주), 주식회사), 특수문자(*, /), 지점명, 설명구 등은 제거하여 핵심 이름만 남깁니다.
2.  **업종 분류 (Categorize Entity)**: 정규화된 거래처명과 원본 텍스트의 힌트를 바탕으로 가장 적합한 \`entity_category\`를 분류합니다. (예: 주유소, 편의점, 온라인 IT 서비스, 개인, 음식점, 교통/운송)
3.  **위치 정보 추출 (Extract Location)**: 거래 내역에 지리적 정보(예: 충주, 이천, 서울)가 있다면 추출하여 \`location\`에 기록합니다. 없다면 '없음'으로 기록합니다.
4.  **고유 키 생성 (Create Unique Key)**: 아래의 **\`업종_정규화된이름_위치\`** 형식에 맞춰, 일관성 있는 \`unique_key\`를 생성합니다. 이 키는 후속 시스템에서 데이터베이스를 조회하는 데 사용됩니다.

# EXAMPLES (Few-shot Learning for Normalization)

**Input:** \`(주)부자 충주(상)주\`
**Output:**
\`\`\`
{
  "original_text": "(주)부자 충주(상)주",
  "normalized_entity_name": "부자주유소",
  "entity_category": "주유소",
  "location": "충주",
  "unique_key": "주유소_부자주유소_충주"
}
\`\`\`

# TASK
아래 "INPUT_DATA"로 제공된 각 거래 내역에 대해, 위의 지침을 따라 정규화를 수행하고, 전체 결과를 단일 JSON 배열(array) 형식으로 출력해주십시오.

# INPUT_DATA
`;

// =============================================================================
// 3. 룰베이스 구축을 위한 심층 분석 프롬프트 (v3.0)
// =============================================================================

/**
 * 룰베이스 구축을 위한 심층 분석 프롬프트 (v3.0 - Context-Aware)
 * 사용처: app/api/transactions-analysis/route.ts
 */
export const RULE_GENERATION_PROMPT = `
# ROLE & GOAL
당신은 AI 세무 기장 시스템을 위한 '데이터 아키텍트'이자 '상황인지 추론 전문가'입니다. 당신의 v3.0 목표는 원시 거래 내역을 다단계로 분석하고, 특히 **거래 문자열에 숨겨진 맥락(Context)을 최대한 활용**하여 '룰베이스' 구축에 최적화된 고품질 JSON 데이터를 생성하는 것입니다.

# CORE INSTRUCTIONS
1.  **1단계: 개체명 및 맥락 인식 (Entity & Context Recognition):**
    * 
    * **중요**: 거래 내역에 포함된 **지리적 정보(예: 충주, 이천), 시간 정보, 또는 특정 패턴(예: 차량번호, 휴게소, (상)주, (하)주)**을 핵심적인 추론 힌트로 활용하십시오.

2.  **2단계: 업종 분류 (Entity Categorization):** 식별된 개체명과 맥락을 종합하여 가장 가능성 높은 업종을 \`entity_category\` 필드에 분류합니다.

3.  **3단계: 신뢰도 평가 (Confidence Scoring):** 거래의 **'목적'** 추론에 대한 신뢰도를 0.0에서 1.0 사이의 \`confidence_score\`로 평가합니다.

4.  **4단계: 모호성 판단 및 질문 고도화 (Ambiguity Judgment & Advanced Questioning):**
    * If \`confidence_score\` < 0.9: \`is_ambiguous\`를 \`true\`로 설정합니다.
    * **중요**: \`user_question\`을 생성할 때, 단순 질문이 아닌 **JSON 객체 형식**으로 생성합니다. 이 객체는 질문 텍스트(\`question_text\`)와 사용자가 선택할 **옵션 배열(\`options\`)**을 포함해야 합니다.
    * 각 옵션은 사용자에게 보여줄 **\`display_text\`(예: '#직원간식')**와 시스템이 사용할 **\`value\`(예: { "tag": "#staff_snack", "account": "복리후생비", "vat": true })**를 포함해야 합니다.
    * \`entity_category\`를 기반으로 가장 가능성 높은 1~3개의 옵션을 제시하십시오.

5.  **5단계: 태그 제안 및 계정과목 매핑 (Tagging & Mapping):**
    * **법인 세무 지식 적용**:
        * 4대 보험료(건강보험 등)의 회사 부담분은 **'복리후생비'**로 처리합니다.
        * 업무 관련성이 높은 접대, 선물 등은 **'접대비'**로 처리합니다.
        * 입금 거래는 \`debit_account\`를 '보통예금'으로 하고, \`credit_account\`는 사용자 확인 후 결정해야 합니다.

6.  **논리적 근거 제시 (Provide Reasoning):** \`reasoning\` 필드에 위 1~5단계의 전체 추론 과정을 단계별로 상세히 서술합니다.

# EXAMPLES (Few-shot Learning v3.0)

**Example 1: 모호한 거래에 '스마트 선택지' 제공**
\`raw_text\`: "지에스25이천하이닉스협력관점"
\`output\`:
\`\`\`json
{
  "raw_text": "지에스25이천하이닉스협력관점",
  "entity_name": "GS25 이천하이닉스협력관점",
  "entity_category": "편의점",
  "confidence_score": 0.2,
  "is_ambiguous": true,
  "user_question": {
    "question_text": "편의점(GS25) 지출입니다. 어떤 목적으로 사용되었나요?",
    "options": [
      { "display_text": "#직원간식", "value": { "tag": "#staff_snack", "account": "복리후생비", "vat": true } },
      { "display_text": "#사무용품", "value": { "tag": "#office_supplies", "account": "소모품비", "vat": true } },
      { "display_text": "#개인사용", "value": { "tag": "#personal_use", "account": "가지급금", "vat": false } }
    ]
  },
  "suggested_tag": null,
  "debit_account": null,
  "reasoning": "1. entity_name 'GS25' 인식. 2. entity_category '편의점' 분류. 3. 목적 불분명으로 confidence_score 0.2. 4. is_ambiguous true 설정 및 '편의점'에서 발생 가능한 지출 유형을 기반으로 사용자에게 선택 가능한 옵션들을 포함한 질문 생성."
}
\`\`\`

**Example 2: '맥락'을 활용한 추론**
\`raw_text\`: "(주)부자 충주(상)주"
\`output\`:
\`\`\`
{
  "raw_text": "(주)부자 충주(상)주",
  "entity_name": "(주)부자 주유소 충주휴게소(상행)",
  "entity_category": "주유소",
  "confidence_score": 0.95,
  "is_ambiguous": false,
  "user_question": null,
  "suggested_tag": "#업무용차량주유비",
  "debit_account": "차량유지비",
  "credit_account": "보통예금",
  "vat_applicable": true,
  "reasoning": "1. entity_name 인식. 2. '충주(상)주'라는 지리적/상황적 맥락을 통해 '충주휴게소 상행선 주유소'로 추론하고, entity_category를 '주유소'로 분류. 3. 목적이 명확하므로 confidence_score 0.95. 4. is_ambiguous false 설정. 5. '#업무용차량주유비' 태그와 '차량유지비' 계정과목으로 매핑."
}
\`\`\`

# TASK
아래 "INPUT_DATA"로 제공된 각 거래 내역에 대해, 위의 **새로운 v3.0 지침과 예시**를 따라 다단계 분석을 수행하고, 전체 결과를 단일 JSON 배열(array) 형식으로 출력해주십시오.

# INPUT_DATA
`;

// =============================================================================
// 4. 룰엔진용 프롬프트
// =============================================================================

/**
 * 거래처명으로부터 룰 정보를 추론하는 프롬프트
 * 사용처: 룰엔진 생성 팝업의 AI 도움 기능
 */
export function buildRuleEngineSuggestionPrompt(keyword: string): string {
  return `당신은 한국 기업의 회계/세무 전문가입니다. 다음 거래처명/키워드를 분석하여 적절한 회계 분류를 제안해주세요.

거래처명/키워드: "${keyword}"

다음 사항을 분석하여 JSON 형식으로 응답해주세요:

1. 이 거래처가 일반적으로 어떤 용도로 사용되는가?
2. 신뢰도는 얼마나 되는가? (0-100)
3. 애매한 경우 사용자에게 어떤 질문을 해야 하는가?
4. 가장 적절한 태그와 계정과목은 무엇인가?
5. 대안적인 분류가 있다면 무엇인가?

응답 형식:
{
  "confidence": 70-95 사이의 숫자,
  "question": "애매한 경우(신뢰도 90 미만) 사용자에게 할 질문",
  "primaryTag": "#태그명",
  "primaryAccount": "계정과목명",
  "secondaryTag": "#대안태그명",
  "secondaryAccount": "대안계정과목명",
  "reasoning": "분류 근거 설명"
}

주요 태그 예시:
- #접대비, #복리후생비, #교통비, #차량유지비, #사무용품비, #IT비용, #통신비, #교육훈련비, #도서인쇄비, #운반비, #출장비, #기타경비

주요 계정과목 예시:
- 접대비, 복리후생비, 여비교통비, 차량유지비, 소모품비, 지급수수료, 통신비, 교육훈련비, 도서인쇄비, 운반비, 잡비

중요: 
- 편의점이나 온라인쇼핑몰처럼 용도가 다양한 경우 신뢰도를 70-80으로 설정하고 질문을 만들어주세요.
- 통신사나 보험처럼 용도가 명확한 경우 신뢰도를 90-95로 설정하세요.
- question은 신뢰도가 90 미만일 때만 필요합니다.`;
}

// =============================================================================
// 5. 프롬프트 관련 유틸리티 함수들
// =============================================================================

/**
 * 프롬프트와 데이터를 결합하는 유틸리티 함수
 */
export function combinePromptWithData(basePrompt: string, data: any[]): string {
  return `${basePrompt}\n${JSON.stringify(data, null, 2)}`;
}

/**
 * 지원되는 프롬프트 타입들
 */
export type PromptType = 
  | 'transaction-classification' 
  | 'transaction-normalization' 
  | 'rule-generation';

/**
 * 프롬프트 메타데이터 관리
 */
export const PROMPT_METADATA = {
  'transaction-classification': {
    name: '거래 텍스트 분류',
    model: 'gemini-2.0-flash',
    version: 'v1.0',
    usage: 'Layer 3 LLM 분류 시스템',
    file: 'lib/services/llm-inference.ts'
  },
  'transaction-normalization': {
    name: '거래 내역 정규화',
    model: 'gemini-1.5-flash',
    version: 'v1.0', 
    usage: '거래 분석 API - 1단계',
    file: 'app/api/transactions-analysis/route.ts'
  },
  'rule-generation': {
    name: '룰베이스 구축 분석',
    model: 'gemini-2.0-flash',
    version: 'v3.0',
    usage: '거래 분석 API - 2단계',
    file: 'app/api/transactions-analysis/route.ts'
  }
} as const;

/**
 * 프롬프트 변경 이력 추적
 */
export const PROMPT_CHANGELOG = {
  '2024-01-15': {
    type: 'transaction-classification',
    changes: ['Initial implementation with 11 Korean categories'],
    version: 'v1.0'
  },
  '2024-01-20': {
    type: 'rule-generation', 
    changes: ['Upgraded to v3.0 with context-aware analysis', 'Added smart option generation for ambiguous transactions'],
    version: 'v3.0'
  }
} as const; 