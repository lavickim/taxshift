/**
 * Expense Tracker - React Native CLI
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './package.json';

// React Native Web support
if (typeof window !== 'undefined') {
  require('react-native-gesture-handler/jestSetup');
}

AppRegistry.registerComponent(appName, () => App);

// Web support
if (typeof window !== 'undefined') {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  AppRegistry.runApplication(appName, {
    initialProps: {},
    rootTag,
  });
}