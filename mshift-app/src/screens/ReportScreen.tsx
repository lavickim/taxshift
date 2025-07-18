import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLoading, setRefreshing } from '../store/slices/dashboardSlice';

const { width } = Dimensions.get('window');

type PeriodType = 'monthly' | 'quarterly' | 'yearly';

interface ReportData {
  period: string;
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  categories: {
    name: string;
    amount: number;
    percentage: number;
  }[];
}

const ReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { summary, loading, refreshing } = useAppSelector(state => state.dashboard);
  const { transactions } = useAppSelector(state => state.transaction);
  
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    generateReport();
  }, [selectedPeriod, transactions, summary]);

  const generateReport = () => {
    try {
      // 현재 월 데이터 기반으로 보고서 생성
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // 카테고리별 지출 분석
      const categoryExpenses = new Map<string, number>();
      transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
          const current = categoryExpenses.get(transaction.category) || 0;
          categoryExpenses.set(transaction.category, current + transaction.amount);
        }
      });

      // 상위 카테고리 계산
      const categories = Array.from(categoryExpenses.entries())
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: summary.totalExpense > 0 ? (amount / summary.totalExpense) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      const data: ReportData = {
        period: selectedPeriod === 'monthly' ? '2024년 1월' : 
                selectedPeriod === 'quarterly' ? '2024년 1분기' : '2024년',
        totalIncome: summary.totalRevenue,
        totalExpense: summary.totalExpense,
        netIncome: summary.netIncome,
        categories
      };

      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('보고서 생성 오류', '보고서를 생성하는 중 오류가 발생했습니다.');
    }
  };

  const onRefresh = async () => {
    dispatch(setRefreshing(true));
    try {
      generateReport();
    } catch (error) {
      console.error('Failed to refresh report:', error);
    } finally {
      dispatch(setRefreshing(false));
    }
  };

  const formatCurrency = (amount: number): string => {
    return `${(amount / 10000).toFixed(0)}만원`;
  };

  const getPeriodLabel = (period: PeriodType): string => {
    switch (period) {
      case 'monthly': return '월간';
      case 'quarterly': return '분기별';
      case 'yearly': return '연간';
      default: return '월간';
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['monthly', 'quarterly', 'yearly'] as PeriodType[]).map(period => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.selectedPeriodButton
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.selectedPeriodButtonText
          ]}>
            {getPeriodLabel(period)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSummaryCard = () => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>손익 요약</Text>
      <Text style={styles.summaryPeriod}>{reportData?.period}</Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>총 매출</Text>
        <Text style={[styles.summaryValue, styles.incomeText]}>
          {formatCurrency(reportData?.totalIncome || 0)}
        </Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>총 비용</Text>
        <Text style={[styles.summaryValue, styles.expenseText]}>
          {formatCurrency(reportData?.totalExpense || 0)}
        </Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>순이익</Text>
        <Text style={[
          styles.summaryValue, 
          styles.netIncomeText,
          reportData?.netIncome >= 0 ? styles.positive : styles.negative
        ]}>
          {formatCurrency(reportData?.netIncome || 0)}
        </Text>
      </View>
    </View>
  );

  const renderCategoryAnalysis = () => (
    <View style={styles.categoryCard}>
      <Text style={styles.categoryTitle}>카테고리별 지출 분석</Text>
      
      {reportData?.categories.map((category, index) => (
        <View key={index} style={styles.categoryRow}>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
          </View>
          <View style={styles.categoryPercentage}>
            <Text style={styles.percentageText}>{category.percentage.toFixed(1)}%</Text>
          </View>
          <View style={styles.categoryBar}>
            <View 
              style={[
                styles.categoryBarFill,
                { width: `${category.percentage}%` }
              ]} 
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => Alert.alert('보고서 공유', '보고서 공유 기능을 개발 중입니다.')}
      >
        <Text style={styles.actionButtonText}>보고서 공유</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => Alert.alert('PDF 다운로드', 'PDF 다운로드 기능을 개발 중입니다.')}
      >
        <Text style={styles.actionButtonText}>PDF 다운로드</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>보고서 생성 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>재무 보고서</Text>
          <Text style={styles.headerSubtitle}>
            {reportData?.period || '2024년 1월'}
          </Text>
        </View>

        {/* Period Selector */}
        {renderPeriodSelector()}

        {/* Summary Card */}
        {renderSummaryCard()}

        {/* Category Analysis */}
        {renderCategoryAnalysis()}

        {/* Action Buttons */}
        {renderActionButtons()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedPeriodButton: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  selectedPeriodButtonText: {
    color: Colors.white,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  summaryPeriod: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeText: {
    color: Colors.indicator.positive,
  },
  expenseText: {
    color: Colors.indicator.negative,
  },
  netIncomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  positive: {
    color: Colors.indicator.positive,
  },
  negative: {
    color: Colors.indicator.negative,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.card.border,
    marginVertical: 12,
  },
  categoryCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  categoryRow: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  categoryPercentage: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  percentageText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  categoryBar: {
    height: 4,
    backgroundColor: Colors.card.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportScreen;