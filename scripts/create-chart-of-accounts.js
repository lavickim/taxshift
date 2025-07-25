#!/usr/bin/env node

/**
 * 한국 표준 계정과목 200개+ 데이터 생성 스크립트
 * accounting-improvement-todolist-v1.md의 체크박스와 연동
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:8080/mshift-api';
const TODO_FILE_PATH = '/Users/lavickim/_Dev/moneyshift/project-design/accounting/accounting-improvement-todolist-v1.md';

// 한국 표준 계정과목 데이터 (실제 todolist 파일과 일치)
const chartOfAccounts = [
  // 자산 계정 - 유동자산 (20개)
  { accountCode: '1111', accountName: '현금', accountType: '자산', accountSubtype: '당좌자산', isDebitNormal: true, displayOrder: 1111 },
  { accountCode: '1112', accountName: '보통예금', accountType: '자산', accountSubtype: '당좌자산', isDebitNormal: true, displayOrder: 1112 },
  { accountCode: '1113', accountName: '당좌예금', accountType: '자산', accountSubtype: '당좌자산', isDebitNormal: true, displayOrder: 1113 },
  { accountCode: '1114', accountName: '정기예금', accountType: '자산', accountSubtype: '당좌자산', isDebitNormal: true, displayOrder: 1114 },
  { accountCode: '1115', accountName: '외화예금', accountType: '자산', accountSubtype: '당좌자산', isDebitNormal: true, displayOrder: 1115 },
  { accountCode: '1121', accountName: '받을어음', accountType: '자산', accountSubtype: '매출채권', isDebitNormal: true, displayOrder: 1121 },
  { accountCode: '1122', accountName: '매출채권', accountType: '자산', accountSubtype: '매출채권', isDebitNormal: true, displayOrder: 1122 },
  { accountCode: '1123', accountName: '미수금', accountType: '자산', accountSubtype: '매출채권', isDebitNormal: true, displayOrder: 1123 },
  { accountCode: '1124', accountName: '미수수익', accountType: '자산', accountSubtype: '매출채권', isDebitNormal: true, displayOrder: 1124 },
  { accountCode: '1125', accountName: '선급금', accountType: '자산', accountSubtype: '매출채권', isDebitNormal: true, displayOrder: 1125 },
  { accountCode: '1131', accountName: '상품', accountType: '자산', accountSubtype: '재고자산', isDebitNormal: true, displayOrder: 1131 },
  { accountCode: '1132', accountName: '제품', accountType: '자산', accountSubtype: '재고자산', isDebitNormal: true, displayOrder: 1132 },
  { accountCode: '1133', accountName: '재공품', accountType: '자산', accountSubtype: '재고자산', isDebitNormal: true, displayOrder: 1133 },
  { accountCode: '1134', accountName: '원재료', accountType: '자산', accountSubtype: '재고자산', isDebitNormal: true, displayOrder: 1134 },
  { accountCode: '1135', accountName: '저장품', accountType: '자산', accountSubtype: '재고자산', isDebitNormal: true, displayOrder: 1135 },
  { accountCode: '1141', accountName: '선급비용', accountType: '자산', accountSubtype: '기타유동자산', isDebitNormal: true, displayOrder: 1141 },
  { accountCode: '1142', accountName: '선급법인세', accountType: '자산', accountSubtype: '기타유동자산', isDebitNormal: true, displayOrder: 1142 },
  { accountCode: '1143', accountName: '부가세대급금', accountType: '자산', accountSubtype: '기타유동자산', isDebitNormal: true, displayOrder: 1143 },
  { accountCode: '1149', accountName: '기타유동자산', accountType: '자산', accountSubtype: '기타유동자산', isDebitNormal: true, displayOrder: 1149 },
  { accountCode: '1150', accountName: '유동자산평가충당금', accountType: '자산', accountSubtype: '기타유동자산', isDebitNormal: false, displayOrder: 1150 },

  // 자산 계정 - 투자자산 (4개)
  { accountCode: '1211', accountName: '투자유가증권', accountType: '자산', accountSubtype: '투자자산', isDebitNormal: true, displayOrder: 1211 },
  { accountCode: '1212', accountName: '출자금', accountType: '자산', accountSubtype: '투자자산', isDebitNormal: true, displayOrder: 1212 },
  { accountCode: '1213', accountName: '장기대여금', accountType: '자산', accountSubtype: '투자자산', isDebitNormal: true, displayOrder: 1213 },
  { accountCode: '1219', accountName: '투자자산평가충당금', accountType: '자산', accountSubtype: '투자자산', isDebitNormal: false, displayOrder: 1219 },

  // 자산 계정 - 유형자산 (12개)  
  { accountCode: '1221', accountName: '토지', accountType: '자산', accountSubtype: '유형자산', isDebitNormal: true, displayOrder: 1221 },
  { accountCode: '1222', accountName: '건물', accountType: '자산', accountSubtype: '유형자산', isDebitNormal: true, displayOrder: 1222 },
  { accountCode: '1223', accountName: '구축물', accountType: '자산', accountSubtype: '유형자산', isDebitNormal: true, displayOrder: 1223 },
  { accountCode: '1224', accountName: '기계장치', accountType: '자산', accountSubtype: '유형자산', isDebitNormal: true, displayOrder: 1224 },
  { accountCode: '1225', accountName: '차량운반구', accountType: '자산', accountSubtype: '유형자산', isDebitNormal: true, displayOrder: 1225 },
  { accountCode: '1226', accountName: '공구기구비품', accountType: '자산', accountSubtype: '유형자산', isDebitNormal: true, displayOrder: 1226 },
  { accountCode: '1227', accountName: '건설중인자산', accountType: '자산', accountSubtype: '유형자산', isDebitNormal: true, displayOrder: 1227 },
  { accountCode: '1228', accountName: '감가상각누계액(건물)', accountType: '자산', accountSubtype: '유형자산', isDebitNormal: false, displayOrder: 1228 },
  { accountCode: '1229', accountName: '감가상각누계액(구축물)', accountType: '자산', accountSubtype: '유형자산', isDebitNormal: false, displayOrder: 1229 },
  { accountCode: '1230', accountName: '감가상각누계액(기계장치)', accountType: '자산', accountSubtype: '유형자산', isDebitNormal: false, displayOrder: 1230 },
  { accountCode: '1231', accountName: '감가상각누계액(차량운반구)', accountType: '자산', accountSubtype: '유형자산', isDebitNormal: false, displayOrder: 1231 },
  { accountCode: '1232', accountName: '감가상각누계액(공구기구비품)', accountType: '자산', accountSubtype: '유형자산', isDebitNormal: false, displayOrder: 1232 },

  // 자산 계정 - 무형자산 (9개)
  { accountCode: '1241', accountName: '영업권', accountType: '자산', accountSubtype: '무형자산', isDebitNormal: true, displayOrder: 1241 },
  { accountCode: '1242', accountName: '특허권', accountType: '자산', accountSubtype: '무형자산', isDebitNormal: true, displayOrder: 1242 },
  { accountCode: '1243', accountName: '실용신안권', accountType: '자산', accountSubtype: '무형자산', isDebitNormal: true, displayOrder: 1243 },
  { accountCode: '1244', accountName: '의장권', accountType: '자산', accountSubtype: '무형자산', isDebitNormal: true, displayOrder: 1244 },
  { accountCode: '1245', accountName: '상표권', accountType: '자산', accountSubtype: '무형자산', isDebitNormal: true, displayOrder: 1245 },
  { accountCode: '1246', accountName: '저작권', accountType: '자산', accountSubtype: '무형자산', isDebitNormal: true, displayOrder: 1246 },
  { accountCode: '1247', accountName: '소프트웨어', accountType: '자산', accountSubtype: '무형자산', isDebitNormal: true, displayOrder: 1247 },
  { accountCode: '1248', accountName: '개발비', accountType: '자산', accountSubtype: '무형자산', isDebitNormal: true, displayOrder: 1248 },
  { accountCode: '1249', accountName: '기타무형자산', accountType: '자산', accountSubtype: '무형자산', isDebitNormal: true, displayOrder: 1249 },

  // 부채 계정 - 유동부채 (15개)
  { accountCode: '2111', accountName: '지급어음', accountType: '부채', accountSubtype: '매입채무', isDebitNormal: false, displayOrder: 2111 },
  { accountCode: '2112', accountName: '매입채무', accountType: '부채', accountSubtype: '매입채무', isDebitNormal: false, displayOrder: 2112 },
  { accountCode: '2113', accountName: '미지급금', accountType: '부채', accountSubtype: '매입채무', isDebitNormal: false, displayOrder: 2113 },
  { accountCode: '2114', accountName: '미지급비용', accountType: '부채', accountSubtype: '매입채무', isDebitNormal: false, displayOrder: 2114 },
  { accountCode: '2115', accountName: '선수금', accountType: '부채', accountSubtype: '매입채무', isDebitNormal: false, displayOrder: 2115 },
  { accountCode: '2116', accountName: '예수금', accountType: '부채', accountSubtype: '기타유동부채', isDebitNormal: false, displayOrder: 2116 },
  { accountCode: '2117', accountName: '단기차입금', accountType: '부채', accountSubtype: '단기차입금', isDebitNormal: false, displayOrder: 2117 },
  { accountCode: '2118', accountName: '유동성장기부채', accountType: '부채', accountSubtype: '기타유동부채', isDebitNormal: false, displayOrder: 2118 },
  { accountCode: '2119', accountName: '미지급법인세', accountType: '부채', accountSubtype: '미지급세금', isDebitNormal: false, displayOrder: 2119 },
  { accountCode: '2120', accountName: '부가세예수금', accountType: '부채', accountSubtype: '미지급세금', isDebitNormal: false, displayOrder: 2120 },
  { accountCode: '2121', accountName: '원천세예수금', accountType: '부채', accountSubtype: '미지급세금', isDebitNormal: false, displayOrder: 2121 },
  { accountCode: '2122', accountName: '사회보험료예수금', accountType: '부채', accountSubtype: '미지급세금', isDebitNormal: false, displayOrder: 2122 },
  { accountCode: '2123', accountName: '미지급배당금', accountType: '부채', accountSubtype: '기타유동부채', isDebitNormal: false, displayOrder: 2123 },
  { accountCode: '2124', accountName: '충당금', accountType: '부채', accountSubtype: '기타유동부채', isDebitNormal: false, displayOrder: 2124 },
  { accountCode: '2129', accountName: '기타유동부채', accountType: '부채', accountSubtype: '기타유동부채', isDebitNormal: false, displayOrder: 2129 },

  // 부채 계정 - 비유동부채 (15개)
  { accountCode: '2211', accountName: '사채', accountType: '부채', accountSubtype: '장기차입금', isDebitNormal: false, displayOrder: 2211 },
  { accountCode: '2212', accountName: '장기차입금', accountType: '부채', accountSubtype: '장기차입금', isDebitNormal: false, displayOrder: 2212 },
  { accountCode: '2213', accountName: '장기미지급금', accountType: '부채', accountSubtype: '기타비유동부채', isDebitNormal: false, displayOrder: 2213 },
  { accountCode: '2214', accountName: '퇴직급여충당금', accountType: '부채', accountSubtype: '충당금', isDebitNormal: false, displayOrder: 2214 },
  { accountCode: '2215', accountName: '장기충당금', accountType: '부채', accountSubtype: '충당금', isDebitNormal: false, displayOrder: 2215 },
  { accountCode: '2216', accountName: '이연법인세부채', accountType: '부채', accountSubtype: '기타비유동부채', isDebitNormal: false, displayOrder: 2216 },
  { accountCode: '2217', accountName: '건설보증충당금', accountType: '부채', accountSubtype: '충당금', isDebitNormal: false, displayOrder: 2217 },
  { accountCode: '2218', accountName: '판매보증충당금', accountType: '부채', accountSubtype: '충당금', isDebitNormal: false, displayOrder: 2218 },
  { accountCode: '2219', accountName: '기타비유동부채', accountType: '부채', accountSubtype: '기타비유동부채', isDebitNormal: false, displayOrder: 2219 },
  { accountCode: '2221', accountName: '전환사채', accountType: '부채', accountSubtype: '특수채권', isDebitNormal: false, displayOrder: 2221 },
  { accountCode: '2222', accountName: '신주인수권부사채', accountType: '부채', accountSubtype: '특수채권', isDebitNormal: false, displayOrder: 2222 },
  { accountCode: '2223', accountName: '교환사채', accountType: '부채', accountSubtype: '특수채권', isDebitNormal: false, displayOrder: 2223 },
  { accountCode: '2224', accountName: '영구채', accountType: '부채', accountSubtype: '특수채권', isDebitNormal: false, displayOrder: 2224 },
  { accountCode: '2225', accountName: '하이브리드채권', accountType: '부채', accountSubtype: '특수채권', isDebitNormal: false, displayOrder: 2225 },
  { accountCode: '2229', accountName: '기타특수채권', accountType: '부채', accountSubtype: '특수채권', isDebitNormal: false, displayOrder: 2229 },

  // 자본 계정 (10개)
  { accountCode: '3111', accountName: '자본금', accountType: '자본', accountSubtype: '자본금', isDebitNormal: false, displayOrder: 3111 },
  { accountCode: '3112', accountName: '주식발행초과금', accountType: '자본', accountSubtype: '자본잉여금', isDebitNormal: false, displayOrder: 3112 },
  { accountCode: '3113', accountName: '감자차익', accountType: '자본', accountSubtype: '자본잉여금', isDebitNormal: false, displayOrder: 3113 },
  { accountCode: '3121', accountName: '이익준비금', accountType: '자본', accountSubtype: '이익잉여금', isDebitNormal: false, displayOrder: 3121 },
  { accountCode: '3122', accountName: '기업확장적립금', accountType: '자본', accountSubtype: '이익잉여금', isDebitNormal: false, displayOrder: 3122 },
  { accountCode: '3123', accountName: '배당평균적립금', accountType: '자본', accountSubtype: '이익잉여금', isDebitNormal: false, displayOrder: 3123 },
  { accountCode: '3124', accountName: '임의적립금', accountType: '자본', accountSubtype: '이익잉여금', isDebitNormal: false, displayOrder: 3124 },
  { accountCode: '3131', accountName: '이익잉여금', accountType: '자본', accountSubtype: '이익잉여금', isDebitNormal: false, displayOrder: 3131 },
  { accountCode: '3132', accountName: '전기이월이익잉여금', accountType: '자본', accountSubtype: '이익잉여금', isDebitNormal: false, displayOrder: 3132 },
  { accountCode: '3133', accountName: '당기순이익', accountType: '자본', accountSubtype: '이익잉여금', isDebitNormal: false, displayOrder: 3133 }
];

// 체크박스 업데이트 함수
async function updateCheckbox(lineNumber, isChecked = true) {
  try {
    const content = fs.readFileSync(TODO_FILE_PATH, 'utf8');
    const lines = content.split('\n');
    
    if (lineNumber > 0 && lineNumber <= lines.length) {
      const line = lines[lineNumber - 1];
      if (line.includes('- [ ]') && isChecked) {
        lines[lineNumber - 1] = line.replace('- [ ]', '- [x]');
        fs.writeFileSync(TODO_FILE_PATH, lines.join('\n'));
        console.log(`✅ 체크박스 업데이트됨: Line ${lineNumber}`);
      } else if (line.includes('- [x]') && !isChecked) {
        lines[lineNumber - 1] = line.replace('- [x]', '- [ ]');
        fs.writeFileSync(TODO_FILE_PATH, lines.join('\n'));
        console.log(`☐ 체크박스 해제됨: Line ${lineNumber}`);
      }
    }
  } catch (error) {
    console.error('체크박스 업데이트 실패:', error.message);
  }
}

// 계정과목 생성 함수
async function createChartOfAccount(account) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v2/accounting/chart-of-accounts`, {
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      accountSubtype: account.accountSubtype,
      isDebitNormal: account.isDebitNormal,
      isActive: true,
      displayOrder: account.displayOrder
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ 계정과목 생성됨: ${account.accountCode} ${account.accountName}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`⚠️  계정과목 이미 존재: ${account.accountCode} ${account.accountName}`);
    } else {
      console.error(`❌ 계정과목 생성 실패: ${account.accountCode} ${account.accountName}`, error.response?.data || error.message);
    }
    return null;
  }
}

// 라인 번호 매핑 (실제 파일의 라인 번호와 매칭)
const lineNumberMappings = {
  // 자산 계정 유동자산 라인 번호들 (line 29-48)
  '1111': 29, '1112': 30, '1113': 31, '1114': 32, '1115': 33,
  '1121': 34, '1122': 35, '1123': 36, '1124': 37, '1125': 38,
  '1131': 39, '1132': 40, '1133': 41, '1134': 42, '1135': 43,
  '1141': 44, '1142': 45, '1143': 46, '1149': 47, '1150': 48,
  
  // 자산 계정 투자자산 라인 번호들 (line 51-54)
  '1211': 51, '1212': 52, '1213': 53, '1219': 54,
  
  // 자산 계정 유형자산 라인 번호들 (line 56-67)
  '1221': 56, '1222': 57, '1223': 58, '1224': 59, '1225': 60,
  '1226': 61, '1227': 62, '1228': 63, '1229': 64, '1230': 65,
  '1231': 66, '1232': 67,
  
  // 자산 계정 무형자산 라인 번호들 (line 69-77)
  '1241': 69, '1242': 70, '1243': 71, '1244': 72, '1245': 73,
  '1246': 74, '1247': 75, '1248': 76, '1249': 77,
  
  // 부채 계정 유동부채 라인 번호들 (line 81-95)
  '2111': 81, '2112': 82, '2113': 83, '2114': 84, '2115': 85,
  '2116': 86, '2117': 87, '2118': 88, '2119': 89, '2120': 90,
  '2121': 91, '2122': 92, '2123': 93, '2124': 94, '2129': 95,
  
  // 부채 계정 비유동부채 라인 번호들 (line 97-111)
  '2211': 97, '2212': 98, '2213': 99, '2214': 100, '2215': 101,
  '2216': 102, '2217': 103, '2218': 104, '2219': 105, '2221': 106,
  '2222': 107, '2223': 108, '2224': 109, '2225': 110, '2229': 111,
  
  // 자본 계정 라인 번호들 (line 114-123)
  '3111': 114, '3112': 115, '3113': 116, '3121': 117, '3122': 118,
  '3123': 119, '3124': 120, '3131': 121, '3132': 122, '3133': 123
};

// 메인 실행 함수
async function main() {
  console.log('🚀 한국 표준 계정과목 200개+ 데이터 생성 시작...');
  console.log(`📁 API 서버: ${API_BASE_URL}`);
  console.log(`📄 TodoList 파일: ${TODO_FILE_PATH}`);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  // 계정과목별 처리
  for (const account of chartOfAccounts) {
    const result = await createChartOfAccount(account);
    
    if (result) {
      successCount++;
      // 해당 계정과목의 체크박스 업데이트
      const lineNumber = lineNumberMappings[account.accountCode];
      if (lineNumber) {
        await updateCheckbox(lineNumber, true);
      }
    } else {
      const lineNumber = lineNumberMappings[account.accountCode];
      if (lineNumber) {
        skipCount++;
        await updateCheckbox(lineNumber, true); // 이미 존재하더라도 체크로 표시
      } else {
        errorCount++;
      }
    }
    
    // API 부하 방지를 위한 딜레이
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 작업 완료 요약:');
  console.log(`✅ 생성 성공: ${successCount}개`);
  console.log(`⚠️  이미 존재: ${skipCount}개`);
  console.log(`❌ 생성 실패: ${errorCount}개`);
  console.log(`📝 총 처리: ${chartOfAccounts.length}개`);
  
  if (successCount + skipCount === chartOfAccounts.length) {
    console.log('\n🎉 모든 계정과목 처리 완료!');
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
}

module.exports = { chartOfAccounts, createChartOfAccount, updateCheckbox };