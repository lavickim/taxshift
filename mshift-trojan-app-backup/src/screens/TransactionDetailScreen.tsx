import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';
import { setCurrentTransaction, deleteTransaction } from '../store/slices/transactionSlice';
import { Transaction } from '../store/slices/transactionSlice';

type TransactionDetailRouteProp = RouteProp<
  { TransactionDetail: { transactionId: string } },
  'TransactionDetail'
>;

const TransactionDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<TransactionDetailRouteProp>();
  const dispatch = useDispatch();
  
  const { transactionId } = route.params;
  const { transactions, currentTransaction } = useSelector((state: RootState) => state.transaction);

  useEffect(() => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      dispatch(setCurrentTransaction(transaction));
    }
  }, [transactionId, transactions, dispatch]);

  const handleDelete = () => {
    Alert.alert(
      '거래 삭제',
      '이 거래를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            if (currentTransaction) {
              dispatch(deleteTransaction(currentTransaction.transactionId));
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!currentTransaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>거래 상세</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>거래를 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>거래 상세</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 금액 섹션 */}
        <View style={styles.amountSection}>
          <Text style={[
            styles.amountText,
            { color: currentTransaction.type === 'INCOME' ? '#4CAF50' : '#F44336' }
          ]}>
            {currentTransaction.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(currentTransaction.amount)}
          </Text>
          <Text style={styles.typeText}>
            {currentTransaction.type === 'INCOME' ? '수입' : '지출'}
          </Text>
        </View>

        {/* 기본 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본 정보</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>설명</Text>
            <Text style={styles.value}>{currentTransaction.description}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>날짜</Text>
            <Text style={styles.value}>{formatDate(currentTransaction.transactionDate)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>카테고리</Text>
            <Text style={styles.value}>{currentTransaction.category}</Text>
          </View>
          
          {currentTransaction.subcategory && (
            <View style={styles.row}>
              <Text style={styles.label}>하위 카테고리</Text>
              <Text style={styles.value}>{currentTransaction.subcategory}</Text>
            </View>
          )}
        </View>

        {/* 결제 정보 */}
        {(currentTransaction.paymentMethod || currentTransaction.bankName) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>결제 정보</Text>
            
            {currentTransaction.paymentMethod && (
              <View style={styles.row}>
                <Text style={styles.label}>결제 수단</Text>
                <Text style={styles.value}>{currentTransaction.paymentMethod}</Text>
              </View>
            )}
            
            {currentTransaction.bankName && (
              <View style={styles.row}>
                <Text style={styles.label}>은행</Text>
                <Text style={styles.value}>{currentTransaction.bankName}</Text>
              </View>
            )}
            
            {currentTransaction.cardType && (
              <View style={styles.row}>
                <Text style={styles.label}>카드 타입</Text>
                <Text style={styles.value}>{currentTransaction.cardType}</Text>
              </View>
            )}
          </View>
        )}

        {/* 위치 정보 */}
        {(currentTransaction.merchantName || currentTransaction.location) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>위치 정보</Text>
            
            {currentTransaction.merchantName && (
              <View style={styles.row}>
                <Text style={styles.label}>가맹점</Text>
                <Text style={styles.value}>{currentTransaction.merchantName}</Text>
              </View>
            )}
            
            {currentTransaction.location && (
              <View style={styles.row}>
                <Text style={styles.label}>위치</Text>
                <Text style={styles.value}>{currentTransaction.location}</Text>
              </View>
            )}
          </View>
        )}

        {/* 메모 */}
        {currentTransaction.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>메모</Text>
            <Text style={styles.noteText}>{currentTransaction.notes}</Text>
          </View>
        )}

        {/* 태그 */}
        {currentTransaction.tags && currentTransaction.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>태그</Text>
            <View style={styles.tagsContainer}>
              {currentTransaction.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 메타 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메타 정보</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>데이터 소스</Text>
            <Text style={styles.value}>
              {currentTransaction.source === 'MANUAL_ENTRY' ? '수동 입력' :
               currentTransaction.source === 'RECEIPT_OCR' ? '영수증 OCR' : '은행 연동'}
            </Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>검증 상태</Text>
            <Text style={[styles.value, { color: currentTransaction.isVerified ? '#4CAF50' : '#FF9800' }]}>
              {currentTransaction.isVerified ? '검증됨' : '미검증'}
            </Text>
          </View>
          
          {currentTransaction.confidence && (
            <View style={styles.row}>
              <Text style={styles.label}>신뢰도</Text>
              <Text style={styles.value}>{Math.round(currentTransaction.confidence * 100)}%</Text>
            </View>
          )}
          
          <View style={styles.row}>
            <Text style={styles.label}>생성일</Text>
            <Text style={styles.value}>{formatDate(currentTransaction.createdAt)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  amountSection: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  typeText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  noteText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
  },
});

export default TransactionDetailScreen;