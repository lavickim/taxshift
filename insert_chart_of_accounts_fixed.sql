-- ======================================================
-- AccountCodeConfig의 218개 계정과목을 chart_of_accounts 테이블에 삽입 (수정된 버전)
-- ======================================================

-- 기존 데이터 삭제 (클린 스타트)
DELETE FROM chart_of_accounts;

-- AccountCodeConfig에 정의된 218개 계정과목 삽입
INSERT INTO chart_of_accounts (account_code, account_name, account_type, is_debit_normal, parent_account_id, display_order, is_active, created_at) VALUES

-- ==========자산 계정==========
-- 유동자산
('1100', '현금', '자산', true, null, 1100, true, NOW()),
('1110', '예금', '자산', true, null, 1110, true, NOW()),
('1120', '소액현금', '자산', true, null, 1120, true, NOW()),
('1200', '매출채권', '자산', true, null, 1200, true, NOW()),
('1210', '대손충당금', '자산', false, null, 1210, true, NOW()),
('1220', '받을어음', '자산', true, null, 1220, true, NOW()),
('1230', '선급금', '자산', true, null, 1230, true, NOW()),
('1300', '재고자산', '자산', true, null, 1300, true, NOW()),
('1310', '사무용품', '자산', true, null, 1310, true, NOW()),
('1320', '선급비용', '자산', true, null, 1320, true, NOW()),
('1400', '단기투자', '자산', true, null, 1400, true, NOW()),

-- 기타 유동자산
('1410', '미수수익', '자산', true, null, 1410, true, NOW()),
('1420', '가지급금', '자산', true, null, 1420, true, NOW()),
('1430', '구매예치금', '자산', true, null, 1430, true, NOW()),
('1440', '부가세환급금', '자산', true, null, 1440, true, NOW()),
('1450', '원천세환급금', '자산', true, null, 1450, true, NOW()),

-- 비유동자산
('1500', '장기투자', '자산', true, null, 1500, true, NOW()),
('1510', '투자유가증권', '자산', true, null, 1510, true, NOW()),
('1520', '투자부동산', '자산', true, null, 1520, true, NOW()),
('1530', '종속회사투자', '자산', true, null, 1530, true, NOW()),
('1540', '합작투자', '자산', true, null, 1540, true, NOW()),

-- 유형자산
('1600', '건물', '자산', true, null, 1600, true, NOW()),
('1610', '건물감가상각누계액', '자산', false, null, 1610, true, NOW()),
('1620', '토지', '자산', true, null, 1620, true, NOW()),
('1630', '건설중인자산', '자산', true, null, 1630, true, NOW()),
('1640', '기계장치', '자산', true, null, 1640, true, NOW()),
('1650', '기계장치감가상각누계액', '자산', false, null, 1650, true, NOW()),
('1660', '차량운반구', '자산', true, null, 1660, true, NOW()),
('1670', '차량운반구감가상각누계액', '자산', false, null, 1670, true, NOW()),
('1680', '집기비품', '자산', true, null, 1680, true, NOW()),
('1690', '집기비품감가상각누계액', '자산', false, null, 1690, true, NOW()),

-- 무형자산
('1700', '무형자산', '자산', true, null, 1700, true, NOW()),
('1710', '소프트웨어', '자산', true, null, 1710, true, NOW()),
('1720', '특허권', '자산', true, null, 1720, true, NOW()),
('1730', '상표권', '자산', true, null, 1730, true, NOW()),
('1740', '저작권', '자산', true, null, 1740, true, NOW()),
('1750', '영업권', '자산', true, null, 1750, true, NOW()),
('1760', '개발비', '자산', true, null, 1760, true, NOW()),
('1770', '고객관계', '자산', true, null, 1770, true, NOW()),
('1780', '무형자산상각누계액', '자산', false, null, 1780, true, NOW()),
('1790', '연구비', '자산', true, null, 1790, true, NOW()),

-- 기타 비유동자산
('1800', '보증금', '자산', true, null, 1800, true, NOW()),
('1810', '장기선급비용', '자산', true, null, 1810, true, NOW()),
('1820', '장기채권', '자산', true, null, 1820, true, NOW()),
('1830', '이연법인세자산', '자산', true, null, 1830, true, NOW()),
('1840', '투자부동산', '자산', true, null, 1840, true, NOW()),
('1850', '생물자산', '자산', true, null, 1850, true, NOW()),
('1860', '지급보증금', '자산', true, null, 1860, true, NOW()),
('1870', '클럽회원권', '자산', true, null, 1870, true, NOW()),
('1880', '미술품', '자산', true, null, 1880, true, NOW()),
('1890', '기타비유동자산', '자산', true, null, 1890, true, NOW()),

-- ==========부채 계정==========
-- 유동부채
('2100', '매입채무', '부채', false, null, 2100, true, NOW()),
('2110', '지급어음', '부채', false, null, 2110, true, NOW()),
('2120', '단기차입금', '부채', false, null, 2120, true, NOW()),
('2130', '미지급비용', '부채', false, null, 2130, true, NOW()),
('2140', '미지급법인세', '부채', false, null, 2140, true, NOW()),
('2150', '부가세예수금', '부채', false, null, 2150, true, NOW()),
('2160', '예수금', '부채', false, null, 2160, true, NOW()),
('2170', '선수금', '부채', false, null, 2170, true, NOW()),
('2180', '유동성장기부채', '부채', false, null, 2180, true, NOW()),
('2181', '미지급급여', '부채', false, null, 2181, true, NOW()),
('2182', '미지급이자', '부채', false, null, 2182, true, NOW()),
('2183', '미지급공과금', '부채', false, null, 2183, true, NOW()),
('2184', '미지급배당금', '부채', false, null, 2184, true, NOW()),
('2185', '고객예치금', '부채', false, null, 2185, true, NOW()),
('2186', '품질보증충당부채', '부채', false, null, 2186, true, NOW()),
('2187', '판매세예수금', '부채', false, null, 2187, true, NOW()),
('2188', '사회보험료예수금', '부채', false, null, 2188, true, NOW()),
('2190', '기타유동부채', '부채', false, null, 2190, true, NOW()),

-- 비유동부채
('2200', '장기차입금', '부채', false, null, 2200, true, NOW()),
('2210', '회사채', '부채', false, null, 2210, true, NOW()),
('2220', '퇴직급여충당부채', '부채', false, null, 2220, true, NOW()),
('2230', '이연법인세부채', '부채', false, null, 2230, true, NOW()),
('2240', '장기리스부채', '부채', false, null, 2240, true, NOW()),
('2250', '자산해체충당부채', '부채', false, null, 2250, true, NOW()),
('2260', '환경복구충당부채', '부채', false, null, 2260, true, NOW()),
('2270', '소송충당부채', '부채', false, null, 2270, true, NOW()),
('2280', '구조조정충당부채', '부채', false, null, 2280, true, NOW()),
('2290', '기타비유동부채', '부채', false, null, 2290, true, NOW()),

-- ==========자본 계정==========
-- 자본금 관련
('3100', '자본금', '자본', false, null, 3100, true, NOW()),
('3110', '우선주', '자본', false, null, 3110, true, NOW()),
('3120', '보통주', '자본', false, null, 3120, true, NOW()),
('3130', '신주인수권', '자본', false, null, 3130, true, NOW()),
('3140', '주식선택권', '자본', false, null, 3140, true, NOW()),

-- 자본잉여금
('3200', '자본잉여금', '자본', false, null, 3200, true, NOW()),
('3210', '재평가자본잉여금', '자본', false, null, 3210, true, NOW()),
('3220', '합병자본잉여금', '자본', false, null, 3220, true, NOW()),
('3230', '자기주식처분이익', '자본', false, null, 3230, true, NOW()),
('3240', '전환자본잉여금', '자본', false, null, 3240, true, NOW()),

-- 이익잉여금
('3300', '이익잉여금', '자본', false, null, 3300, true, NOW()),
('3310', '법정적립금', '자본', false, null, 3310, true, NOW()),
('3320', '임의적립금', '자본', false, null, 3320, true, NOW()),
('3330', '특별적립금', '자본', false, null, 3330, true, NOW()),
('3340', '미처분이익잉여금', '자본', false, null, 3340, true, NOW()),

-- 기타 자본항목
('3400', '당기순이익', '자본', false, null, 3400, true, NOW()),
('3410', '자기주식', '자본', true, null, 3410, true, NOW()),
('3420', '기타포괄손익누계액', '자본', false, null, 3420, true, NOW()),
('3430', '외화환산조정', '자본', false, null, 3430, true, NOW()),
('3440', '매도가능증권평가손익', '자본', false, null, 3440, true, NOW()),
('3450', '재평가적립금', '자본', false, null, 3450, true, NOW()),
('3460', '비지배지분', '자본', false, null, 3460, true, NOW()),

-- ==========수익 계정==========
-- 영업수익
('4100', '매출액', '수익', false, null, 4100, true, NOW()),
('4110', '용역수익', '수익', false, null, 4110, true, NOW()),
('4120', '수수료수익', '수익', false, null, 4120, true, NOW()),
('4130', '가맹수익', '수익', false, null, 4130, true, NOW()),
('4140', '회원수익', '수익', false, null, 4140, true, NOW()),
('4150', '구독수익', '수익', false, null, 4150, true, NOW()),
('4160', '컨설팅수익', '수익', false, null, 4160, true, NOW()),
('4170', '교육수익', '수익', false, null, 4170, true, NOW()),
('4180', '유지보수수익', '수익', false, null, 4180, true, NOW()),
('4190', '설치수익', '수익', false, null, 4190, true, NOW()),

