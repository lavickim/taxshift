import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 공통 스타일 상수
export const TAB_BAR_HEIGHT = 60;

// 하단 탭 바를 고려한 컨테이너 스타일
export const createTabBarAwareStyles = () => {
  const insets = useSafeAreaInsets();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingBottom: TAB_BAR_HEIGHT + insets.bottom,
    },
    scrollContainer: {
      paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 20, // 추가 여백
    },
  });
};

// 정적 스타일 (SafeAreaInsets 없이)
export const commonStyles = StyleSheet.create({
  tabBarAwareContainer: {
    flex: 1,
    paddingBottom: 80, // 고정 여백 (탭바 + 안전영역 추정)
  },
  tabBarAwareScrollContainer: {
    paddingBottom: 100, // 스크롤뷰용 추가 여백
  },
});