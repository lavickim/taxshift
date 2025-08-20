import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { AppDispatch } from '../store';
import {
  selectBookkeepingStats,
  selectJournalEntries,
  selectBookkeepingFilters,
  fetchJournalEntries,
  processTransaction,
  updateFilters
} from '../store/slices/bookkeepingSlice';
import JournalEntryCard from '../components/bookkeeping/JournalEntryCard';
import StatCard from '../components/bookkeeping/StatCard';
import QuickActionButton from '../components/bookkeeping/QuickActionButton';

const { width: screenWidth } = Dimensions.get('window');

interface BookkeepingHomeScreenProps {
  navigation: any;
}

const BookkeepingHomeScreen: React.FC<BookkeepingHomeScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const stats = useSelector(selectBookkeepingStats) || {
    totalEntries: 0,
    pendingReview: 0,
    completedToday: 0,
    errorEntries: 0,
    totalAmount: 0
  };
  const journalEntries = useSelector(selectJournalEntries);
  const filters = useSelector(selectBookkeepingFilters);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadInitialData();
  }, [selectedPeriod]);

  const loadInitialData = async () => {
    try {
      const { startDate, endDate } = getPeriodDates(selectedPeriod);
      
      dispatch(updateFilters({
        startDate,
        endDate,
        companyId: 'default-company' // TODO: 실제 회사 ID 사용
      }));

      const result = dispatch(fetchJournalEntries({
        companyId: 'default-company',
        startDate,
        endDate
      }));
      
      if (result && typeof result.unwrap === 'function') {
        await result.unwrap();
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const getPeriodDates = (period: 'today' | 'week' | 'month') => {
    const now = new Date();
    let startDate: string;
    let endDate: string = now.toISOString().split('T')[0];

    switch (period) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = monthStart.toISOString().split('T')[0];
        break;
      default:
        startDate = endDate;
    }

    return { startDate, endDate };
  };

  const handleQuickTransaction = () => {
    navigation.navigate('QuickJournalEntry');
  };

  const handleViewAllEntries = () => {
    navigation.navigate('JournalEntryList');
  };

  const handleViewReports = () => {
    navigation.navigate('FinancialStatements');
  };

  const recentEntries = (journalEntries || []).slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>복식부기 엔진</Text>
          <Text style={styles.headerSubtitle}>AI 자동 분개 시스템</Text>
        </View>
        
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['today', 'week', 'month'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period === 'today' ? '오늘' : period === 'week' ? '이번 주' : '이번 달'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics Dashboard */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="완료된 분개"
              value={stats.completedToday}
              icon="checkmark-circle"
              color="#10B981"
              subtitle="건"
            />
            <StatCard
              title="검토 필요"
              value={stats.pendingReview}
              icon="time-outline"
              color="#F59E0B"
              subtitle="건"
            />
          </View>
          
          <View style={styles.statsRow}>
            <StatCard
              title="총 분개 수"
              value={stats.totalEntries}
              icon="document-text"
              color="#3B82F6"
              subtitle="건"
            />
            <StatCard
              title="총 금액"
              value={`₩${stats.totalAmount.toLocaleString()}`}
              icon="cash"
              color="#8B5CF6"
              subtitle=""
              isAmount={true}
            />
          </View>

          {stats.errorEntries > 0 && (
            <View style={styles.errorSection}>
              <StatCard
                title="오류 분개"
                value={stats.errorEntries}
                icon="warning"
                color="#EF4444"
                subtitle="건 - 확인 필요"
              />
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>빠른 작업</Text>
          <View style={styles.quickActionsRow}>
            <QuickActionButton
              title="거래 입력"
              icon="add-circle"
              color="#10B981"
              onPress={handleQuickTransaction}
            />
            <QuickActionButton
              title="전체 분개"
              icon="list"
              color="#3B82F6"
              onPress={handleViewAllEntries}
            />
            <QuickActionButton
              title="재무제표"
              icon="pie-chart"
              color="#8B5CF6"
              onPress={handleViewReports}
            />
          </View>
        </View>

        {/* Recent Journal Entries */}
        <View style={styles.recentEntriesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 분개</Text>
            <TouchableOpacity onPress={handleViewAllEntries}>
              <Text style={styles.viewAllText}>전체 보기</Text>
            </TouchableOpacity>
          </View>

          {recentEntries.length > 0 ? (
            recentEntries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onPress={() => navigation.navigate('JournalEntryDetail', { entryId: entry.id })}
                onApprove={() => {
                  // TODO: Implement approval logic
                  console.log('Approve entry:', entry.id);
                }}
                onEdit={() => navigation.navigate('JournalEntryEdit', { entryId: entry.id })}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>분개가 없습니다</Text>
              <Text style={styles.emptyStateSubtext}>
                거래를 입력하여 자동 분개를 생성해보세요
              </Text>
            </View>
          )}
        </View>

        {/* AI Processing Stats */}
        <View style={styles.aiStatsContainer}>
          <Text style={styles.sectionTitle}>AI 처리 현황</Text>
          <View style={styles.aiStatsContent}>
            <View style={styles.aiStatItem}>
              <View style={styles.aiStatIndicator}>
                <View style={[styles.aiStatDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.aiStatLabel}>자동 처리</Text>
              </View>
              <Text style={styles.aiStatValue}>89.3%</Text>
            </View>
            
            <View style={styles.aiStatItem}>
              <View style={styles.aiStatIndicator}>
                <View style={[styles.aiStatDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.aiStatLabel}>검토 필요</Text>
              </View>
              <Text style={styles.aiStatValue}>8.6%</Text>
            </View>
            
            <View style={styles.aiStatItem}>
              <View style={styles.aiStatIndicator}>
                <View style={[styles.aiStatDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.aiStatLabel}>수동 처리</Text>
              </View>
              <Text style={styles.aiStatValue}>2.1%</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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
    marginBottom: 20,
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: 'white',
  },
  periodButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
    marginTop: -10,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  errorSection: {
    marginTop: 8,
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  recentEntriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  aiStatsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  aiStatsContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  aiStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  aiStatIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  aiStatLabel: {
    fontSize: 14,
    color: '#374151',
  },
  aiStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default BookkeepingHomeScreen;