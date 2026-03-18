import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { IncomeStatement } from '../../services/FinancialStatementService';

const screenWidth = Dimensions.get('window').width;

interface IncomeStatementComponentProps {
  data: IncomeStatement;
  periodStart: string;
  periodEnd: string;
}

const IncomeStatementComponent: React.FC<IncomeStatementComponentProps> = ({ 
  data, 
  periodStart, 
  periodEnd 
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['revenue', 'expenses']));
  const [showChart, setShowChart] = useState(false);

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString();
  };

  const formatPeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.getFullYear()}.${(start.getMonth() + 1).toString().padStart(2, '0')}.${start.getDate().toString().padStart(2, '0')} ~ ${end.getFullYear()}.${(end.getMonth() + 1).toString().padStart(2, '0')}.${end.getDate().toString().padStart(2, '0')}`;
  };

  const getTotalRevenue = () => {
    return data.revenue.reduce((sum, item) => sum + item.amount, 0);
  };

  const getTotalExpenses = () => {
    return data.expenses.reduce((sum, item) => sum + item.amount, 0);
  };

  const getNetIncome = () => {
    return getTotalRevenue() - getTotalExpenses();
  };

  const getGrossProfit = () => {
    const totalRevenue = getTotalRevenue();
    const cogs = data.expenses.find(e => e.category === 'COGS')?.amount || 0;
    return totalRevenue - cogs;
  };

  const getOperatingIncome = () => {
    const grossProfit = getGrossProfit();
    const operatingExpenses = data.expenses
      .filter(e => e.category === 'OPERATING')
      .reduce((sum, exp) => sum + exp.amount, 0);
    return grossProfit - operatingExpenses;
  };

  const getNetProfitMargin = () => {
    const totalRevenue = getTotalRevenue();
    const netIncome = getNetIncome();
    return totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
  };

  const renderAccountItem = (account: any, level: number = 0) => (
    <View key={account.accountCode} style={[styles.accountItem, { paddingLeft: 16 + (level * 16) }]}>
      <View style={styles.accountInfo}>
        <Text style={[styles.accountCode, level === 0 && styles.mainAccountCode]}>
          {account.accountCode}
        </Text>
        <Text style={[styles.accountName, level === 0 && styles.mainAccountName]}>
          {account.accountName}
        </Text>
      </View>
      <Text style={[styles.accountAmount, level === 0 && styles.mainAccountAmount]}>
        ₩{formatAmount(account.amount)}
      </Text>
    </View>
  );

  const renderSection = (title: string, items: any[], sectionKey: string, color: string) => {
    const isExpanded = expandedSections.has(sectionKey);
    const total = items.reduce((sum, item) => sum + item.amount, 0);

    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.sectionHeader, { borderLeftColor: color }]}
          onPress={() => toggleSection(sectionKey)}
        >
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionTotal}>₩{formatAmount(total)}</Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sectionContent}>
            {items.map((item) => renderAccountItem(item))}
            
            <View style={[styles.sectionTotalRow, { borderColor: color }]}>
              <Text style={styles.sectionTotalLabel}>{title} 계</Text>
              <Text style={styles.sectionTotalAmount}>₩{formatAmount(total)}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderSummaryCard = () => {
    const totalRevenue = getTotalRevenue();
    const totalExpenses = getTotalExpenses();
    const netIncome = getNetIncome();
    const grossProfit = getGrossProfit();
    const operatingIncome = getOperatingIncome();
    const profitMargin = getNetProfitMargin();

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>손익계산서 요약</Text>
          <Text style={styles.periodText}>
            {formatPeriod(periodStart, periodEnd)}
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#10B98115' }]}>
              <Ionicons name="trending-up" size={20} color="#10B981" />
            </View>
            <Text style={styles.metricLabel}>총 수익</Text>
            <Text style={[styles.metricValue, { color: '#10B981' }]}>
              ₩{formatAmount(totalRevenue)}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#EF444415' }]}>
              <Ionicons name="trending-down" size={20} color="#EF4444" />
            </View>
            <Text style={styles.metricLabel}>총 비용</Text>
            <Text style={[styles.metricValue, { color: '#EF4444' }]}>
              ₩{formatAmount(totalExpenses)}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: netIncome >= 0 ? '#10B98115' : '#EF444415' }]}>
              <Ionicons 
                name={netIncome >= 0 ? 'checkmark-circle' : 'close-circle'} 
                size={20} 
                color={netIncome >= 0 ? '#10B981' : '#EF4444'} 
              />
            </View>
            <Text style={styles.metricLabel}>순이익</Text>
            <Text style={[
              styles.metricValue, 
              { color: netIncome >= 0 ? '#10B981' : '#EF4444' }
            ]}>
              ₩{formatAmount(netIncome)}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#8B5CF615' }]}>
              <Ionicons name="pie-chart" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.metricLabel}>순이익률</Text>
            <Text style={[styles.metricValue, { color: '#8B5CF6' }]}>
              {profitMargin.toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Profit Levels */}
        <View style={styles.profitLevels}>
          <Text style={styles.profitLevelsTitle}>수익성 분석</Text>
          
          <View style={styles.profitLevel}>
            <Text style={styles.profitLevelLabel}>매출총이익</Text>
            <Text style={styles.profitLevelAmount}>₩{formatAmount(grossProfit)}</Text>
            <Text style={styles.profitLevelPercent}>
              {totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}%
            </Text>
          </View>

          <View style={styles.profitLevel}>
            <Text style={styles.profitLevelLabel}>영업이익</Text>
            <Text style={styles.profitLevelAmount}>₩{formatAmount(operatingIncome)}</Text>
            <Text style={styles.profitLevelPercent}>
              {totalRevenue > 0 ? ((operatingIncome / totalRevenue) * 100).toFixed(1) : 0}%
            </Text>
          </View>

          <View style={styles.profitLevel}>
            <Text style={styles.profitLevelLabel}>순이익</Text>
            <Text style={[
              styles.profitLevelAmount,
              { color: netIncome >= 0 ? '#10B981' : '#EF4444' }
            ]}>
              ₩{formatAmount(netIncome)}
            </Text>
            <Text style={[
              styles.profitLevelPercent,
              { color: netIncome >= 0 ? '#10B981' : '#EF4444' }
            ]}>
              {profitMargin.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderChart = () => {
    if (!showChart) return null;

    // 월별 매출/비용 트렌드 데이터 (시뮬레이션)
    const chartData = {
      labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
      datasets: [
        {
          data: [120000, 135000, 145000, 160000, 155000, 180000],
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // 수익 (녹색)
          strokeWidth: 3
        },
        {
          data: [90000, 98000, 105000, 120000, 115000, 135000],
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // 비용 (빨강)
          strokeWidth: 3
        }
      ]
    };

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>월별 손익 추이</Text>
          <TouchableOpacity onPress={() => setShowChart(false)}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <LineChart
          data={chartData}
          width={screenWidth - 64}
          height={220}
          yAxisLabel="₩"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#4F46E5'
            }
          }}
          bezier
          style={styles.chart}
        />
        
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>수익</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>비용</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Summary Card */}
      {renderSummaryCard()}

      {/* Chart Toggle Button */}
      <TouchableOpacity
        style={styles.chartToggleButton}
        onPress={() => setShowChart(!showChart)}
      >
        <Ionicons name="bar-chart" size={20} color="#4F46E5" />
        <Text style={styles.chartToggleText}>
          {showChart ? '차트 숨기기' : '추이 차트 보기'}
        </Text>
      </TouchableOpacity>

      {/* Trend Chart */}
      {renderChart()}

      {/* Revenue Section */}
      {renderSection('수익', data.revenue, 'revenue', '#10B981')}

      {/* Expenses Section */}
      {renderSection('비용', data.expenses, 'expenses', '#EF4444')}

      {/* Net Income Summary */}
      <View style={styles.netIncomeContainer}>
        <View style={styles.netIncomeHeader}>
          <Text style={styles.netIncomeTitle}>순이익</Text>
          <Ionicons
            name={getNetIncome() >= 0 ? 'trending-up' : 'trending-down'}
            size={24}
            color={getNetIncome() >= 0 ? '#10B981' : '#EF4444'}
          />
        </View>
        
        <Text style={[
          styles.netIncomeAmount,
          { color: getNetIncome() >= 0 ? '#10B981' : '#EF4444' }
        ]}>
          ₩{formatAmount(getNetIncome())}
        </Text>
        
        <Text style={styles.netIncomePercent}>
          순이익률: {getNetProfitMargin().toFixed(2)}%
        </Text>
        
        <View style={styles.netIncomeFormula}>
          <Text style={styles.formulaText}>
            수익 ₩{formatAmount(getTotalRevenue())} - 비용 ₩{formatAmount(getTotalExpenses())}
          </Text>
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  periodText: {
    fontSize: 12,
    color: '#6B7280',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  profitLevels: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  profitLevelsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  profitLevel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  profitLevelLabel: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  profitLevelAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 12,
  },
  profitLevelPercent: {
    fontSize: 11,
    color: '#6B7280',
    minWidth: 40,
    textAlign: 'right',
  },
  chartToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  chartToggleText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
    marginLeft: 6,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderLeftWidth: 4,
    backgroundColor: '#FAFBFC',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionTotal: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionContent: {
    paddingBottom: 8,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  accountInfo: {
    flex: 1,
  },
  accountCode: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  mainAccountCode: {
    fontWeight: '600',
    color: '#4B5563',
  },
  accountName: {
    fontSize: 14,
    color: '#374151',
  },
  mainAccountName: {
    fontWeight: '600',
    color: '#1F2937',
  },
  accountAmount: {
    fontSize: 14,
    color: '#1F2937',
    textAlign: 'right',
  },
  mainAccountAmount: {
    fontWeight: '600',
    fontSize: 15,
  },
  sectionTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 2,
    backgroundColor: '#FAFBFC',
  },
  sectionTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionTotalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  netIncomeContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  netIncomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  netIncomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  netIncomeAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  netIncomePercent: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  netIncomeFormula: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  formulaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default IncomeStatementComponent;