-- 기타 영업수익
('4200', '임대료수익', '수익', false, null, 4200, true, NOW()),
('4210', '로열티수익', '수익', false, null, 4210, true, NOW()),
('4220', '라이선스수익', '수익', false, null, 4220, true, NOW()),
('4230', '특허수익', '수익', false, null, 4230, true, NOW()),
('4240', '상표수익', '수익', false, null, 4240, true, NOW()),

-- 영업외수익
('4300', '이자수익', '수익', false, null, 4300, true, NOW()),
('4310', '배당금수익', '수익', false, null, 4310, true, NOW()),
('4320', '자산처분이익', '수익', false, null, 4320, true, NOW()),
('4330', '투자자산처분이익', '수익', false, null, 4330, true, NOW()),
('4340', '외환차익', '수익', false, null, 4340, true, NOW()),
('4350', '정부보조금', '수익', false, null, 4350, true, NOW()),
('4360', '보험금수익', '수익', false, null, 4360, true, NOW()),
('4370', '충당부채환입', '수익', false, null, 4370, true, NOW()),
('4380', '잡수익', '수익', false, null, 4380, true, NOW()),
('4390', '영업외수익', '수익', false, null, 4390, true, NOW()),

-- ==========비용 계정==========
-- 매출원가
('5100', '매출원가', '비용', true, null, 5100, true, NOW()),
('5110', '재료비', '비용', true, null, 5110, true, NOW()),
('5120', '노무비', '비용', true, null, 5120, true, NOW()),
('5130', '제조경비', '비용', true, null, 5130, true, NOW()),

-- 판매비와 관리비 - 인건비 관련
('5201', '임원급여', '비용', true, null, 5201, true, NOW()),
('5202', '직원급여', '비용', true, null, 5202, true, NOW()),
('5203', '퇴직급여', '비용', true, null, 5203, true, NOW()),
('5204', '복리후생비', '비용', true, null, 5204, true, NOW()),
('5205', '임원상여', '비용', true, null, 5205, true, NOW()),
('5206', '직원상여', '비용', true, null, 5206, true, NOW()),
('5207', '시간외근무수당', '비용', true, null, 5207, true, NOW()),
('5208', '식대', '비용', true, null, 5208, true, NOW()),
('5209', '교통비', '비용', true, null, 5209, true, NOW()),
('5210', '국민연금', '비용', true, null, 5210, true, NOW()),

-- 사업관련 비용
('5211', '여비교통비', '비용', true, null, 5211, true, NOW()),
('5212', '접대비', '비용', true, null, 5212, true, NOW()),
('5213', '통신비', '비용', true, null, 5213, true, NOW()),
('5214', '수도광열비', '비용', true, null, 5214, true, NOW()),
('5215', '지급임차료', '비용', true, null, 5215, true, NOW()),
('5216', '보험료', '비용', true, null, 5216, true, NOW()),
('5217', '차량유지비', '비용', true, null, 5217, true, NOW()),
('5218', '운반비', '비용', true, null, 5218, true, NOW()),
('5219', '유류비', '비용', true, null, 5219, true, NOW()),
('5220', '주차료및통행료', '비용', true, null, 5220, true, NOW()),

-- 사무 및 관리비용
('5221', '소모품비', '비용', true, null, 5221, true, NOW()),
('5222', '도서인쇄비', '비용', true, null, 5222, true, NOW()),
('5223', '우편료', '비용', true, null, 5223, true, NOW()),
('5224', '소모용품', '비용', true, null, 5224, true, NOW()),
('5225', '청소비', '비용', true, null, 5225, true, NOW()),
('5226', '경비비', '비용', true, null, 5226, true, NOW()),
('5227', '시설유지비', '비용', true, null, 5227, true, NOW()),
('5228', '수선비', '비용', true, null, 5228, true, NOW()),
('5229', '구독료', '비용', true, null, 5229, true, NOW()),
('5230', '가입비', '비용', true, null, 5230, true, NOW()),

