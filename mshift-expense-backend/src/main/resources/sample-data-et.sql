-- 편한가계부 클론 앱 샘플 데이터
-- et_ 프리픽스 테이블용

-- 1. 테스트 사용자 생성
INSERT INTO et_users (email, password_hash, nickname, is_premium) VALUES 
('test@example.com', '$2a$10$YourHashedPasswordHere', '테스트유저', false),
('premium@example.com', '$2a$10$AnotherHashedPassword', '프리미엄유저', true);

-- 2. 자산(계좌) 생성
INSERT INTO et_assets (user_id, asset_name, asset_type, bank_name, account_number, initial_balance, current_balance, color_code, display_order) VALUES
(1, '현금', 'CASH', NULL, NULL, 50000, 45000, '#FF5757', 1),
(1, '신한은행 입출금', 'BANK', '신한은행', '110-***-****67', 1000000, 850000, '#0064CD', 2),
(1, '카카오뱅크', 'BANK', '카카오뱅크', '3333-**-****89', 500000, 520000, '#FFCD00', 3),
(1, '삼성카드', 'CARD', '삼성카드', '5365-****-****-1234', 0, -150000, '#1428A0', 4),
(2, '현금', 'CASH', NULL, NULL, 100000, 95000, '#FF5757', 1);

-- 3. 기본 카테고리 생성
-- 수입 카테고리
INSERT INTO et_categories (user_id, category_name, category_type, icon_name, color_code, display_order, is_default) VALUES
(NULL, '급여', 'INCOME', 'salary', '#4CAF50', 1, true),
(NULL, '부수입', 'INCOME', 'extra', '#8BC34A', 2, true),
(NULL, '용돈', 'INCOME', 'allowance', '#CDDC39', 3, true),
(NULL, '이자', 'INCOME', 'interest', '#FFC107', 4, true),
(NULL, '기타수입', 'INCOME', 'other', '#FF9800', 5, true);

-- 지출 카테고리
INSERT INTO et_categories (user_id, category_name, category_type, icon_name, color_code, display_order, is_default) VALUES
(NULL, '식비', 'EXPENSE', 'food', '#F44336', 1, true),
(NULL, '교통비', 'EXPENSE', 'transport', '#E91E63', 2, true),
(NULL, '쇼핑', 'EXPENSE', 'shopping', '#9C27B0', 3, true),
(NULL, '생활비', 'EXPENSE', 'living', '#673AB7', 4, true),
(NULL, '문화생활', 'EXPENSE', 'culture', '#3F51B5', 5, true),
(NULL, '의료/건강', 'EXPENSE', 'health', '#2196F3', 6, true),
(NULL, '교육', 'EXPENSE', 'education', '#00BCD4', 7, true),
(NULL, '통신비', 'EXPENSE', 'phone', '#009688', 8, true),
(NULL, '경조사', 'EXPENSE', 'event', '#795548', 9, true),
(NULL, '기타지출', 'EXPENSE', 'other', '#607D8B', 10, true);

-- 이체 카테고리
INSERT INTO et_categories (user_id, category_name, category_type, icon_name, color_code, display_order, is_default) VALUES
(NULL, '이체', 'TRANSFER', 'transfer', '#9E9E9E', 1, true);

-- 사용자 정의 카테고리
INSERT INTO et_categories (user_id, category_name, category_type, icon_name, color_code, display_order) VALUES
(1, '카페', 'EXPENSE', 'coffee', '#6F4E37', 11),
(1, '넷플릭스', 'EXPENSE', 'subscription', '#E50914', 12);

