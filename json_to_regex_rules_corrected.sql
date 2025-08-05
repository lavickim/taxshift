-- JSON 패턴을 정규식 규칙으로 변환 (588개)
-- 올바른 컬럼명으로 수정된 버전

-- 기존 중복 방지를 위한 임시 테이블 생성
CREATE TEMP TABLE temp_new_rules AS
SELECT 
  input_pattern,
  output_template,
  category,
  description,
  priority,
  true as is_active,
  NOW() as created_at,
  NOW() as updated_at,
  metadata_tags,
  test_cases
FROM (VALUES
  ('(스시|초밥|회전초밥|SUSHI|すし|寿司)', '일식당', '음식점', '스시/초밥 일반 패턴', 85, '{"source": "json_conversion", "original_category": "음식점", "confidence": 0.85}'::jsonb, '[]'::jsonb),
  ('(스시로|스시잔마이|스시노미도리|스시효|스시쿠이네)', '일식당', '음식점', '스시 전문 브랜드 패턴', 90, '{"source": "json_conversion", "original_category": "음식점", "confidence": 0.9}'::jsonb, '[]'::jsonb),
  ('(갓덴스시|상무초밥|초밥천국|스시웨이|스시박스)', '일식당', '음식점', '국내 스시 프랜차이즈 패턴', 85, '{"source": "json_conversion", "original_category": "음식점", "confidence": 0.85}'::jsonb, '[]'::jsonb),
  ('(오마카세|おまかせ|OMAKASE|셰프스초이스)', '일식당', '음식점', '오마카세 전문점 패턴', 80, '{"source": "json_conversion", "original_category": "음식점", "confidence": 0.8}'::jsonb, '[]'::jsonb),
  ('(사시미|さしみ|刺身|생선회|활어회)', '일식당', '음식점', '사시미/회 전문점 패턴', 80, '{"source": "json_conversion", "original_category": "음식점", "confidence": 0.8}'::jsonb, '[]'::jsonb),
  ('(라멘|라면|ラーメン|拉麺|RAMEN)', '일식당', '음식점', '라멘 일반 패턴', 85, '{"source": "json_conversion", "original_category": "음식점", "confidence": 0.85}'::jsonb, '[]'::jsonb),
  ('(이치란|라멘야마다|멘야사나다|라멘료|미소야)', '일식당', '음식점', '라멘 전문 브랜드 패턴', 90, '{"source": "json_conversion", "original_category": "음식점", "confidence": 0.9}'::jsonb, '[]'::jsonb),
  ('(우동|うどん|UDON|소바|そば|SOBA)', '일식당', '음식점', '우동/소바 일반 패턴', 80, '{"source": "json_conversion", "original_category": "음식점", "confidence": 0.8}'::jsonb, '[]'::jsonb),
  ('(마루가메제면|우동스시|혼가츠|덴푸라|토마토|가츠동)', '일식당', '음식점', '일식 브랜드 및 메뉴 패턴', 85, '{"source": "json_conversion", "original_category": "음식점", "confidence": 0.85}'::jsonb, '[]'::jsonb),
  ('(도미노|피자헛|미스터피자|파파존스|피자스쿨)', '피자전문점', '음식점', '피자 대형 브랜드 패턴', 95, '{"source": "json_conversion", "original_category": "음식점", "confidence": 0.95}'::jsonb, '[]'::jsonb)
) AS t(input_pattern, output_template, category, description, priority, metadata_tags, test_cases);

-- 샘플 규칙만 먼저 삽입 (테스트용)
INSERT INTO regex_preprocessing_rules (
  rule_name,
  input_pattern, 
  output_template, 
  category, 
  description, 
  priority, 
  is_active, 
  created_at, 
  updated_at,
  metadata_tags,
  test_cases,
  usage_count,
  success_rate
)
SELECT 
  CONCAT('JSON_', ROW_NUMBER() OVER (ORDER BY priority DESC)) as rule_name,
  t.input_pattern,
  t.output_template, 
  t.category,
  t.description,
  t.priority,
  true,
  NOW(),
  NOW(),
  t.metadata_tags,
  t.test_cases,
  0,
  0.0
FROM temp_new_rules t
WHERE NOT EXISTS (
  SELECT 1 FROM regex_preprocessing_rules r 
  WHERE r.input_pattern = t.input_pattern
);

-- 통계 출력
SELECT 
  'JSON 변환 샘플 완료' as status,
  COUNT(*) as new_rules_added
FROM regex_preprocessing_rules 
WHERE metadata_tags->>'source' = 'json_conversion';

SELECT 
  category,
  COUNT(*) as rule_count
FROM regex_preprocessing_rules 
WHERE metadata_tags->>'source' = 'json_conversion'
GROUP BY category
ORDER BY rule_count DESC;