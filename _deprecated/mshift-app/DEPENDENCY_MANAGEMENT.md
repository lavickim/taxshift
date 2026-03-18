# 의존성 관리 가이드

## 현재 설정된 정확한 버전들 (작동 확인됨)

### Expo 핵심 패키지
- `expo`: `53.0.20` (정확한 버전 고정)
- `expo-navigation-bar`: `4.0.9`
- `expo-status-bar`: `2.2.3`

### React Native 제스처 & 애니메이션
- `react-native-gesture-handler`: `2.24.0` (정확한 버전 고정)
- `react-native-reanimated`: `3.17.5` (정확한 버전 고정)

### 네비게이션
- `react-native-screens`: `4.11.1`
- `react-native-safe-area-context`: `5.4.0`

## 의존성 설치 및 관리 규칙

### ✅ 권장 방법: yarn만 사용

```bash
# 새로운 환경 설정
rm -rf node_modules yarn.lock
yarn install

# 새 패키지 추가
yarn add [package-name]

# 개발 의존성 추가
yarn add -D [package-name]
```

### ❌ 피해야 할 방법: expo install과 yarn 혼용

```bash
# 이렇게 하지 마세요!
yarn install
npx expo install react-native-something  # 버전 충돌 위험
```

## 버전 고정 정책

1. **제스처/애니메이션 관련**: 정확한 버전 고정 (크래시 방지)
2. **Expo 핵심**: 정확한 버전 고정 (호환성 보장)
3. **기타 패키지**: 필요시 범위 지정 (`^` 또는 `~`)

## 트러블슈팅

만약 의존성 문제가 발생하면:

1. `rm -rf node_modules yarn.lock`
2. `yarn install`
3. 문제 지속시 package.json의 고정된 버전들 확인

## 주의사항

- `expo install` 사용 금지 (현재 yarn.lock과 충돌 가능)
- 제스처 핸들러 버전 변경 금지 (현재 버전에서 정상 작동 확인됨)
- package.json의 정확한 버전들 임의 변경 금지