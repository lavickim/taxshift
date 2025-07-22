-- 테스트 거래 데이터 삽입
-- UUID 변수 설정
\set test_company_id '3ddc2f4b-ccf8-4f90-b905-2f01251e3e90'

-- 기존 데이터 삭제 (충돌 방지)
DELETE FROM transactions WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8);

-- 테스트 거래 데이터 삽입
INSERT INTO transactions (
  id, company_id, raw_text, transaction_date, amount, 
  final_suggested_tag, final_debit_account, final_credit_account, 
  transaction_type, status, created_at, updated_at
) VALUES 
-- 비용 거래들
(1, :'test_company_id', '스타벅스 커피 결제 15,000원', '2024-01-15', 15000, 
 '커피전문점', NULL, NULL, 'EXPENSE', 'RULE_PROCESSED', NOW(), NOW()),

(2, :'test_company_id', 'GS칼텍스 주유 80,000원', '2024-01-16', 80000, 
 '주유소', NULL, NULL, 'EXPENSE', 'RULE_PROCESSED', NOW(), NOW()),

(3, :'test_company_id', '택시 이용료 25,000원', '2024-01-17', 25000, 
 '택시', NULL, NULL, 'EXPENSE', 'RULE_PROCESSED', NOW(), NOW()),

(4, :'test_company_id', '편의점 사무용품 구매 12,000원', '2024-01-18', 12000, 
 '편의점', NULL, NULL, 'EXPENSE', 'RULE_PROCESSED', NOW(), NOW()),

(5, :'test_company_id', '통신비 결제 45,000원', '2024-01-20', 45000, 
 '통신', NULL, NULL, 'EXPENSE', 'RULE_PROCESSED', NOW(), NOW()),

(6, :'test_company_id', '임차료 지급 300,000원', '2024-01-21', 300000, 
 '사무실임대', NULL, NULL, 'EXPENSE', 'RULE_PROCESSED', NOW(), NOW()),

(7, :'test_company_id', '직원 급여 지급 2,000,000원', '2024-01-25', 2000000, 
 '급여', NULL, NULL, 'EXPENSE', 'RULE_PROCESSED', NOW(), NOW()),

-- 수익 거래
(8, :'test_company_id', '고객 서비스 매출 500,000원', '2024-01-19', 500000, 
 '서비스매출', NULL, NULL, 'INCOME', 'RULE_PROCESSED', NOW(), NOW());

-- 삽입 결과 확인
SELECT 
  id, 
  company_id, 
  raw_text, 
  transaction_date, 
  amount, 
  final_suggested_tag, 
  transaction_type 
FROM transactions 
WHERE company_id = :'test_company_id' 
ORDER BY id;