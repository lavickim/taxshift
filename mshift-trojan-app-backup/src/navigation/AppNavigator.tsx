import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import TransactionListScreen from '../screens/TransactionListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';

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

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = '🏠';
          } else if (route.name === 'Camera') {
            iconName = '📷';
          } else if (route.name === 'Transactions') {
            iconName = '📋';
          } else if (route.name === 'Settings') {
            iconName = '⚙️';
          } else {
            iconName = '⭕';
          }

          return (
            <Text style={{ fontSize: size, color }}>
              {iconName}
            </Text>
          );
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

export default function AppNavigator() {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}