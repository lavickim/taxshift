import { createHash } from 'crypto';

/**
 * 문자열을 SHA256 해시로 변환합니다.
 * @param text 해시할 문자열
 * @returns 64자리 소문자 16진수 해시
 */
export function generateHash(text: string): string {
  if (text === null || text === undefined) {
    throw new Error('Input text cannot be null or undefined');
  }

  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * 텍스트를 정규화합니다.
 * - 앞뒤 공백 제거
 * - 중간 공백들을 하나로 통일
 * - 탭, 줄바꿈을 공백으로 변환
 * - 대소문자를 소문자로 통일
 * @param text 정규화할 텍스트
 * @returns 정규화된 텍스트
 */
export function normalizeText(text: string): string {
  if (text === null || text === undefined) {
    throw new Error('Input text cannot be null or undefined');
  }

  return text
    .toLowerCase() // 대소문자 통일
    .replace(/[\t\n\r]/g, ' ') // 탭, 줄바꿈을 공백으로 변환
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로 통일
    .trim(); // 앞뒤 공백 제거
} 