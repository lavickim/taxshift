import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { commonStyles } from '../constants/styles';
import { apiCall, API_CONFIG } from '../config/api';
import TransactionService from '../services/TransactionService';
import DashboardService, { DashboardData } from '../services/DashboardService';
import KeywordSystemService, { ClassificationResult } from '../services/KeywordSystemService';
import { TransactionData } from '../types/Transaction';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLoading, setRefreshing, setSummary, setNotifications, setRecentTransactions, setError } from '../store/slices/dashboardSlice';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { summary, notifications, loading, refreshing, error } = useAppSelector(state => state.dashboard);
  const insets = useSafeAreaInsets();
  
  const [ruleEngineStatus, setRuleEngineStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [classificationResult, setClassificationResult] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  // Check system status and load all data
  useEffect(() => {
    checkSystemStatus();
    loadTransactionData();
    loadDashboardData();
  }, []);
  
  // 홈 화면이 포커스될 때마다 데이터 새로고침
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('HomeScreen focused, refreshing data...');
      checkSystemStatus();
      loadTransactionData();
      loadDashboardData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadTransactionData = async () => {
    try {
      const transactionService = TransactionService.getInstance();
      const data = await transactionService.loadTransactionData();
      
      console.log('HomeScreen - Loaded data:', {
        bankName: data.accountInfo.bankName,
        balance: data.accountInfo.balance,
        transactionCount: data.transactions.length
      });
      
      setTransactionData(data);
    } catch (error) {
      console.error('Failed to load transaction data:', error);
      // 홈 화면에서는 에러를 조용히 처리
      setTransactionData(null);
    }
  };

  const loadDashboardData = async () => {
    try {
      dispatch(setLoading(true));
      const dashboardService = DashboardService.getInstance();
      const data = await dashboardService.getDashboardSummary();
      
      console.log('HomeScreen - Loaded dashboard data:', {
        revenue: data.monthlyData.revenue,
        notificationCount: data.notifications.length,
        transactionCount: data.recentTransactions.length
      });
      
      // Redux store에 데이터 저장
      dispatch(setSummary({
        totalRevenue: Number(data.monthlyData.revenue),
        totalExpense: Number(data.monthlyData.expense),
        netIncome: Number(data.monthlyData.profit),
        transactionCount: data.recentTransactions.length,
        pendingCount: data.notifications.filter(n => n.type === 'warning').length,
        approvedCount: data.recentTransactions.length - data.notifications.filter(n => n.type === 'warning').length,
        currentMonth: new Date().toISOString().slice(0, 7),
      }));
      
      dispatch(setNotifications(data.notifications));
      dispatch(setRecentTransactions(data.recentTransactions));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      dispatch(setError('대시보드 데이터를 불러올 수 없습니다.'));
    }
  };

  const checkSystemStatus = async () => {
    try {
      const keywordSystemService = KeywordSystemService.getInstance();
      const status = await keywordSystemService.checkSystemHealth();
      
      console.log('System health status:', status);
      setSystemStatus(status);
      setRuleEngineStatus(status.isHealthy ? 'online' : 'offline');
    } catch (error) {
      console.error('Failed to check system status:', error);
      setRuleEngineStatus('offline');
      setSystemStatus(null);
    }
  };

  const checkRuleEngineStatus = async () => {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.HEALTH);
      if (response.ok) {
        setRuleEngineStatus('online');
      } else {
        setRuleEngineStatus('offline');
      }
    } catch (error) {
      setRuleEngineStatus('offline');
    }
  };

  const testTransactionClassification = async () => {
    try {
      const keywordSystemService = KeywordSystemService.getInstance();
      
      // 테스트용 거래 텍스트들
      const testTexts = [
        'GS25 편의점 결제',
        '스타벅스 강남점',
        'SK주유소 충전',
        '삼성전자 구매',
        '카카오페이 결제'
      ];
      
      const randomText = testTexts[Math.floor(Math.random() * testTexts.length)];
      const result = await keywordSystemService.classifyTransaction(randomText, 15000);
      
      console.log('Classification result:', result);
      
      if (result.success) {
        setClassificationResult(result.category);
        Alert.alert(
          '분류 성공', 
          `거래: ${result.text}\n분류: ${result.category}\n신뢰도: ${(result.confidence * 100).toFixed(1)}%`
        );
      } else {
        Alert.alert('분류 실패', '거래 분류 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Classification error:', error);
      
      // 키워드 시스템 실패 시 기존 API 시도
      try {
        const response = await apiCall(API_CONFIG.ENDPOINTS.MATCH, {
          method: 'POST',
          body: JSON.stringify({
            inputText: 'GS25 편의점 결제',
            returnAllMatches: false
          })
        });

        if (response.ok) {
          const result = await response.json();
          const category = result.matchedRules?.[0]?.category || '미분류';
          setClassificationResult(category);
          Alert.alert('분류 성공 (대체 API)', `거래 분류: ${category}`);
        } else {
          Alert.alert('분류 실패', '모든 분류 API 호출 실패');
        }
      } catch (fallbackError) {
        Alert.alert('네트워크 오류', 'API 서버에 연결할 수 없습니다.');
      }
    }
  };

  const navigateToAccountDetail = () => {
    console.log('Navigating to Account tab...');
    navigation.navigate('Account' as never);
  };
  
  const refreshAndNavigate = () => {
    console.log('Refreshing data and navigating to Account...');
    // 데이터를 새로고침한 후 계좌 탭으로 이동
    loadTransactionData().then(() => {
      navigation.navigate('Account' as never);
    });
  };

  const onRefresh = async () => {
    dispatch(setRefreshing(true));
    try {
      console.log('Pull to refresh - refreshing all data...');
      await Promise.all([
        checkSystemStatus(),
        loadTransactionData(),
        loadDashboardData()
      ]);
      console.log('Pull to refresh completed successfully');
    } catch (error) {
      console.error('Pull to refresh failed:', error);
      dispatch(setError('데이터 새로고침 중 오류가 발생했습니다.'));
    } finally {
      dispatch(setRefreshing(false));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>머니쉬프트</Text>
            <Text style={styles.headerArrow}>{'>'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationIcon}>
            <Text style={styles.notificationBadge}>
              {notifications.filter(n => !n.isRead).length || 0}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action cards */}
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.taskCard}>
            <Text style={styles.cardTitle}>시스템 상태</Text>
            <View style={styles.taskInfo}>
              <Text style={styles.taskIcon}>📊</Text>
              <Text style={styles.taskCount}>
                {systemStatus ? `${systemStatus.keywordGroupsCount}개 키워드 그룹` : '상태 확인 중...'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.aiCard} onPress={testTransactionClassification}>
            <Text style={styles.cardTitle}>키워드 시스템</Text>
            <Text style={styles.aiCardSubtitle}>신규 키워드 기반 분류</Text>
            <View style={styles.statusContainer}>
              <Text style={[
                styles.statusText,
                ruleEngineStatus === 'online' ? styles.statusOnline : styles.statusOffline
              ]}>
                {ruleEngineStatus === 'loading' ? '확인중...' : 
                 ruleEngineStatus === 'online' ? '정상' : '오프라인'}
              </Text>
              <Text style={styles.searchIcon}>🔍</Text>
            </View>
            {classificationResult && (
              <Text style={styles.classificationResult}>최근 분류: {classificationResult}</Text>
            )}
            {systemStatus && (
              <Text style={styles.classificationResult}>
                정확도: {(systemStatus.systemStats.classificationAccuracy * 100).toFixed(1)}%
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Business Status */}
        <View style={styles.businessStatusContainer}>
          <Text style={styles.sectionTitle}>사업 현황</Text>
          
          {/* Year Selector */}
          <View style={styles.yearSelector}>
            <TouchableOpacity>
              <Text style={styles.yearSelectorButton}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.yearText}>2024년</Text>
            <TouchableOpacity>
              <Text style={styles.yearSelectorButton}>{'>'}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabItem}>
              <Text style={styles.tabText}>일</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
              <Text style={styles.tabText}>월</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
              <Text style={styles.tabText}>분기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
              <Text style={styles.tabText}>반기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabItem, styles.activeTab]}>
              <Text style={[styles.tabText, styles.activeTabText]}>연</Text>
            </TouchableOpacity>
          </View>

          {/* Financial Info */}
          <View style={styles.financialContainer}>
            <TouchableOpacity style={styles.financialItem} onPress={navigateToAccountDetail}>
              <View style={styles.financialHeader}>
                <Text style={styles.financialTitle}>월 매출</Text>
                <Text style={styles.financialArrow}>{'>'}</Text>
              </View>
              <Text style={styles.financialAmount}>
                {loading ? '로딩중...' : 
                 summary.totalRevenue > 0 ? 
                   `${(summary.totalRevenue / 10000).toFixed(0)}만원` : 
                   '0원'
                }
              </Text>
              <View style={[styles.changeIndicator, { backgroundColor: '#e8f5e8' }]}>
                <Text style={[styles.changeText, { color: '#4CAF50' }]}>
                  +12%
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.financialItem} onPress={refreshAndNavigate}>
              <View style={styles.financialHeader}>
                <Text style={styles.financialTitle}>월 비용</Text>
                <Text style={styles.financialArrow}>{'>'}</Text>
              </View>
              <View style={styles.salesIconContainer}>
                <Text style={styles.salesIcon}>📊</Text>
                <Text style={styles.financialAmount}>
                  {loading ? '로딩중...' : 
                   summary.totalExpense > 0 ? 
                     `${(summary.totalExpense / 10000).toFixed(0)}만원` : 
                     '0원'
                  }
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.financialItem} onPress={refreshAndNavigate}>
              <View style={styles.financialHeader}>
                <Text style={styles.financialTitle}>월 순이익</Text>
                <Text style={styles.financialArrow}>{'>'}</Text>
              </View>
              <View style={styles.salesIconContainer}>
                <Text style={styles.expenseIcon}>✓</Text>
                <Text style={styles.financialAmount}>
                  {loading ? '로딩중...' : 
                   summary.netIncome !== 0 ? 
                     `${(summary.netIncome / 10000).toFixed(0)}만원` : 
                     '0원'
                  }
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerArrow: {
    fontSize: 18,
    marginLeft: 8,
    color: Colors.text.secondary,
  },
  notificationIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.card.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.notification.badge,
    color: Colors.white,
    width: 16,
    height: 16,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
  },
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  taskCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.text.primary,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  taskCount: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  aiCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginLeft: 8,
    position: 'relative',
  },
  aiCardSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  searchIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontSize: 16,
  },
  businessStatusContainer: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text.primary,
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  yearSelectorButton: {
    fontSize: 18,
    paddingHorizontal: 16,
    color: Colors.text.secondary,
  },
  yearText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  financialContainer: {
    marginTop: 8,
  },
  financialItem: {
    marginBottom: 16,
  },
  financialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  financialTitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  financialArrow: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  financialAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  changeIndicator: {
    backgroundColor: '#ffebee',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  changeText: {
    color: Colors.indicator.negative,
    fontSize: 12,
  },
  salesIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salesIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  expenseIcon: {
    fontSize: 18,
    marginRight: 8,
    backgroundColor: Colors.secondary,
    color: Colors.white,
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusOnline: {
    color: '#4CAF50',
  },
  statusOffline: {
    color: '#F44336',
  },
  classificationResult: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 4,
  },
});

export default HomeScreen; 