import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import TransactionListScreen from '../screens/TransactionListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TransactionStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TransactionList"
        component={TransactionListScreen}
        options={{ title: '거래 내역' }}
      />
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ title: '거래 상세' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: '홈' }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{ title: '영수증 촬영' }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionStack} 
        options={{ title: '거래 내역' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: '설정' }}
      />
    </Tab.Navigator>
  );
}