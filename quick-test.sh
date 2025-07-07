#!/bin/bash

# 빠른 테스트 실행 스크립트 (루트에서 실행)
# 별도의 입력 없이 바로 전체 테스트 실행

echo "⚡ MoneyShift Admin 빠른 테스트"
echo "=============================="

# mshift-admin으로 이동하여 전체 테스트 실행
cd mshift-admin && ./test-website.sh

# 결과 요약
echo ""
echo "📋 테스트 결과 요약:"
echo "- 📄 JSON 보고서: mshift-admin/test-results/test-report.json"
echo "- 🌐 HTML 보고서: mshift-admin/test-results/test-report.html"
echo "- 🖱️ 인터랙티브 보고서: mshift-admin/test-results/interactive-test-report.html"
echo ""
echo "💡 인터랙티브 테스트를 실행하려면: ./test-admin.sh 3"