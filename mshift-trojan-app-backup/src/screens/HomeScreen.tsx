import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchDashboardData } from '../store/slices/transactionSlice';
import { getUserProfile } from '../store/slices/userSlice';

export default function HomeScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const { dashboardData, loading } = useSelector((state: RootState) => state.transaction);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    dispatch(fetchDashboardData() as any);
    if (!user?.fullName) {
      dispatch(getUserProfile() as any);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const calculateMonthlyIncome = () => {
    if (!dashboardData?.recentTransactions) return 0;
    return dashboardData.recentTransactions
      .filter(t => t.transactionType === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateMonthlyExpense = () => {
    if (!dashboardData?.recentTransactions) return 0;
    return dashboardData.recentTransactions
      .filter(t => t.transactionType === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const quickActions = [
    {
      id: 1,
      title: '영수증 촬영',
      icon: '📷',
      color: '#FF6B6B',
      onPress: () => navigation.navigate('Camera'),
    },
    {
      id: 2,
      title: '수입 입력',
      icon: '➕',
      color: '#4ECDC4',
      onPress: () => navigation.navigate('AddTransaction', { type: 'INCOME' }),
    },
    {
      id: 3,
      title: '지출 입력',
      icon: '➖',
      color: '#45B7D1',
      onPress: () => navigation.navigate('AddTransaction', { type: 'EXPENSE' }),
    },
    {
      id: 4,
      title: '엑셀 다운로드',
      icon: '📊',
      color: '#96CEB4',
      onPress: () => handleExcelDownload(),
    },
  ];

  const handleExcelDownload = () => {
    // TODO: Implement Excel download
    console.log('Excel download requested');
  };

  if (loading && !dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>안녕하세요!</Text>
            <Text style={styles.userName}>{user?.fullName || '사용자'}님</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
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
              {formatCurrency(calculateMonthlyExpense())}
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryLabel}>이번 달 수입</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(calculateMonthlyIncome())}
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
                <Text style={styles.actionIcon}>{action.icon}</Text>
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
          
          {dashboardData?.recentTransactions?.slice(0, 5).map((transaction, index) => (
            <View key={transaction.transactionId || index} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Text style={styles.transactionIconText}>
                  {transaction.transactionType === 'INCOME' ? '📈' : '📉'}
                </Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionCategory}>
                  {new Date(transaction.transactionDate).toLocaleDateString('ko-KR')}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.transactionType === 'INCOME' ? '#4ECDC4' : '#FF6B6B' }
              ]}>
                {transaction.transactionType === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </Text>
            </View>
          )) || (
            <View style={styles.emptyTransactions}>
              <Text style={styles.emptyText}>아직 거래내역이 없습니다</Text>
              <Text style={styles.emptySubText}>첫 거래를 추가해보세요!</Text>
            </View>
          )}
        </View>

        {/* Achievement/Gamification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이번 주 목표</Text>
          <LinearGradient
            colors={['#a8edea', '#fed6e3']}
            style={styles.achievementCard}
          >
            <Text style={styles.achievementIcon}>🏆</Text>
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
  notificationIcon: {
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  transactionIconText: {
    fontSize: 20,
  },
  emptyTransactions: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
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
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
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