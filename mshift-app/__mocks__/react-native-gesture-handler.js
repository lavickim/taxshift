import { View } from 'react-native';

const MockSwipeable = ({ children, renderRightActions, ...props }) => {
  return View({ ...props, children });
};

export const Swipeable = MockSwipeable;
export const PanGestureHandler = View;
export const GestureHandlerRootView = View;
export const State = {};
export const Directions = {};

export default {
  Swipeable: MockSwipeable,
  PanGestureHandler: View,
  GestureHandlerRootView: View,
  State: {},
  Directions: {},
};