-- 세금 및 공과금
('5231', '세금과공과', '비용', true, null, 5231, true, NOW()),
('5232', '재산세', '비용', true, null, 5232, true, NOW()),
('5233', '취득세', '비용', true, null, 5233, true, NOW()),
('5234', '등록세', '비용', true, null, 5234, true, NOW()),
('5235', '사업자등록세', '비용', true, null, 5235, true, NOW()),
('5236', '자동차세', '비용', true, null, 5236, true, NOW()),
('5237', '인지세', '비용', true, null, 5237, true, NOW()),
('5238', '환경개선부담금', '비용', true, null, 5238, true, NOW()),
('5239', '지방소득세', '비용', true, null, 5239, true, NOW()),
('5240', '기타세금', '비용', true, null, 5240, true, NOW()),

-- 감가상각 및 상각비
('5241', '감가상각비', '비용', true, null, 5241, true, NOW()),
('5242', '건물감가상각비', '비용', true, null, 5242, true, NOW()),
('5243', '차량감가상각비', '비용', true, null, 5243, true, NOW()),
('5244', '집기감가상각비', '비용', true, null, 5244, true, NOW()),
('5245', '기계감가상각비', '비용', true, null, 5245, true, NOW()),
('5246', '소프트웨어상각비', '비용', true, null, 5246, true, NOW()),
('5247', '무형자산상각비', '비용', true, null, 5247, true, NOW()),
('5248', '자원감모비', '비용', true, null, 5248, true, NOW()),
('5249', '손상차손', '비용', true, null, 5249, true, NOW()),
('5250', '자산제거비용', '비용', true, null, 5250, true, NOW()),

-- 전문서비스 및 수수료
('5251', '지급수수료', '비용', true, null, 5251, true, NOW()),
('5252', '전문용역비', '비용', true, null, 5252, true, NOW()),
('5253', '감사보수', '비용', true, null, 5253, true, NOW()),
('5254', '세무용역비', '비용', true, null, 5254, true, NOW()),
('5255', '컨설팅비', '비용', true, null, 5255, true, NOW()),
('5256', '회계용역비', '비용', true, null, 5256, true, NOW()),
('5257', '설계비', '비용', true, null, 5257, true, NOW()),
('5258', '시스템개발비', '비용', true, null, 5258, true, NOW()),
('5259', '외주비', '비용', true, null, 5259, true, NOW()),
('5260', '기술지원비', '비용', true, null, 5260, true, NOW()),

-- 마케팅 및 판촉
('5261', '광고선전비', '비용', true, null, 5261, true, NOW()),
('5262', '판촉비', '비용', true, null, 5262, true, NOW()),
('5263', '마케팅비', '비용', true, null, 5263, true, NOW()),
('5264', '전시비', '비용', true, null, 5264, true, NOW()),
('5265', '견본비', '비용', true, null, 5265, true, NOW()),
('5266', '카탈로그비', '비용', true, null, 5266, true, NOW()),
('5267', '웹사이트유지비', '비용', true, null, 5267, true, NOW()),
('5268', '소셜미디어비', '비용', true, null, 5268, true, NOW()),
('5269', '행사비', '비용', true, null, 5269, true, NOW()),
('5270', '고객서비스비', '비용', true, null, 5270, true, NOW()),

-- 교육 및 연구개발
('5271', '교육훈련비', '비용', true, null, 5271, true, NOW()),
('5272', '연구개발비', '비용', true, null, 5272, true, NOW()),
('5273', '특허비', '비용', true, null, 5273, true, NOW()),
('5274', '라이선스비', '비용', true, null, 5274, true, NOW()),
('5275', '교육자료비', '비용', true, null, 5275, true, NOW()),
('5276', '컨퍼런스비', '비용', true, null, 5276, true, NOW()),
('5277', '세미나비', '비용', true, null, 5277, true, NOW()),
('5278', '자격증비', '비용', true, null, 5278, true, NOW()),
('5279', '기술도서비', '비용', true, null, 5279, true, NOW()),
('5280', '소프트웨어라이선스', '비용', true, null, 5280, true, NOW()),

-- 영업외 비용
('5310', '이자비용', '비용', true, null, 5310, true, NOW()),
('5320', '자산처분손실', '비용', true, null, 5320, true, NOW()),
('5330', '대손상각비', '비용', true, null, 5330, true, NOW()),
('5340', '외환차손', '비용', true, null, 5340, true, NOW()),
('5350', '기부금', '비용', true, null, 5350, true, NOW()),
('5360', '영업외비용', '비용', true, null, 5360, true, NOW()),

-- 법인세 등
('5400', '법인세비용', '비용', true, null, 5400, true, NOW()),
('5410', '이연법인세비용', '비용', true, null, 5410, true, NOW());

-- 결과 확인
SELECT 
    account_type,
    COUNT(*) as count,
    MIN(account_code) as min_code,
    MAX(account_code) as max_code
FROM chart_of_accounts 
GROUP BY account_type 
ORDER BY account_type;

SELECT '총 계정과목 수: ' || COUNT(*) as summary FROM chart_of_accounts;