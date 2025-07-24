#!/bin/bash

# MoneyShift Database Backup Script
# 사용자 요청에 따른 데이터베이스 백업 스크립트

echo "🗄️ MoneyShift 데이터베이스 백업 시작..."
echo "=================================="

# 백업 디렉토리 생성
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# 타임스탬프 생성
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/moneyshift_backup_$TIMESTAMP.sql"

# 환경 변수 설정
export PGPASSWORD="postgres"

echo "📅 백업 일시: $(date)"
echo "💾 백업 파일: $BACKUP_FILE"

# PostgreSQL 연결 확인
if ! pg_isready -h localhost -p 5432 -U postgres; then
    echo "❌ PostgreSQL 서버에 연결할 수 없습니다."
    echo "💡 데이터베이스가 실행 중인지 확인하세요:"
    echo "   docker-compose up -d postgres"
    echo "   또는 bash start-db.sh"
    exit 1
fi

echo "✅ PostgreSQL 연결 확인됨"

# 데이터베이스 백업 실행
echo "🔄 데이터베이스 백업 중..."
if pg_dump -h localhost -p 5432 -U postgres -d moneyshift \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=plain \
    --encoding=UTF8 > "$BACKUP_FILE"; then
    
    echo "✅ 백업 완료!"
    echo "📊 백업 파일 크기: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo "📁 백업 위치: $BACKUP_FILE"
    
    # 백업 파일 압축
    echo "🗜️ 백업 파일 압축 중..."
    gzip "$BACKUP_FILE"
    COMPRESSED_FILE="${BACKUP_FILE}.gz"
    
    echo "✅ 압축 완료!"
    echo "📊 압축 파일 크기: $(du -h "$COMPRESSED_FILE" | cut -f1)"
    echo "📁 최종 백업 파일: $COMPRESSED_FILE"
    
    # 백업 목록 표시
    echo ""
    echo "📋 기존 백업 파일 목록:"
    ls -lh "$BACKUP_DIR"/*.gz 2>/dev/null || echo "   이전 백업 파일 없음"
    
else
    echo "❌ 백업 실패!"
    rm -f "$BACKUP_FILE" 2>/dev/null
    exit 1
fi

echo ""
echo "✨ 데이터베이스 백업이 성공적으로 완료되었습니다!"
echo "=================================="

# 복원 방법 안내
echo "📝 복원 방법:"
echo "   gunzip -c $COMPRESSED_FILE | psql -h localhost -p 5432 -U postgres"