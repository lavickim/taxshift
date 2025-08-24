import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchTransactions } from '../store/slices/transactionSlice';

export default function TransactionListScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { transactions, loading } = useSelector((state: RootState) => state.transaction);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactions() as any);
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTransactions() as any);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categoryName?.toLowerCase() || '';
    if (category.includes('음식') || category.includes('식당')) return '🍽️';
    if (category.includes('카페') || category.includes('커피')) return '☕';
    if (category.includes('교통') || category.includes('버스') || category.includes('지하철')) return '🚌';
    if (category.includes('쇼핑') || category.includes('마트')) return '🛍️';
    if (category.includes('급여') || category.includes('수입')) return '💰';
    if (category.includes('생활') || category.includes('공과금')) return '🏠';
    return '📝';
  };

  const getCategoryColor = (transactionType: string) => {
    return transactionType === 'INCOME' ? '#4ECDC4' : '#FF6B6B';
  };

  const renderTransaction = ({ item }: any) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
    >
      <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(item.transactionType) }]}>
        <Text style={styles.iconText}>{getCategoryIcon(item.categoryName || '')}</Text>
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionCategory}>{item.categoryName || '미분류'}</Text>
        <Text style={styles.transactionDate}>{formatDate(new Date(item.transactionDate))}</Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[
          styles.transactionAmount,
          { color: item.transactionType === 'INCOME' ? '#4ECDC4' : '#FF6B6B' }
        ]}>
          {item.transactionType === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
        <Text style={styles.paymentMethod}>{item.assetName || ''}</Text>
      </View>
      
      <Text style={styles.arrow}>▶</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>거래 내역</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>이번 달 수입</Text>
          <Text style={[styles.summaryAmount, { color: '#4ECDC4' }]}>
            +₩3,500,000
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>이번 달 지출</Text>
          <Text style={[styles.summaryAmount, { color: '#FF6B6B' }]}>
            -₩890,000
          </Text>
        </View>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.transactionId?.toString() || Math.random().toString()}
        style={styles.transactionList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>거래 내역이 없습니다</Text>
            <Text style={styles.emptySubtext}>영수증을 촬영하여 거래를 추가해보세요</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Text style={styles.fabIcon}>➕</Text>
      </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  arrow: {
    fontSize: 16,
    color: '#ccc',
    marginLeft: 8,
  },
  emptyIcon: {
    fontSize: 64,
    opacity: 0.3,
  },
  fabIcon: {
    fontSize: 28,
    color: 'white',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});