# 🤖 Android에서 트로이 목마 가계부 테스트하기

## 📱 Expo Go를 사용한 간단한 방법 (권장)

### 1️⃣ 준비사항
- ✅ Android 폰에 Expo Go 앱 설치됨
- ✅ 같은 WiFi 네트워크 연결
- ✅ 백엔드 서버 실행 중 (포트 8081)

### 2️⃣ 앱 실행 방법

```bash
# 1. 트로이 앱 실행
cd /Users/lavickim/_Dev/moneyshift
./start-tj-app.sh

# 2. 또는 포트를 명시해서 실행
cd mshift-trojan-app
npx expo start --port 19000
```

### 3️⃣ 핸드폰에서 연결

1. **QR 코드 스캔**:
   - 터미널에 QR 코드가 표시되면
   - Android Expo Go 앱에서 QR 코드 스캔

2. **수동 연결**:
   ```
   exp://[YOUR_LOCAL_IP]:19000
   ```
   - 예: exp://192.168.1.100:19000

3. **웹에서 먼저 테스트**:
   ```
   http://localhost:19000
   ```

### 4️⃣ 현재 실행 상태 확인

```bash
# 서비스 상태 확인
./check-services.sh

# 현재 실행중인 포트들
lsof -i :8081  # 백엔드
lsof -i :19000 # Expo Metro
```

### 5️⃣ 트러블슈팅

#### Metro bundler 재시작이 필요한 경우:
```bash
cd mshift-trojan-app
rm -rf .expo
rm -rf node_modules/.cache
npx expo start --clear --port 19000
```

#### WiFi 연결 문제:
```bash
# 로컬 IP 확인
ifconfig | grep "inet " | grep -v 127.0.0.1
```

#### 백엔드 API 연결 확인:
```bash
# 핸드폰에서 접근 가능한지 확인 (핸드폰 브라우저에서)
http://[YOUR_LOCAL_IP]:8081/api/public/health
```

### 6️⃣ API 설정 확인

현재 API 설정 (`src/config/api.ts`):
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8081/api'  // 개발 환경
  : 'https://api.moneyshift.co.kr/api';
```

**중요**: Android에서 localhost는 작동하지 않습니다!

#### Android용 API 설정 수정:
```typescript
// 로컬 네트워크 IP로 변경 필요
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.100:8081/api'  // 실제 로컬 IP
  : 'https://api.moneyshift.co.kr/api';
```

### 7️⃣ 빠른 테스트 시나리오

1. **로그인 테스트**: 
   - 데모 계정: `newuser2025` / `testpass123`
   
2. **기능 확인**:
   - 홈 화면 로딩
   - 거래 추가
   - 거래 목록 조회
   - 설정 화면

---

## 🔧 고급 설정 (Android Studio/에뮬레이터)

이전에 성공적으로 Expo로 실행했었다면, 위의 Expo Go 방법이 가장 간단합니다!

Android Studio 설정이 필요하다면:
```bash
./setup-android.sh
```

---

**💡 팁**: 
- Expo Go가 가장 간단하고 빠른 테스트 방법입니다
- 실제 배포시에는 `expo build` 또는 `eas build` 사용
- 개발 중에는 QR 코드 방법이 가장 편리합니다