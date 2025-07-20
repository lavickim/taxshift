import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import TransactionCard, { TransactionItem } from '../components/TransactionCard';
import { apiCall, API_CONFIG } from '../config/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setTransactions, 
  setFilteredTransactions, 
  setActiveTab, 
  setSearchQuery, 
  setLoading, 
  setRefreshing, 
  setError, 
  setSelectedTransaction 
} from '../store/slices/transactionSlice';

type TabType = 'all' | 'pending' | 'approved';

const TransactionListScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { 
    transactions, 
    filteredTransactions, 
    activeTab, 
    searchQuery, 
    loading, 
    refreshing, 
    error 
  } = useAppSelector(state => state.transaction);

  useEffect(() => {
    loadTransactions();
  }, []);

  // 화면 포커스 시 데이터 새로고침 (선택적)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('TransactionListScreen focused');
      // 필요시 데이터 새로고침
      // loadTransactions();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, activeTab, searchQuery]);

  const loadTransactions = async () => {
    try {
      dispatch(setLoading(true));
      const response = await apiCall(API_CONFIG.ENDPOINTS.TRANSACTIONS_BANK_A);
      
      if (response.ok) {
        const data = await response.json();
        const transactionList: TransactionItem[] = data.transactions || [];
        dispatch(setTransactions(transactionList));
        console.log('Transactions loaded:', transactionList.length);
      } else {
        console.error('Failed to load transactions:', response.status);
        dispatch(setError('거래 데이터를 불러올 수 없습니다.'));
        Alert.alert('데이터 로드 실패', '거래 데이터를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      dispatch(setError('서버에 연결할 수 없습니다.'));
      Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // 탭 필터링
    if (activeTab === 'pending') {
      filtered = filtered.filter(t => t.status === 'pending');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(t => t.status === 'approved');
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      filtered = filtered.filter(t => 
        t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    dispatch(setFilteredTransactions(filtered));
  };

  const onRefresh = async () => {
    dispatch(setRefreshing(true));
    await loadTransactions();
    dispatch(setRefreshing(false));
  };

  const handleTransactionPress = (transaction: TransactionItem) => {
    console.log('Transaction pressed:', transaction);
    dispatch(setSelectedTransaction(transaction));
    // 거래 상세 화면으로 이동
    navigation.navigate('TransactionDetail' as never, { transaction } as never);
  };

  const getTabCount = (tab: TabType) => {
    switch (tab) {
      case 'all':
        return transactions.length;
      case 'pending':
        return transactions.filter(t => t.status === 'pending').length;
      case 'approved':
        return transactions.filter(t => t.status === 'approved').length;
      default:
        return 0;
    }
  };

  const renderTabButton = (tab: TabType, label: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => dispatch(setActiveTab(tab))}
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.activeTabButtonText
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.tabCount,
        activeTab === tab && styles.activeTabCount
      ]}>
        {getTabCount(tab)}
      </Text>
    </TouchableOpacity>
  );

  const renderTransactionItem = ({ item }: { item: TransactionItem }) => (
    <TransactionCard
      transaction={item}
      onPress={handleTransactionPress}
      showConfidence={true}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {searchQuery ? '검색 결과가 없습니다' : '거래 내역이 없습니다'}
      </Text>
      <Text style={styles.emptyStateSubText}>
        {searchQuery ? '다른 검색어를 입력해보세요' : '거래 데이터를 불러오는 중입니다'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>거래 내역</Text>
        <Text style={styles.headerSubtitle}>
          총 {transactions.length}건의 거래
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="거래처, 분류, 메모 검색..."
          value={searchQuery}
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton('all', '전체')}
        {renderTabButton('pending', '검토필요')}
        {renderTabButton('approved', '승인완료')}
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: Colors.card.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  activeTabButtonText: {
    color: Colors.white,
  },
  tabCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  activeTabCount: {
    color: Colors.white,
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: Colors.text.light,
    textAlign: 'center',
  },
});

export default TransactionListScreen;