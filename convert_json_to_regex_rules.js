const fs = require('fs');
const path = require('path');

// JSON 패턴을 데이터베이스 정규식 규칙으로 변환하는 스크립트

// 1. JSON 파일들 로드
const dataDir = '/Users/lavickim/_Dev/moneyshift/data';
const jsonFiles = [
  'regpattern.json',
  'regpattern09.json', 
  'regpattern10.json'
];

let allPatterns = [];

// 2. 모든 JSON 파일 로드 및 통합
jsonFiles.forEach(file => {
  try {
    const filePath = path.join(dataDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`✅ ${file}: ${data.length}개 패턴 로드`);
    allPatterns = allPatterns.concat(data);
  } catch (error) {
    console.error(`❌ ${file} 로드 실패:`, error.message);
  }
});

console.log(`📊 총 로드된 패턴: ${allPatterns.length}개`);

// 3. 패턴 품질 분석 및 필터링
const highQualityPatterns = allPatterns.filter(pattern => {
  // 기본 필드 존재 확인
  if (!pattern.pattern || !pattern.replacement || !pattern.category) {
    return false;
  }
  
  // 패턴 길이 검증 (너무 짧거나 긴 패턴 제외)
  if (pattern.pattern.length < 3 || pattern.pattern.length > 200) {
    return false;
  }
  
  // 우선순위 점수 확인 (높은 품질만)
  if (pattern.priority && pattern.priority < 70) {
    return false;
  }
  
  // 활성화된 패턴만
  if (pattern.enabled === false) {
    return false;
  }
  
  return true;
});

console.log(`✨ 고품질 패턴 필터링: ${highQualityPatterns.length}개`);

// 4. 카테고리별 분류
const categoryCounts = {};
highQualityPatterns.forEach(pattern => {
  categoryCounts[pattern.category] = (categoryCounts[pattern.category] || 0) + 1;
});

console.log('\n📈 카테고리별 분포:');
Object.entries(categoryCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([category, count]) => {
    console.log(`  ${category}: ${count}개`);
  });

// 5. 정규식 규칙 SQL 생성
const generateRegexRuleSQL = (patterns) => {
  const sqlStatements = [];
  
  patterns.forEach((pattern, index) => {
    // 카테고리 매핑
    const categoryMapping = {
      '음식점': '음식점',
      '편의점': '편의점', 
      '카페': '카페',
      '치킨': '치킨',
      '피자': '음식점',
      '햄버거': '음식점',
      '중식당': '음식점',
      '일식당': '음식점',
      '양식당': '음식점',
      '한식당': '음식점',
      '베이커리': '카페',
      '아이스크림': '카페',
      '주점': '음식점',
      '대형마트': '대형마트',
      '마트': '대형마트',
      '슈퍼마켓': '편의점',
      '약국': '약국',
      '병원': '병원',
      '주유소': '주유소',
      '교통': '교통운송',
      '온라인쇼핑': '온라인쇼핑',
      '금융': '금융',
      '통신': '통신',
      '교육': '교육',
      '뷰티': '미용',
      '의류': '의류',
      '스포츠': '스포츠',
      '문화': '문화',
      '숙박': '숙박관광',
      '여행': '숙박관광'
    };
    
    const dbCategory = categoryMapping[pattern.category] || '기타';
    
    // SQL 문 생성
    const sql = `INSERT INTO regex_preprocessing_rules (
      pattern, 
      replacement, 
      category, 
      description, 
      priority, 
      is_active, 
      created_at, 
      updated_at,
      metadata
    ) VALUES (
      '${pattern.pattern.replace(/'/g, "''")}',
      '${pattern.replacement.replace(/'/g, "''")}',
      '${dbCategory}',
      '${(pattern.description || '자동 생성된 패턴').replace(/'/g, "''")}',
      ${pattern.priority || 80},
      true,
      NOW(),
      NOW(),
      '{"source": "json_conversion", "original_category": "${pattern.category}", "confidence": ${(pattern.priority || 80) / 100}}'::jsonb
    );`;
    
    sqlStatements.push(sql);
  });
  
  return sqlStatements;
};

