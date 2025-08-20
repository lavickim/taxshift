const React = require('react');
const { View } = require('react-native');

const MockSwipeable = (props) => {
  return React.createElement(View, props, props.children);
};

const MockGestureHandlerRootView = (props) => {
  return React.createElement(View, props, props.children);
};

const MockPanGestureHandler = (props) => {
  return React.createElement(View, props, props.children);
};

module.exports = {
  Swipeable: MockSwipeable,
  PanGestureHandler: MockPanGestureHandler,
  GestureHandlerRootView: MockGestureHandlerRootView,
  State: {},
  Directions: {},
};