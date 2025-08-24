# 트로이 목마 앱 개발을 위한 벤치마크 스크린샷 분류

편한가계부 앱의 스크린샷을 와이어프레임으로 활용하여 동일한 UI/UX를 구현하기 위한 참조 자료입니다.

## 📁 폴더 구조

### 🚀 onboarding/ (4개 화면)
- `01_cafe_pc_download.jpeg` - 편한가계부 카페의 PC 프로그램 다운로드 안내
- `02_pc_install_guide.jpeg` - PC 가계부 프로그램 설치 방법 안내
- `03_cafe_data_sync_guide.jpeg` - 수신함과 자산 연결 기능 안내  
- `04_features_overview.jpeg` - 모든 기능 소개 (자산/PC가계부/내역동기화/사진동기화 등)

### 🏠 main-dashboard/ (5개 화면) 
- `01_monthly_calendar.jpeg` - 메인 월별 캘린더 화면 (수입/지출/합계 표시)
- `02_account_summary.jpeg` - 계좌별 잔액 요약
- `03_balance_overview.jpeg` - 전체 잔액 현황
- `04_quick_actions.jpeg` - 빠른 입력 액션 버튼들
- `05_navigation_tabs.jpeg` - 하단 네비게이션 탭

### 💰 transaction-entry/ (7개 화면)
- `01_budget_entry.jpeg` - 예산 입력 화면 (식비 5,000원 예시)
- `02_income_entry.jpeg` - 수입 입력 화면 (날짜/금액/분류/자산/내용/메모)
- `03_expense_entry.jpeg` - 지출 입력 화면
- `04_category_selection.jpeg` - 카테고리 선택 화면  
- `05_transaction_details.jpeg` - 거래 상세 입력
- `06_recurring_transactions.jpeg` - 반복 거래 설정
- `07_memo_attachment.jpeg` - 메모 및 첨부파일

### 📊 statistics/ (4개 화면)
- `01_kakao_bank_integration.jpeg` - 카카오뱅크 연동 통계 (입금/출금/합계/누적잔액)
- `02_monthly_report.jpeg` - 월간 리포트  
- `03_expense_analysis.jpeg` - 지출 분석
- `04_budget_tracking.jpeg` - 예산 대비 실적 추적

### 📅 calendar/ (3개 화면)
- `01_date_picker.jpeg` - 날짜 선택기 (2025년 12월 31일 선택)
- `02_weekly_view.jpeg` - 주간 보기
- `03_transaction_list.jpeg` - 거래 내역 리스트

### ⚙️ settings/ (5개 화면)
- `01_notification_settings.jpeg` - 금융 어플 알림 설정
- `02_frequent_transactions_help.jpeg` - 자주 사용하는 내역 도움말
- `03_app_settings.jpeg` - 앱 설정 메뉴
- `04_backup_sync.jpeg` - 백업 및 동기화 설정
- `05_account_management.jpeg` - 계정 관리

### 🏪 app-store/ (2개 화면)  
- `01_playstore_calculator_main.jpeg` - 구글 플레이에서 편한계산기 앱 페이지
- `02_playstore_calculator_duplicate.jpeg` - 동일한 앱 페이지 (중복)

## 🎯 개발 우선순위

1. **Phase 1**: main-dashboard (메인 화면)
2. **Phase 2**: transaction-entry (거래 입력)  
3. **Phase 3**: calendar (캘린더)
4. **Phase 4**: statistics (통계)
5. **Phase 5**: settings (설정)
6. **Phase 6**: onboarding (온보딩)

## 📝 구현 시 주요 참고사항

- **색상 테마**: 빨간색 (#FF5722) 계열 메인 컬러
- **네비게이션**: 하단 탭 기반 (가계부/통계/자산/더보기)  
- **입력 방식**: + 버튼을 통한 플로팅 액션
- **캘린더**: 월별 보기가 메인, 일별 상세 보기 지원
- **통계**: 기간별 수입/지출 요약과 그래프
- **은행 연동**: 카카오뱅크 등 실제 계좌 연동 기능

이 스크린샷들을 참조하여 동일한 사용자 경험을 제공하는 트로이 목마 앱을 개발할 예정입니다.