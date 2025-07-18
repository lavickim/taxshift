import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AccountDetailScreen from '../screens/AccountDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DataConnectionScreen from '../screens/DataConnectionScreen';
import ApiTestScreen from '../screens/ApiTestScreen';
import TransactionListScreen from '../screens/TransactionListScreen';
import ReportScreen from '../screens/ReportScreen';
import { Colors } from '../constants/colors';

export type RootStackParamList = {
  HomeTabs: undefined;
  AccountDetail: undefined;
  DataConnection: undefined;
  ApiTest: undefined;
  TransactionList: undefined;
  Report: undefined;
};

export type TabParamList = {
  Home: undefined;
  Account: undefined;
  Transactions: undefined;
  Report: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.card.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionListScreen}
        options={{
          tabBarLabel: '거래',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>💰</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountDetailScreen}
        options={{
          tabBarLabel: '계좌',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>💳</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Report" 
        component={ReportScreen}
        options={{
          tabBarLabel: '보고서',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: '설정',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="HomeTabs" component={TabNavigator} />
        <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
        <Stack.Screen name="DataConnection" component={DataConnectionScreen} />
        <Stack.Screen name="ApiTest" component={ApiTestScreen} />
        <Stack.Screen name="TransactionList" component={TransactionListScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 