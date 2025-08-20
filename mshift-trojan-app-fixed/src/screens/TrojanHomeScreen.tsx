import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchDashboardData } from '../store/slices/dashboardSlice';

export default function HomeScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { totalExpense, totalIncome, recentTransactions, loading } = useAppSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const quickActions = [
    {
      id: 1,
      title: '영수증 촬영',
      icon: 'camera',
      color: '#FF6B6B',
      onPress: () => navigation.navigate('Camera'),
    },
    {
      id: 2,
      title: '수입 입력',
      icon: 'add-circle',
      color: '#4ECDC4',
      onPress: () => navigation.navigate('AddTransaction', { type: 'income' }),
    },
    {
      id: 3,
      title: '지출 입력',
      icon: 'remove-circle',
      color: '#45B7D1',
      onPress: () => navigation.navigate('AddTransaction', { type: 'expense' }),
    },
    {
      id: 4,
      title: '엑셀 다운로드',
      icon: 'download',
      color: '#96CEB4',
      onPress: () => handleExcelDownload(),
    },
  ];

  const handleExcelDownload = () => {
    // TODO: Implement Excel download
    console.log('Excel download requested');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>안녕하세요!</Text>
            <Text style={styles.userName}>{user?.name || '사용자'}님</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryLabel}>이번 달 지출</Text>
            <Text style={styles.summaryAmount}>
              ₩{totalExpense?.toLocaleString() || '0'}
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryLabel}>이번 달 수입</Text>
            <Text style={styles.summaryAmount}>
              ₩{totalIncome?.toLocaleString() || '0'}
            </Text>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>빠른 작업</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionButton, { backgroundColor: action.color }]}
                onPress={action.onPress}
              >
                <Icon name={action.icon} size={28} color="white" />
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 거래</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>
          
          {recentTransactions?.slice(0, 5).map((transaction, index) => (
            <View key={transaction.id || index} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Icon 
                  name={transaction.type === 'income' ? 'arrow-up' : 'arrow-down'} 
                  size={20} 
                  color={transaction.type === 'income' ? '#4ECDC4' : '#FF6B6B'} 
                />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionCategory}>
                  {transaction.category}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.type === 'income' ? '#4ECDC4' : '#FF6B6B' }
              ]}>
                {transaction.type === 'income' ? '+' : '-'}₩{transaction.amount.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Achievement/Gamification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이번 주 목표</Text>
          <LinearGradient
            colors={['#a8edea', '#fed6e3']}
            style={styles.achievementCard}
          >
            <Icon name="trophy" size={32} color="#FFD700" />
            <Text style={styles.achievementText}>
              영수증 10장 촬영하기 (7/10)
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '70%' }]} />
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationButton: {
    padding: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    minHeight: 100,
    justifyContent: 'center',
  },
  summaryLabel: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  summaryAmount: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#007AFF',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  achievementText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
});