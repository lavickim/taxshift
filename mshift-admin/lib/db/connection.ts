/**
 * 데이터베이스 연결을 위한 유틸리티 함수들
 * 실제 DATABASE_URL은 .env 파일에서 Supabase에서 제공하는 값을 사용해야 합니다.
 */

/**
 * DATABASE_URL이 설정되어 있는지 확인합니다.
 */
export function checkDatabaseUrl(): boolean {
  return !!process.env.DATABASE_URL;
}

/**
 * 데이터베이스 연결 정보를 로그로 출력합니다 (보안을 위해 일부만 표시).
 */
export function logDatabaseInfo(): void {
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    const maskedUrl =
      url.substring(0, 20) + '***' + url.substring(url.length - 20);
    console.log('📊 DATABASE_URL 설정됨:', maskedUrl);
  } else {
    console.log('❌ DATABASE_URL이 설정되지 않음');
  }
}
