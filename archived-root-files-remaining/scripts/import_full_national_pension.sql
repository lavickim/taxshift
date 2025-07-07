-- 전체 National Pension 데이터 임포트
-- 임시 테이블 생성
CREATE TEMP TABLE temp_national_pension_full (
    data_year_month TEXT,
    workplace_name TEXT,
    business_registration_number TEXT,
    workplace_status_code TEXT,
    postal_code TEXT,
    address_jibun TEXT,
    address_road TEXT,
    legal_dong_code TEXT,
    admin_dong_code TEXT,
    sido_code TEXT,
    sigungu_code TEXT,
    eubmyeondong_code TEXT,
    workplace_type_code TEXT,
    industry_code TEXT,
    industry_name TEXT,
    application_date TEXT,
    re_registration_date TEXT,
    withdrawal_date TEXT,
    member_count TEXT,
    monthly_notice_amount TEXT,
    new_acquisition_count TEXT,
    loss_count TEXT
);

-- CSV 데이터 로드 (헤더 스킵)
\COPY temp_national_pension_full FROM '/tmp/national_pension_full_54k.csv' WITH CSV HEADER DELIMITER ',';

-- 메인 테이블에 데이터 삽입 (타입 변환과 함께)
INSERT INTO national_pension_workplaces (
    data_year_month,
    workplace_name,
    business_registration_number,
    workplace_status_code,
    postal_code,
    address_jibun,
    address_road,
    legal_dong_code,
    admin_dong_code,
    sido_code,
    sigungu_code,
    eubmyeondong_code,
    workplace_type_code,
    industry_code,
    industry_name,
    application_date,
    re_registration_date,
    withdrawal_date,
    member_count,
    monthly_notice_amount,
    new_acquisition_count,
    loss_count
)
SELECT 
    data_year_month,
    workplace_name,
    business_registration_number,
    CASE 
        WHEN workplace_status_code ~ '^[0-9]+$' THEN workplace_status_code::INTEGER
        ELSE 1
    END,
    postal_code,
    address_jibun,
    address_road,
    legal_dong_code,
    admin_dong_code,
    sido_code,
    sigungu_code,
    eubmyeondong_code,
    CASE 
        WHEN workplace_type_code ~ '^[0-9]+$' THEN workplace_type_code::INTEGER
        ELSE NULL
    END,
    industry_code,
    industry_name,
    CASE 
        WHEN application_date = '' THEN NULL
        ELSE application_date
    END,
    CASE 
        WHEN re_registration_date = '' THEN NULL
        ELSE re_registration_date
    END,
    CASE 
        WHEN withdrawal_date = '' THEN NULL
        ELSE withdrawal_date
    END,
    CASE 
        WHEN member_count ~ '^[0-9]+$' THEN member_count::INTEGER
        ELSE NULL
    END,
    CASE 
        WHEN monthly_notice_amount ~ '^[0-9]+$' THEN monthly_notice_amount::BIGINT
        ELSE NULL
    END,
    CASE 
        WHEN new_acquisition_count ~ '^[0-9]+$' THEN new_acquisition_count::INTEGER
        ELSE NULL
    END,
    CASE 
        WHEN loss_count ~ '^[0-9]+$' THEN loss_count::INTEGER
        ELSE NULL
    END
FROM temp_national_pension_full
WHERE workplace_name IS NOT NULL AND workplace_name != '';

-- 임포트 결과 확인
SELECT COUNT(*) as total_records FROM national_pension_workplaces;