// 6. SQL 파일 생성
const sqlStatements = generateRegexRuleSQL(highQualityPatterns);
const sqlContent = `-- JSON 패턴을 정규식 규칙으로 변환 (${highQualityPatterns.length}개)
-- 생성 시간: ${new Date().toISOString()}

-- 기존 중복 방지를 위한 임시 테이블 생성
CREATE TEMP TABLE temp_new_rules AS
SELECT 
  pattern,
  replacement,
  category,
  description,
  priority,
  true as is_active,
  NOW() as created_at,
  NOW() as updated_at,
  metadata
FROM (VALUES
${highQualityPatterns.map((pattern, index) => {
  const categoryMapping = {
    '음식점': '음식점', '편의점': '편의점', '카페': '카페', '치킨': '치킨',
    '피자': '음식점', '햄버거': '음식점', '중식당': '음식점', '일식당': '음식점',
    '양식당': '음식점', '한식당': '음식점', '베이커리': '카페', '아이스크림': '카페',
    '주점': '음식점', '대형마트': '대형마트', '마트': '대형마트', '슈퍼마켓': '편의점',
    '약국': '약국', '병원': '병원', '주유소': '주유소', '교통': '교통운송',
    '온라인쇼핑': '온라인쇼핑', '금융': '금융', '통신': '통신', '교육': '교육',
    '뷰티': '미용', '의류': '의류', '스포츠': '스포츠', '문화': '문화',
    '숙박': '숙박관광', '여행': '숙박관광'
  };
  
  const dbCategory = categoryMapping[pattern.category] || '기타';
  const cleanPattern = pattern.pattern.replace(/'/g, "''");
  const cleanReplacement = pattern.replacement.replace(/'/g, "''");
  const cleanDescription = (pattern.description || '자동 생성된 패턴').replace(/'/g, "''");
  
  return `  ('${cleanPattern}', '${cleanReplacement}', '${dbCategory}', '${cleanDescription}', ${pattern.priority || 80}, '{"source": "json_conversion", "original_category": "${pattern.category}", "confidence": ${(pattern.priority || 80) / 100}}'::jsonb)`;
}).join(',\n')}
) AS t(pattern, replacement, category, description, priority, metadata);

-- 중복되지 않는 규칙만 삽입
INSERT INTO regex_preprocessing_rules (pattern, replacement, category, description, priority, is_active, created_at, updated_at, metadata)
SELECT 
  t.pattern,
  t.replacement, 
  t.category,
  t.description,
  t.priority,
  t.is_active,
  t.created_at,
  t.updated_at,
  t.metadata
FROM temp_new_rules t
WHERE NOT EXISTS (
  SELECT 1 FROM regex_preprocessing_rules r 
  WHERE r.pattern = t.pattern
);

-- 통계 출력
SELECT 
  'JSON 변환 완료' as status,
  COUNT(*) as new_rules_added
FROM regex_preprocessing_rules 
WHERE metadata->>'source' = 'json_conversion';

SELECT 
  category,
  COUNT(*) as rule_count
FROM regex_preprocessing_rules 
WHERE metadata->>'source' = 'json_conversion'
GROUP BY category
ORDER BY rule_count DESC;`;

// 7. SQL 파일 저장
const outputPath = '/Users/lavickim/_Dev/moneyshift/json_to_regex_rules.sql';
fs.writeFileSync(outputPath, sqlContent, 'utf8');

console.log(`\n✅ SQL 변환 완료!`);
console.log(`📁 파일 위치: ${outputPath}`);
console.log(`📊 변환된 규칙 수: ${highQualityPatterns.length}개`);

// 8. 변환 통계 요약
console.log(`\n📈 변환 통계:`);
console.log(`  원본 패턴: ${allPatterns.length}개`);
console.log(`  고품질 패턴: ${highQualityPatterns.length}개`);
console.log(`  필터링률: ${((allPatterns.length - highQualityPatterns.length) / allPatterns.length * 100).toFixed(1)}%`);

// 9. 우선순위별 분포
const priorityDistribution = {};
highQualityPatterns.forEach(pattern => {
  const priority = pattern.priority || 80;
  const range = Math.floor(priority / 10) * 10;
  priorityDistribution[range] = (priorityDistribution[range] || 0) + 1;
});

console.log(`\n🎯 우선순위 분포:`);
Object.entries(priorityDistribution)
  .sort((a, b) => b[0] - a[0])
  .forEach(([range, count]) => {
    console.log(`  ${range}-${parseInt(range) + 9}: ${count}개`);
  });

console.log(`\n🚀 다음 단계: 생성된 SQL 파일을 데이터베이스에 실행하세요!`);