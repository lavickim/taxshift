import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { AppDispatch } from '../store/store';
import {
  selectFilteredJournalEntries,
  selectBookkeepingFilters,
  fetchJournalEntries,
  updateFilters,
  confirmJournalEntry
} from '../store/slices/bookkeepingSlice';
import { BookkeepingState } from '../store/slices/bookkeepingSlice';
import JournalEntryCard from '../components/bookkeeping/JournalEntryCard';
import FilterBar from '../components/bookkeeping/FilterBar';
import { JournalEntry } from '../services/BookkeepingService';

interface JournalEntryListScreenProps {
  navigation: any;
}

const JournalEntryListScreen: React.FC<JournalEntryListScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const filteredEntries = useSelector(selectFilteredJournalEntries);
  const filters = useSelector(selectBookkeepingFilters);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadEntries(true);
  }, [filters.status, filters.startDate, filters.endDate]);

  const loadEntries = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
        setPage(1);
        setHasMore(true);
      }

      await dispatch(fetchJournalEntries({
        companyId: filters.companyId || 'default-company',
        startDate: filters.startDate,
        endDate: filters.endDate
      })).unwrap();

    } catch (error) {
      console.error('분개 목록 로딩 실패:', error);
      Alert.alert('오류', '분개 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEntries(true);
  }, [filters]);

  const loadMore = () => {
    if (!loading && hasMore) {
      // 실제 구현에서는 페이지네이션 API 호출
      console.log('Load more entries...');
    }
  };

  const handleFilterChange = (newFilters: Partial<BookkeepingState['filters']>) => {
    dispatch(updateFilters(newFilters));
  };

  const handleEntryPress = (entry: JournalEntry) => {
    navigation.navigate('JournalEntryDetail', { entryId: entry.id });
  };

  const handleEntryApprove = async (entry: JournalEntry) => {
    try {
      await dispatch(confirmJournalEntry(entry.id)).unwrap();
      Alert.alert('완료', '분개가 승인되었습니다.');
    } catch (error) {
      Alert.alert('오류', '분개 승인 중 오류가 발생했습니다.');
    }
  };

  const handleEntryEdit = (entry: JournalEntry) => {
    navigation.navigate('JournalEntryEdit', { entryId: entry.id });
  };

  const handleBulkApprove = () => {
    const draftEntries = filteredEntries.filter(entry => entry.status === 'DRAFT');
    
    if (draftEntries.length === 0) {
      Alert.alert('알림', '승인할 분개가 없습니다.');
      return;
    }

    Alert.alert(
      '일괄 승인',
      `${draftEntries.length}개의 분개를 일괄 승인하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '승인',
          onPress: async () => {
            try {
              // 실제로는 병렬 처리하거나 백엔드에서 일괄 처리 API 제공
              for (const entry of draftEntries) {
                await dispatch(confirmJournalEntry(entry.id)).unwrap();
              }
              Alert.alert('완료', `${draftEntries.length}개 분개가 승인되었습니다.`);
            } catch (error) {
              Alert.alert('오류', '일괄 승인 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  const getStatusCounts = () => {
    const counts = {
      ALL: filteredEntries.length,
      DRAFT: filteredEntries.filter(e => e.status === 'DRAFT').length,
      CONFIRMED: filteredEntries.filter(e => e.status === 'CONFIRMED').length,
      POSTED: filteredEntries.filter(e => e.status === 'POSTED').length
    };
    return counts;
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <JournalEntryCard
      entry={item}
      onPress={() => handleEntryPress(item)}
      onApprove={() => handleEntryApprove(item)}
      onEdit={() => handleEntryEdit(item)}
    />
  );

  const renderHeader = () => (
    <View>
      <FilterBar
        filters={filters}
        onFiltersChange={handleFilterChange}
        statusCounts={getStatusCounts()}
      />
      
      {/* Bulk Actions */}
      {filters.status === 'DRAFT' && getStatusCounts().DRAFT > 0 && (
        <View style={styles.bulkActionsContainer}>
          <TouchableOpacity
            style={styles.bulkApproveButton}
            onPress={handleBulkApprove}
          >
            <Ionicons name="checkmark-done" size={16} color="white" />
            <Text style={styles.bulkApproveText}>
              일괄 승인 ({getStatusCounts().DRAFT}건)
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>분개가 없습니다</Text>
      <Text style={styles.emptySubtitle}>
        {filters.status === 'ALL' 
          ? '거래를 입력하여 분개를 생성해보세요' 
          : `${getFilterStatusText(filters.status)} 분개가 없습니다`
        }
      </Text>
      
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('QuickJournalEntry')}
      >
        <Ionicons name="add" size={20} color="white" />
        <Text style={styles.createButtonText}>분개 생성</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#4F46E5" />
      </View>
    );
  };

  const getFilterStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return '검토 필요';
      case 'CONFIRMED': return '승인됨';
      case 'POSTED': return '완료됨';
      default: return '전체';
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEntry}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('QuickJournalEntry')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // FAB을 위한 공간
  },
  bulkActionsContainer: {
    paddingVertical: 12,
  },
  bulkApproveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bulkApproveText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    
    // Shadow for Android
    elevation: 8,
  },
});

export default JournalEntryListScreen;