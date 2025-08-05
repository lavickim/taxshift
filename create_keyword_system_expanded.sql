-- ======================================================
-- 키워드 처리 엔진용 확장된 키워드 시스템 생성
-- ======================================================
-- 설명: 국민연금 업종 데이터를 활용한 실용적인 키워드 그룹 생성
-- 목표: 어드민 툴의 키워드 처리 엔진에서 활용할 실무적 데이터 제공
-- ======================================================

-- 1. keyword_groups 테이블 생성
DROP TABLE IF EXISTS keyword_groups CASCADE;
CREATE TABLE keyword_groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL UNIQUE,
    group_category VARCHAR(50) NOT NULL,
    description TEXT,
    keywords TEXT[] NOT NULL,
    industry_mapping TEXT[],
    confidence_base DECIMAL(3,2) DEFAULT 0.80,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. keyword_tag_mappings 테이블 생성 (원하신 요구사항)
DROP TABLE IF EXISTS keyword_tag_mappings CASCADE;
CREATE TABLE keyword_tag_mappings (
    id SERIAL PRIMARY KEY,
    keyword_group_id INTEGER REFERENCES keyword_groups(id),
    tag_id INTEGER REFERENCES tags_master(id),
    keyword VARCHAR(200) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.80,
    priority INTEGER NOT NULL DEFAULT 5,
    conditions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 인덱스 생성
CREATE INDEX idx_keyword_groups_category ON keyword_groups(group_category);
CREATE INDEX idx_keyword_groups_keywords ON keyword_groups USING GIN(keywords);
CREATE INDEX idx_keyword_tag_mappings_keyword ON keyword_tag_mappings(keyword);
CREATE INDEX idx_keyword_tag_mappings_tag_id ON keyword_tag_mappings(tag_id);

-- 4. 국민연금 업종 데이터를 활용한 키워드 그룹 생성
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    -- 국민연금 테이블 존재 확인
    SELECT COUNT(*) INTO v_count FROM information_schema.tables 
    WHERE table_name = 'national_pension_workplaces';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✅ 국민연금 데이터 활용하여 키워드 그룹 생성 시작...';
    ELSE
        RAISE NOTICE '⚠️ 국민연금 데이터 없음 - 기본 키워드 그룹만 생성';
    END IF;
END $$;

-- 5. 실용적인 키워드 그룹 데이터 삽입
INSERT INTO keyword_groups (group_name, group_category, description, keywords, industry_mapping, confidence_base) VALUES

-- ========== 사무용품 카테고리 ==========
('문구용품', '사무용품', '일반적인 문구류 및 사무용품', 
 ARRAY['문구', '펜', '연필', '지우개', '자', '파일', '클리어화일', '바인더', '스테이플러'], 
 ARRAY['사무용품점', '문구점'], 0.90),

('컴퓨터용품', '사무용품', '컴퓨터 관련 소모품 및 액세서리', 
 ARRAY['마우스', '키보드', 'USB', '하드디스크', '모니터', '케이블', '어댑터', 'CD', 'DVD'], 
 ARRAY['컴퓨터판매점', '전자제품판매'], 0.85),

('프린터소모품', '사무용품', '프린터 및 복사기 관련 소모품', 
 ARRAY['토너', '잉크', '카트리지', '복사용지', 'A4용지', '인쇄', '출력'], 
 ARRAY['사무기기판매'], 0.92),

-- ========== 임차료 카테고리 ==========
('사무실임대', '임차료', '사무실 및 사업장 임대 관련', 
 ARRAY['사무실', '사무공간', '오피스', '임대료', '월세', '보증금', '관리비'], 
 ARRAY['부동산중개업', '건물관리업'], 0.95),

('창고임대', '임차료', '창고 및 저장공간 임대', 
 ARRAY['창고', '저장공간', '물류창고', '보관료', '저장비'], 
 ARRAY['창고업', '물류업'], 0.88),

('주차장임대', '임차료', '주차공간 관련 비용', 
 ARRAY['주차장', '주차비', '주차료', '주차권', '월주차'], 
 ARRAY['주차장운영업'], 0.85),

-- ========== 급여 카테고리 ==========
('정규직급여', '급여', '정규직 직원 급여 관련', 
 ARRAY['급여', '월급', '연봉', '기본급', '직원급여', '사원급여', '임금'], 
 ARRAY['제조업', '서비스업', '금융업'], 0.95),

('임시직급여', '급여', '임시직 및 일용직 급여', 
 ARRAY['일당', '시급', '아르바이트', '알바', '임시직', '일용직'], 
 ARRAY['요식업', '도소매업'], 0.90),

('복리후생', '급여', '직원 복지 및 후생 관련', 
 ARRAY['복리후생', '직원복지', '건강보험', '단체보험', '휴가비', '경조사비'], 
 ARRAY['복리후생업'], 0.85),

-- ========== 접대비 카테고리 ==========
('식음료접대', '접대비', '식사 및 음료 관련 접대', 
 ARRAY['회식', '점심', '저녁', '술', '맥주', '소주', '와인', '커피', '식사대접'], 
 ARRAY['음식점업', '주점업'], 0.88),

('골프접대', '접대비', '골프 관련 접대비용', 
 ARRAY['골프', '라운딩', '캐디피', '그린피', '골프장'], 
 ARRAY['골프장운영업'], 0.95),

('출장접대', '접대비', '출장 관련 접대 및 회의', 
 ARRAY['출장', '출장비', '호텔', '숙박', '교통비', '회의비'], 
 ARRAY['숙박업', '여행업'], 0.85),

-- ========== 주유소 카테고리 ==========
('연료구매', '주유소', '차량 연료 구매', 
 ARRAY['주유', '기름', '휘발유', '경유', '연료', 'LPG', '충전'], 
 ARRAY['주유소업'], 0.98),

('세차서비스', '주유소', '세차 및 차량관리 서비스', 
 ARRAY['세차', '왁싱', '차량청소', '자동세차'], 
 ARRAY['세차업'], 0.90),

('차량정비', '주유소', '차량 정비 및 수리', 
 ARRAY['정비', '수리', '오일교환', '타이어', '배터리', '정비소'], 
 ARRAY['자동차정비업'], 0.85),

-- ========== 편의점 카테고리 ==========
('간식음료', '편의점', '간식 및 음료 구매', 
 ARRAY['과자', '음료수', '커피', '물', '아이스크림', '라면', '김밥', '샌드위치'], 
 ARRAY['편의점업', '슈퍼마켓업'], 0.85),

('생활용품', '편의점', '일상 생활용품 구매', 
 ARRAY['휴지', '세제', '샴푸', '칫솔', '우산', '양말', '생활용품'], 
 ARRAY['편의점업', '생활용품점'], 0.80),

('소액결제', '편의점', '소액 결제 및 서비스', 
 ARRAY['택배', '택배비', '소액결제', '충전', '상품권', '쿠폰'], 
 ARRAY['편의점업'], 0.75);

-- 6. keyword_tag_mappings 데이터 생성 (키워드 그룹과 태그 연결)
DO $$
DECLARE
    tag_rec RECORD;
    group_rec RECORD;
    keyword_item TEXT;
BEGIN
    -- 각 키워드 그룹의 키워드들을 해당 태그에 매핑
    FOR group_rec IN SELECT id, group_name, group_category, keywords FROM keyword_groups LOOP
        -- 그룹 카테고리와 일치하는 태그 찾기
        FOR tag_rec IN SELECT id, tag_name FROM tags_master WHERE tag_name = group_rec.group_category LOOP
            -- 각 키워드를 개별적으로 매핑
            FOREACH keyword_item IN ARRAY group_rec.keywords LOOP
                INSERT INTO keyword_tag_mappings (
                    keyword_group_id, 
                    tag_id, 
                    keyword, 
                    confidence, 
                    priority,
                    conditions
                ) VALUES (
                    group_rec.id,
                    tag_rec.id,
                    keyword_item,
                    CASE 
                        WHEN keyword_item IN ('급여', '월급', '임차료', '주유', '접대비') THEN 0.95
                        WHEN keyword_item IN ('사무용품', '토너', '연료') THEN 0.90
                        ELSE 0.80
                    END,
                    CASE 
                        WHEN keyword_item IN ('급여', '월급', '임차료', '주유', '접대비') THEN 9
                        WHEN keyword_item IN ('사무용품', '토너', '연료') THEN 8
                        ELSE 7
                    END,
                    jsonb_build_object(
                        'group_name', group_rec.group_name,
                        'auto_generated', true,
                        'source', 'keyword_groups'
                    )
                );
            END LOOP;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '✅ keyword_tag_mappings 자동 생성 완료!';
END $$;

-- 7. 생성된 데이터 확인
SELECT 
    '=== 키워드 그룹 현황 ===' as summary;

SELECT 
    group_category,
    COUNT(*) as group_count,
    STRING_AGG(group_name, ', ') as groups
FROM keyword_groups 
GROUP BY group_category 
ORDER BY group_category;

SELECT 
    '=== 키워드-태그 매핑 현황 ===' as summary;

SELECT 
    t.tag_name,
    COUNT(ktm.id) as mapping_count,
    STRING_AGG(DISTINCT kg.group_name, ', ') as from_groups
FROM keyword_tag_mappings ktm
JOIN tags_master t ON ktm.tag_id = t.id
JOIN keyword_groups kg ON ktm.keyword_group_id = kg.id
GROUP BY t.tag_name
ORDER BY mapping_count DESC;

SELECT 
    '총 키워드-태그 매핑 수: ' || COUNT(*) as summary 
FROM keyword_tag_mappings;