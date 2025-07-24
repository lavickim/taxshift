#!/bin/bash

echo "🔄 start-frontend.sh는 start-admin.sh로 리디렉션됩니다..."
echo "=================================================="

# start-admin.sh 호출
exec "$(dirname "$0")/start-admin.sh"