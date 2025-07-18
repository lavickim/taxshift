# LLM 프롬프트 중앙 관리 시스템

## 📋 개요

이 파일(`data/llm-prompts.ts`)은 프로젝트에서 사용되는 모든 LLM 프롬프트를 중앙에서 관리하기 위해 만들어졌습니다.

## 🎯 목적

1. **중앙화된 관리**: 모든 프롬프트를 한 곳에서 관리
2. **일관성 보장**: 프롬프트 수정 시 일관된 변경 사항 적용
3. **버전 관리**: 프롬프트 변경 이력 추적
4. **유지보수성**: 프롬프트 수정 및 개선 용이성

## 📁 파일 구조

```
data/
├── llm-prompts.ts          # 프롬프트 정의 및 관리
├── regex-rules.csv         # 정규식 규칙 관리
└── README-llm-prompts.md   # 이 문서
```

## 🔧 현재 관리 중인 프롬프트

### 1. Layer 3 LLM 분류 프롬프트
- **함수**: `buildTransactionClassificationPrompt()`
- **사용처**: `lib/services/llm-inference.ts`
- **모델**: gemini-2.0-flash
- **목적**: 한국어 거래 텍스트를 11개 카테고리로 분류

### 2. 거래 정규화 프롬프트  
- **상수**: `TRANSACTION_NORMALIZATION_PROMPT`
- **사용처**: `app/api/transactions-analysis/route.ts`
- **모델**: gemini-1.5-flash  
- **목적**: 원시 거래 문자열을 정규화하여 고유 키 생성

### 3. 룰베이스 구축 프롬프트 (v3.0)
- **상수**: `RULE_GENERATION_PROMPT`
- **사용처**: `app/api/transactions-analysis/route.ts`
- **모델**: gemini-2.0-flash
- **목적**: 룰베이스 구축을 위한 심층 분석 및 질문 생성

## 📊 프롬프트 메타데이터

```typescript
export const PROMPT_METADATA = {
  'transaction-classification': {
    name: '거래 텍스트 분류',
    model: 'gemini-2.0-flash',
    version: 'v1.0',
    usage: 'Layer 3 LLM 분류 시스템',
    file: 'lib/services/llm-inference.ts'
  },
  // ... 다른 프롬프트들
}
```

## 🔄 사용 방법

### 기본 사용법

```typescript
// 1. 함수형 프롬프트 사용
import { buildTransactionClassificationPrompt } from "@/data/llm-prompts";

const prompt = buildTransactionClassificationPrompt(
  "지에스25 강남점", 
  { amount: 5000, date: "2024-01-15" }
);

// 2. 상수형 프롬프트 사용
import { TRANSACTION_NORMALIZATION_PROMPT } from "@/data/llm-prompts";

const fullPrompt = `${TRANSACTION_NORMALIZATION_PROMPT}\n${JSON.stringify(data)}`;
```

### 유틸리티 함수 사용

```typescript
import { combinePromptWithData } from "@/data/llm-prompts";

const fullPrompt = combinePromptWithData(basePrompt, transactionData);
```

## ✅ 마이그레이션 완료 상태

### 완료된 파일
- ✅ `lib/services/llm-inference.ts` - Layer 3 분류 프롬프트 중앙화
- ✅ `app/api/transactions-analysis/route.ts` - 정규화 및 룰베이스 프롬프트 중앙화

### 기존 프롬프트 제거
- ✅ `llm-inference.ts`에서 하드코딩된 프롬프트 제거
- ✅ `transactions-analysis/route.ts`에서 중복 프롬프트 제거

## 📈 향후 개선 계획

### 1. 프롬프트 A/B 테스팅
```typescript
export function getPromptVariant(type: PromptType, variant: 'A' | 'B'): string {
  // A/B 테스트를 위한 프롬프트 변형 관리
}
```

### 2. 다국어 지원
```typescript
export function getLocalizedPrompt(type: PromptType, language: 'ko' | 'en'): string {
  // 언어별 프롬프트 지원
}
```

### 3. 성능 모니터링
```typescript
export const PROMPT_PERFORMANCE = {
  'transaction-classification': {
    averageResponseTime: '1.2s',
    accuracy: 0.89,
    lastUpdated: '2024-01-15'
  }
}
```

## 🚫 주의사항

1. **Breaking Changes**: 프롬프트 변경 시 관련 테스트 확인 필요
2. **성능 영향**: 프롬프트 길이가 LLM 비용에 직접적인 영향
3. **일관성 유지**: 새로운 프롬프트 추가 시 기존 패턴 준수

## 📝 변경 로그

### 2024-01-XX
- 초기 프롬프트 중앙화 시스템 구축
- Layer 3 분류 프롬프트 이관
- 거래 정규화 및 룰베이스 프롬프트 이관
- 메타데이터 및 유틸리티 함수 추가

## 🔗 관련 파일

- [`lib/services/llm-inference.ts`](../lib/services/llm-inference.ts) - Layer 3 LLM 분류 서비스
- [`app/api/transactions-analysis/route.ts`](../app/api/transactions-analysis/route.ts) - 거래 분석 API  
- [`todolist.md`](../todolist.md) - 프로젝트 전체 진행 상황
- [`mvp.md`](../mvp.md) - 4층 아키텍처 설계 문서 