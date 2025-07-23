import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AppDispatch } from '../store';
import {
  selectFinancialStatements,
  generateBalanceSheet,
  generateIncomeStatement
} from '../store/slices/financialSlice';
import BalanceSheetComponent from '../components/bookkeeping/BalanceSheetComponent';
import IncomeStatementComponent from '../components/bookkeeping/IncomeStatementComponent';

const { width: screenWidth } = Dimensions.get('window');

interface FinancialStatementsScreenProps {
  navigation: any;
}

type TabType = 'balance' | 'income';

const FinancialStatementsScreen: React.FC<FinancialStatementsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const financialStatements = useSelector(selectFinancialStatements);
  
  const [activeTab, setActiveTab] = useState<TabType>('balance');
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [periodStart, setPeriodStart] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (activeTab === 'balance') {
      loadBalanceSheet();
    } else {
      loadIncomeStatement();
    }
  }, [activeTab, asOfDate, periodStart, periodEnd]);

  const loadBalanceSheet = async () => {
    try {
      setGenerating(true);
      await dispatch(generateBalanceSheet({
        companyId: 'default-company',
        asOfDate
      })).unwrap();
    } catch (error) {
      console.error('대차대조표 생성 실패:', error);
      Alert.alert('오류', '대차대조표를 생성하는데 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const loadIncomeStatement = async () => {
    try {
      setGenerating(true);
      await dispatch(generateIncomeStatement({
        companyId: 'default-company',
        periodStart,
        periodEnd
      })).unwrap();
    } catch (error) {
      console.error('손익계산서 생성 실패:', error);
      Alert.alert('오류', '손익계산서를 생성하는데 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'balance') {
      await loadBalanceSheet();
    } else {
      await loadIncomeStatement();
    }
    setRefreshing(false);
  };

  const handleDateChange = (date: string) => {
    if (activeTab === 'balance') {
      setAsOfDate(date);
    } else {
      // 손익계산서의 경우 기간 말일 변경
      setPeriodEnd(date);
    }
  };

  const handlePeriodChange = (start: string, end: string) => {
    setPeriodStart(start);
    setPeriodEnd(end);
  };

  const handleExport = () => {
    const statementType = activeTab === 'balance' ? '대차대조표' : '손익계산서';
    
    Alert.alert(
      '재무제표 내보내기',
      `${statementType}를 어떤 형식으로 내보내시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { text: 'PDF', onPress: () => exportToPDF() },
        { text: 'Excel', onPress: () => exportToExcel() },
        { text: '이메일', onPress: () => shareViaEmail() }
      ]
    );
  };

  const exportToPDF = () => {
    // PDF 내보내기 로직
    Alert.alert('알림', 'PDF 내보내기 기능은 곧 제공됩니다.');
  };

  const exportToExcel = () => {
    // Excel 내보내기 로직
    Alert.alert('알림', 'Excel 내보내기 기능은 곧 제공됩니다.');
  };

  const shareViaEmail = () => {
    // 이메일 공유 로직
    Alert.alert('알림', '이메일 공유 기능은 곧 제공됩니다.');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderTabHeader = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'balance' && styles.activeTab]}
        onPress={() => setActiveTab('balance')}
      >
        <Ionicons 
          name="bar-chart" 
          size={20} 
          color={activeTab === 'balance' ? '#4F46E5' : '#9CA3AF'} 
        />
        <Text style={[
          styles.tabText,
          activeTab === 'balance' && styles.activeTabText
        ]}>
          대차대조표
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'income' && styles.activeTab]}
        onPress={() => setActiveTab('income')}
      >
        <Ionicons 
          name="trending-up" 
          size={20} 
          color={activeTab === 'income' ? '#4F46E5' : '#9CA3AF'} 
        />
        <Text style={[
          styles.tabText,
          activeTab === 'income' && styles.activeTabText
        ]}>
          손익계산서
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPeriodInfo = () => (
    <View style={styles.periodContainer}>
      {activeTab === 'balance' ? (
        <View style={styles.periodInfo}>
          <Ionicons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.periodText}>
            기준일: {formatDate(asOfDate)}
          </Text>
        </View>
      ) : (
        <View style={styles.periodInfo}>
          <Ionicons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.periodText}>
            {formatDate(periodStart)} ~ {formatDate(periodEnd)}
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.exportButton}
        onPress={handleExport}
      >
        <Ionicons name="share-outline" size={16} color="#4F46E5" />
        <Text style={styles.exportText}>내보내기</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGeneratingState = () => (
    <View style={styles.generatingContainer}>
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text style={styles.generatingText}>
        {activeTab === 'balance' ? '대차대조표' : '손익계산서'} 생성 중...
      </Text>
      <Text style={styles.generatingSubtext}>
        분개 데이터를 분석하고 있습니다
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={activeTab === 'balance' ? 'bar-chart-outline' : 'trending-up-outline'} 
        size={64} 
        color="#D1D5DB" 
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'balance' ? '대차대조표' : '손익계산서'}가 없습니다
      </Text>
      <Text style={styles.emptySubtitle}>
        분개를 입력한 후 재무제표를 생성해보세요
      </Text>
      
      <TouchableOpacity
        style={styles.generateButton}
        onPress={() => navigation.navigate('BookkeepingHome')}
      >
        <Ionicons name="add-circle" size={20} color="white" />
        <Text style={styles.generateButtonText}>분개 입력하기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>재무제표</Text>
          <Text style={styles.headerSubtitle}>실시간 재무 현황 분석</Text>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      {renderTabHeader()}
      
      {/* Period Information */}
      {renderPeriodInfo()}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {generating ? (
          renderGeneratingState()
        ) : (
          <View style={styles.content}>
            {activeTab === 'balance' ? (
              financialStatements.balanceSheet ? (
                <BalanceSheetComponent 
                  data={financialStatements.balanceSheet}
                  asOfDate={asOfDate}
                />
              ) : (
                renderEmptyState()
              )
            ) : (
              financialStatements.incomeStatement ? (
                <IncomeStatementComponent
                  data={financialStatements.incomeStatement}
                  periodStart={periodStart}
                  periodEnd={periodEnd}
                />
              ) : (
                renderEmptyState()
              )
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 12,
    padding: 4,
    
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#F0F0FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  periodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0FF',
    borderRadius: 8,
  },
  exportText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  generatingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  generatingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  generatingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default FinancialStatementsScreen;