-- 4. 2025년 8월 거래 내역 (현재 달)
INSERT INTO et_transactions (user_id, transaction_type, amount, asset_id, category_id, description, transaction_date, transaction_time) VALUES
-- 8월 1일
(1, 'EXPENSE', 12000, 1, 6, '점심 김치찌개', '2025-08-01', '12:30:00'),
(1, 'EXPENSE', 3500, 1, 17, '스타벅스 아메리카노', '2025-08-01', '14:00:00'),
-- 8월 2일
(1, 'EXPENSE', 8500, 4, 6, '저녁 치킨', '2025-08-02', '19:00:00'),
(1, 'EXPENSE', 45000, 4, 8, '마트 장보기', '2025-08-02', '16:00:00'),
-- 8월 5일
(1, 'INCOME', 2500000, 2, 1, '8월 급여', '2025-08-05', '09:00:00'),
(1, 'EXPENSE', 50000, 2, 7, '지하철 정기권', '2025-08-05', '10:00:00'),
-- 8월 7일
(1, 'EXPENSE', 15000, 1, 6, '점심 회식', '2025-08-07', '12:00:00'),
(1, 'EXPENSE', 89000, 4, 8, '유니클로 청바지', '2025-08-07', '17:00:00'),
-- 8월 10일
(1, 'EXPENSE', 35000, 4, 10, 'CGV 영화', '2025-08-10', '20:00:00'),
(1, 'EXPENSE', 4500, 1, 17, '이디야 라떼', '2025-08-10', '15:00:00'),
-- 8월 12일
(1, 'EXPENSE', 120000, 2, 11, '병원 진료비', '2025-08-12', '11:00:00'),
(1, 'TRANSFER', 200000, 2, 16, '카카오뱅크로 이체', '2025-08-12', '14:00:00'),
-- 8월 15일
(1, 'EXPENSE', 25000, 4, 6, '저녁 삼겹살', '2025-08-15', '19:30:00'),
(1, 'EXPENSE', 8900, 2, 18, '넷플릭스 구독료', '2025-08-15', '00:00:00'),
-- 8월 18일
(1, 'INCOME', 50000, 1, 3, '생일 용돈', '2025-08-18', '10:00:00'),
(1, 'EXPENSE', 150000, 4, 8, '나이키 운동화', '2025-08-18', '16:00:00'),
-- 8월 20일
(1, 'EXPENSE', 9000, 1, 6, '점심 국밥', '2025-08-20', '12:00:00'),
(1, 'EXPENSE', 55000, 2, 13, 'SKT 통신비', '2025-08-20', '09:00:00'),
-- 8월 22일
(1, 'EXPENSE', 100000, 2, 14, '친구 결혼식 축의금', '2025-08-22', '14:00:00'),
(1, 'EXPENSE', 32000, 4, 6, '저녁 일식', '2025-08-22', '19:00:00'),
-- 8월 25일
(1, 'EXPENSE', 4000, 1, 17, '메가커피', '2025-08-25', '10:00:00'),
(1, 'EXPENSE', 28000, 4, 9, '올리브영 화장품', '2025-08-25', '15:00:00'),
-- 8월 26일 (오늘)
(1, 'EXPENSE', 7500, 1, 6, '아침 토스트', '2025-08-26', '08:00:00'),
(1, 'EXPENSE', 3200, 1, 7, '버스비', '2025-08-26', '08:30:00');

-- target_asset_id 업데이트 (이체 거래)
UPDATE et_transactions SET target_asset_id = 3 WHERE transaction_type = 'TRANSFER' AND description = '카카오뱅크로 이체';

-- 5. 예산 설정 (2025년 8월)
INSERT INTO et_budgets (user_id, category_id, budget_amount, budget_year, budget_month) VALUES
(1, 6, 300000, 2025, 8),  -- 식비 30만원
(1, 7, 100000, 2025, 8),  -- 교통비 10만원
(1, 8, 200000, 2025, 8),  -- 쇼핑 20만원
(1, 9, 100000, 2025, 8),  -- 생활비 10만원
(1, 10, 100000, 2025, 8); -- 문화생활 10만원

-- 6. 반복 거래 템플릿
INSERT INTO et_recurring_templates (user_id, template_name, transaction_type, amount, asset_id, category_id, description, recurring_type, recurring_day) VALUES
(1, '월급', 'INCOME', 2500000, 2, 1, '월급여', 'MONTHLY', 5),
(1, '넷플릭스', 'EXPENSE', 8900, 2, 18, '넷플릭스 구독', 'MONTHLY', 15),
(1, '통신비', 'EXPENSE', 55000, 2, 13, 'SKT 요금', 'MONTHLY', 20),
(1, '교통비', 'EXPENSE', 50000, 2, 7, '정기권', 'MONTHLY', 5);

-- 7. 알림 설정
INSERT INTO et_notifications (user_id, notification_type, is_enabled, notification_time) VALUES
(1, 'DAILY_SUMMARY', true, '20:00:00'),
(1, 'BUDGET_ALERT', true, NULL),
(1, 'RECURRING_REMINDER', true, '09:00:00');

-- 8. 사용자 설정
INSERT INTO et_user_settings (user_id, setting_key, setting_value) VALUES
(1, 'theme', 'dark'),
(1, 'currency', 'KRW'),
(1, 'start_day_of_month', '1'),
(1, 'default_asset_id', '1'),
(1, 'show_decimal', 'false'),
(1, 'language', 'ko');

-- 자산 잔액 업데이트 (거래 내역 반영)
UPDATE et_assets SET current_balance = initial_balance + 
    COALESCE((SELECT SUM(CASE 
        WHEN transaction_type = 'INCOME' THEN amount 
        WHEN transaction_type = 'EXPENSE' THEN -amount 
        WHEN transaction_type = 'TRANSFER' AND asset_id = et_assets.asset_id THEN -amount
        WHEN transaction_type = 'TRANSFER' AND target_asset_id = et_assets.asset_id THEN amount
        ELSE 0 
    END) FROM et_transactions WHERE asset_id = et_assets.asset_id OR target_asset_id = et_assets.asset_id), 0)
WHERE user_id = 1;