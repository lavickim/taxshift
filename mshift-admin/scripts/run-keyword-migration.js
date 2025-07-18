#!/usr/bin/env node

/**
 * 키워드 기반 거래 태깅 시스템 마이그레이션 실행 스크립트
 * 
 * 실행 방법:
 * 1. 환경변수 설정 확인 (.env 파일의 DATABASE_URL)
 * 2. npm run migrate:keyword 또는 node scripts/run-keyword-migration.js
 * 
 * 주의사항:
 * - 실행 전 반드시 데이터베이스 백업을 진행하세요!
 * - 개발 환경에서 먼저 테스트 후 프로덕션에 적용하세요.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 색상 출력을 위한 ANSI 코드
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function step(stepNumber, description) {
  log(`\n${colors.bold}STEP ${stepNumber}: ${description}${colors.reset}`, 'cyan');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function main() {
  try {
    log('\n' + '='.repeat(70), 'cyan');
    log('키워드 기반 거래 태깅 시스템 마이그레이션 시작', 'bold');
    log('='.repeat(70), 'cyan');

    // 환경 확인
    step(1, '환경 확인 및 사전 검증');
    
    // .env 파일 확인
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      throw new Error('.env 파일을 찾을 수 없습니다. DATABASE_URL을 설정해주세요.');
    }
    success('.env 파일 확인됨');

    // 현재 작업 디렉토리 확인
    const currentDir = process.cwd();
    info(`현재 작업 디렉토리: ${currentDir}`);
    
    if (!currentDir.includes('mshift-admin')) {
      warning('mshift-admin 디렉토리에서 실행하는 것을 권장합니다.');
    }

    // 백업 권고
    step(2, '데이터베이스 백업 확인');
    warning('⚠️  마이그레이션 실행 전 데이터베이스 백업을 권장합니다!');
    warning('⚠️  계속 진행하시겠습니까? (10초 후 자동 진행)');
    
    // 10초 대기
    for (let i = 10; i > 0; i--) {
      process.stdout.write(`\r${i}초 남음... (Ctrl+C로 중단 가능)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    process.stdout.write('\r진행합니다...                    \n');

    // Prisma 스키마 검증
    step(3, 'Prisma 스키마 검증');
    try {
      execSync('npx prisma validate', { stdio: 'pipe' });
      success('Prisma 스키마 검증 완료');
    } catch (validationError) {
      error('Prisma 스키마 검증 실패:');
      console.log(validationError.toString());
      throw new Error('스키마 검증 실패로 마이그레이션을 중단합니다.');
    }

    // Prisma 클라이언트 재생성
    step(4, 'Prisma 클라이언트 재생성');
    try {
      log('Prisma 클라이언트 생성 중...', 'yellow');
      execSync('npx prisma generate', { stdio: 'inherit' });
      success('Prisma 클라이언트 생성 완료');
    } catch (generateError) {
      error('Prisma 클라이언트 생성 실패');
      throw generateError;
    }

    // 스키마 푸시 (신규 테이블 및 컬럼 추가)
    step(5, '데이터베이스 스키마 업데이트');
    try {
      log('스키마 변경사항을 데이터베이스에 적용 중...', 'yellow');
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      success('스키마 업데이트 완료');
    } catch (pushError) {
      error('스키마 푸시 실패');
      throw pushError;
    }

    // 데이터 마이그레이션 SQL 실행
    step(6, '데이터 마이그레이션 실행');
    const sqlPath = path.join(__dirname, 'keyword-system-migration.sql');
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`마이그레이션 SQL 파일을 찾을 수 없습니다: ${sqlPath}`);
    }

    try {
      log('데이터 마이그레이션 SQL 실행 중...', 'yellow');
      
      // SQL 파일을 psql로 실행
      const { Client } = require('pg');
      const dotenv = require('dotenv');
      
      dotenv.config();
      
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다.');
      }

      // SQL 파일 읽기
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      
      // PostgreSQL 클라이언트로 실행
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
      });

      await client.connect();
      info('데이터베이스 연결 성공');
      
      await client.query(sqlContent);
      success('데이터 마이그레이션 SQL 실행 완료');
      
      await client.end();
      
    } catch (sqlError) {
      error('데이터 마이그레이션 실행 실패:');
      console.error(sqlError.message);
      throw sqlError;
    }

    // 마이그레이션 검증
    step(7, '마이그레이션 결과 검증');
    try {
      const { PrismaClient } = require('../lib/generated/prisma');
      const prisma = new PrismaClient();

      // 기본 검증 쿼리들
      const regexRulesCount = await prisma.regex_rules.count();
      const keywordGroupsCount = await prisma.keywordGroup.count();
      const tagsMasterCount = await prisma.tagsMaster.count();
      const keywordTagMappingsCount = await prisma.keywordTagMapping.count();
      const tagAccountMappingsCount = await prisma.tagAccountMapping.count();
      const userQuestionsCount = await prisma.userQuestion.count();

      log('\n📊 마이그레이션 결과 요약:', 'bold');
      info(`- regex_rules: ${regexRulesCount}개`);
      info(`- keyword_groups: ${keywordGroupsCount}개`);
      info(`- tags_master: ${tagsMasterCount}개`);
      info(`- keyword_tag_mappings: ${keywordTagMappingsCount}개`);
      info(`- tag_account_mappings: ${tagAccountMappingsCount}개`);
      info(`- user_questions: ${userQuestionsCount}개`);

      await prisma.$disconnect();
      success('마이그레이션 검증 완료');

    } catch (verificationError) {
      warning('마이그레이션 검증 중 오류 발생 (마이그레이션 자체는 성공했을 수 있음):');
      console.warn(verificationError.message);
    }

    // 완료
    step(8, '마이그레이션 완료');
    log('\n' + '='.repeat(70), 'green');
    log('🎉 키워드 기반 거래 태깅 시스템 마이그레이션 성공! 🎉', 'bold');
    log('='.repeat(70), 'green');
    
    log('\n📋 다음 단계:', 'bold');
    info('1. 어드민 툴에서 새로운 키워드 관리 기능 확인');
    info('2. 기존 정규식 룰들이 정상적으로 동작하는지 테스트');
    info('3. 새로운 태그 매핑 시스템 테스트');
    info('4. 사용자 질문 시스템 동작 확인');
    
    log('\n⚠️  주의사항:', 'yellow');
    warning('- 프로덕션 환경에서는 충분한 테스트 후 배포하세요');
    warning('- Redis 캐시를 새로고침하여 새로운 스키마를 반영하세요');
    warning('- Java API의 모델 클래스들도 업데이트가 필요합니다');

  } catch (err) {
    error('\n마이그레이션 실패:');
    console.error(err.message);
    console.error('\n디버깅을 위한 전체 스택 트레이스:');
    console.error(err.stack);
    
    log('\n🔧 문제 해결 방법:', 'yellow');
    info('1. 데이터베이스 연결 상태 확인');
    info('2. .env 파일의 DATABASE_URL 확인');
    info('3. PostgreSQL 서버 상태 확인');
    info('4. 백업에서 데이터베이스 복원 (필요시)');
    
    process.exit(1);
  }
}

// 프로세스 종료 핸들러
process.on('SIGINT', () => {
  log('\n\n마이그레이션이 사용자에 의해 중단되었습니다.', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\n마이그레이션이 시스템에 의해 중단되었습니다.', 'yellow');
  process.exit(0);
});

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { main };