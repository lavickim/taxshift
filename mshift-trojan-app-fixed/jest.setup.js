// Comment out extend-expect as it's deprecated in newer versions
// import '@testing-library/react-native/extend-expect';

// Mock Expo modules
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient'
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome'
}));

// Mock react-native-chart-kit
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart',
  PieChart: 'PieChart'
}));

// react-native-gesture-handler is mocked via __mocks__/react-native-gesture-handler.js

// Mock Redux
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

// Mock AsyncStorage if needed (commented out since not used)
// jest.mock('@react-native-async-storage/async-storage', () =>
//   require('@react-native-async-storage/async-storage/jest/async-storage-mock')
// );

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockPush = jest.fn();

export const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  push: mockPush,
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useFocusEffect: jest.fn(),
  useRoute: () => ({
    params: {},
  }),
}));

// Global fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      success: true,
      data: {},
    }),
    text: () => Promise.resolve(''),
  })
);

// Suppress console errors during tests to reduce noise
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Only suppress specific test-related errors
    if (
      typeof args[0] === 'string' && (
        args[0].includes('데이터 로딩 실패:') ||
        args[0].includes('분개 생성 API 호출 오류:') ||
        args[0].includes('Failed to load dashboard summary:') ||
        args[0].includes('대차대조표 생성 오류:') ||
        args[0].includes('API call failed:')
      )
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});