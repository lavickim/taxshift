#!/usr/bin/env node
/**
 * 미사용 ESLint disable 지시문 정리 스크립트
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 미사용 ESLint disable 지시문 정리 시작...');

// ESLint 실행하여 unused disable 지시문 찾기
function getUnusedDisables() {
  try {
    execSync('yarn lint --max-warnings 1000', { stdio: 'pipe' });
    return [];
  } catch (error) {
    const output = error.stdout?.toString() || '';
    const lines = output.split('\n');
    const unusedDisables = [];

    for (const line of lines) {
      const match = line.match(
        /^(.+?):(\d+):(\d+)\s+Warning:\s+Unused eslint-disable directive/
      );
      if (match) {
        const [, filePath, lineNum] = match;
        unusedDisables.push({
          file: filePath.trim().replace(/^\.\//, ''),
          line: parseInt(lineNum, 10),
        });
      }
    }

    return unusedDisables;
  }
}

// 파일에서 특정 라인 제거
function removeLineFromFile(filePath, lineNumber) {
  try {
    const fullPath = path.resolve(filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    // 라인 번호는 1부터 시작하므로 -1
    const targetIndex = lineNumber - 1;

    if (targetIndex >= 0 && targetIndex < lines.length) {
      const targetLine = lines[targetIndex];

      // ESLint disable 주석인지 확인
      if (
        targetLine.includes('eslint-disable-next-line') ||
        targetLine.includes('eslint-disable-line')
      ) {
        console.log(
          `🗑️  제거: ${filePath}:${lineNumber} - ${targetLine.trim()}`
        );
        lines.splice(targetIndex, 1);

        const newContent = lines.join('\n');
        fs.writeFileSync(fullPath, newContent);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`❌ ${filePath} 처리 실패:`, error.message);
    return false;
  }
}

// 메인 실행
async function main() {
  const startTime = Date.now();

  try {
    console.log('🔍 미사용 ESLint disable 지시문 검색 중...');
    const unusedDisables = getUnusedDisables();

    if (unusedDisables.length === 0) {
      console.log('✅ 미사용 ESLint disable 지시문이 없습니다!');
      return;
    }

    console.log(`📋 ${unusedDisables.length}개 미사용 지시문 발견`);

    // 파일별로 그룹화하고 라인 번호 역순으로 정렬 (뒤에서부터 제거)
    const fileGroups = {};
    for (const item of unusedDisables) {
      if (!fileGroups[item.file]) {
        fileGroups[item.file] = [];
      }
      fileGroups[item.file].push(item.line);
    }

    let removedCount = 0;

    for (const [filePath, lineNumbers] of Object.entries(fileGroups)) {
      // 라인 번호를 역순으로 정렬 (큰 번호부터 제거)
      const sortedLines = lineNumbers.sort((a, b) => b - a);

      for (const lineNumber of sortedLines) {
        if (removeLineFromFile(filePath, lineNumber)) {
          removedCount++;
        }
      }
    }

    console.log(`✅ ${removedCount}개 미사용 지시문 제거 완료`);
  } catch (error) {
    console.error('❌ 정리 실패:', error.message);
    process.exit(1);
  }

  const endTime = Date.now();
  console.log(`🎉 정리 완료! (${((endTime - startTime) / 1000).toFixed(1)}초)`);
}

if (require.main === module) {
  main();
}
