import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { apiCall, API_CONFIG } from '../config/api';
import TransactionService from '../services/TransactionService';
import { Transaction, TransactionData } from '../types/Transaction';

const AccountDetailScreen = () => {
  const navigation = useNavigation();
  const [transactionClassifications, setTransactionClassifications] = useState<{[key: string]: string}>({});
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);

  const goBack = () => {
    navigation.goBack();
  };

  // Load transaction data and classify transactions on component mount
  useEffect(() => {
    loadTransactionData();
  }, []);
  
  // 화면이 포커스될 때마다 데이터 새로고침
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('AccountDetailScreen focused, refreshing data...');
      loadTransactionData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadTransactionData = async () => {
    try {
      setLoading(true);
      const transactionService = TransactionService.getInstance();
      
      // 강제로 새로운 데이터 로드
      const data = await transactionService.refreshData();
      
      console.log('AccountDetailScreen - Loaded data:', {
        bankName: data.accountInfo.bankName,
        balance: data.accountInfo.balance,
        transactionCount: data.transactions.length
      });
      
      setTransactionData(data);
      
      // Classify transactions after loading
      if (data.transactions && data.transactions.length > 0) {
        classifyTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Failed to load transaction data:', error);
      Alert.alert('데이터 로딩 오류', `거래 내역을 불러오는데 실패했습니다.\n오류: ${error instanceof Error ? error.message : String(error)}`);
      
      // 에러 시에도 기본 데이터 설정
      setTransactionData({
        accountInfo: {
          bankName: "기업은행",
          accountNumber: "****-****-****-1234",
          balance: "0",
          currency: "원"
        },
        transactions: []
      });
    } finally {
      setLoading(false);
    }
  };

  const classifyTransactions = async (transactions: Transaction[]) => {
    const classifications: {[key: string]: string} = {};
    
    for (const transaction of transactions) {
      try {
        console.log(`Classifying transaction: ${transaction.description}`);
        const response = await apiCall(API_CONFIG.ENDPOINTS.MATCH, {
          method: 'POST',
          body: JSON.stringify({
            inputText: transaction.description,
            returnAllMatches: false
          })
        });

        if (response.ok) {
          const result = await response.json();
          const category = result.matchedRules?.[0]?.category || transaction.category || '미분류';
          classifications[transaction.description] = category;
          console.log(`Classification result: ${category}`);
        } else {
          console.log(`Classification failed: ${response.status}`);
          classifications[transaction.description] = transaction.category || '분류실패';
        }
      } catch (error) {
        console.log(`Classification error: ${error}`);
        classifications[transaction.description] = transaction.category || '네트워크오류';
      }
    }
    
    setTransactionClassifications(classifications);
  };

  const classifyTransaction = async (description: string) => {
    try {
      console.log(`Manual classification for: ${description}`);
      const response = await apiCall(API_CONFIG.ENDPOINTS.MATCH, {
        method: 'POST',
        body: JSON.stringify({
          inputText: description,
          returnAllMatches: false
        })
      });

      if (response.ok) {
        const result = await response.json();
        const category = result.matchedRules?.[0]?.category || '미분류';
        console.log(`Manual classification result: ${category}`);
        Alert.alert('거래 분류', `거래명: ${description}\n분류: ${category}`);
      } else {
        console.log(`Manual classification failed: ${response.status}`);
        Alert.alert('분류 실패', `API 호출에 실패했습니다. (${response.status})`);
      }
    } catch (error) {
      console.log(`Manual classification error: ${error}`);
      Alert.alert('네트워크 오류', `API 서버에 연결할 수 없습니다.\n오류: ${error}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>계좌 상세</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>거래 내역을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!transactionData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>계좌 상세</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>거래 내역을 불러올 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { accountInfo, transactions } = transactionData;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{accountInfo.bankName} 계좌상세</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>잔액</Text>
          <Text style={styles.balanceAmount}>{accountInfo.balance}{accountInfo.currency}</Text>
        </View>

        <View style={styles.transactionsList}>
          {transactions.map((transaction, index) => (
            <TouchableOpacity 
              key={transaction.id || index} 
              style={styles.transactionItem}
              onPress={() => classifyTransaction(transaction.description)}
            >
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionDate}>{transaction.displayDate}</Text>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                {transactionClassifications[transaction.description] && (
                  <Text style={styles.classificationTag}>
                    분류: {transactionClassifications[transaction.description]}
                  </Text>
                )}
              </View>
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  transaction.amount < 0 ? styles.negativeAmount : styles.positiveAmount
                ]}>
                  {transaction.displayAmount}
                </Text>
                <Text style={styles.transactionBalance}>{transaction.displayBalance}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 18,
    color: Colors.text.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerRight: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  balanceContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 8,
    borderBottomColor: Colors.background,
  },
  balanceLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  transactionsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  transactionRight: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  positiveAmount: {
    color: Colors.indicator.positive,
  },
  negativeAmount: {
    color: Colors.text.primary,
  },
  transactionBalance: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  classificationTag: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default AccountDetailScreen; 