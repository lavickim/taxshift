import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { TransactionItem } from '../components/TransactionCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateTransaction, setSelectedTransaction } from '../store/slices/transactionSlice';

const { width } = Dimensions.get('window');

// 계정과목 카테고리 목록
const CATEGORIES = [
  { id: 'revenue', name: '매출', color: '#4CAF50', icon: '💰' },
  { id: 'advertising', name: '광고선전비', color: '#FF9800', icon: '📢' },
  { id: 'office_supplies', name: '사무용품비', color: '#2196F3', icon: '📋' },
  { id: 'vehicle', name: '차량유지비', color: '#9C27B0', icon: '🚗' },
  { id: 'welfare', name: '복리후생비', color: '#FF5722', icon: '☕' },
  { id: 'online_service', name: '온라인서비스', color: '#607D8B', icon: '💻' },
  { id: 'utilities', name: '공과금', color: '#795548', icon: '⚡' },
  { id: 'rent', name: '임대료', color: '#E91E63', icon: '🏢' },
  { id: 'other', name: '기타', color: '#757575', icon: '📝' }
];

type TransactionDetailScreenProps = {
  route: {
    params: {
      transaction: TransactionItem;
    };
  };
};

const TransactionDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { selectedTransaction } = useAppSelector(state => state.transaction);

  // route params에서 거래 정보 가져오기
  const transaction = (route.params as any)?.transaction || selectedTransaction;

  const [editMode, setEditMode] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState<TransactionItem>(transaction);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [memo, setMemo] = useState(transaction?.description || '');

  useEffect(() => {
    if (transaction) {
      setEditedTransaction(transaction);
      setMemo(transaction.description || '');
    }
  }, [transaction]);

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>거래 정보를 불러올 수 없습니다.</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    const updatedTransaction = {
      ...editedTransaction,
      description: memo,
    };
    
    dispatch(updateTransaction(updatedTransaction));
    setEditMode(false);
    
    Alert.alert(
      '저장 완료',
      '거래 정보가 성공적으로 수정되었습니다.',
      [{ text: '확인', style: 'default' }]
    );
  };

  const handleCategorySelect = (category: typeof CATEGORIES[0]) => {
    setEditedTransaction({
      ...editedTransaction,
      category: category.name
    });
    setShowCategoryModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return Colors.status.success;
      case 'pending': return Colors.status.warning;
      case 'rejected': return Colors.status.error;
      default: return Colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '승인완료';
      case 'pending': return '검토필요';
      case 'rejected': return '거부됨';
      default: return '알 수 없음';
    }
  };

  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>계정과목 선택</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.categoryItem}
                onPress={() => handleCategorySelect(item)}
              >
                <Text style={styles.categoryIcon}>{item.icon}</Text>
                <Text style={styles.categoryName}>{item.name}</Text>
                <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>거래 상세</Text>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => editMode ? handleSave() : setEditMode(true)}
        >
          <Text style={styles.headerButtonText}>
            {editMode ? '저장' : '수정'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Transaction Card */}
        <View style={styles.transactionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.merchantInfo}>
              <Text style={styles.merchantName}>{transaction.merchant}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
                <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
              </View>
            </View>
            <Text style={styles.transactionDate}>{transaction.transactionDate}</Text>
          </View>
          
          <View style={styles.amountContainer}>
            <Text style={[
              styles.amount,
              transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
            ]}>
              {transaction.type === 'income' ? '+' : '-'}
              {transaction.amount.toLocaleString()}원
            </Text>
            <Text style={styles.amountType}>
              {transaction.type === 'income' ? '수입' : '지출'}
            </Text>
          </View>
        </View>

        {/* Category Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정과목</Text>
          <TouchableOpacity 
            style={styles.categorySelector}
            onPress={() => editMode && setShowCategoryModal(true)}
            disabled={!editMode}
          >
            <Text style={styles.categoryText}>
              {editedTransaction.category}
            </Text>
            {editMode && <Text style={styles.editIcon}>✎</Text>}
          </TouchableOpacity>
        </View>

        {/* AI Classification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI 분류 결과</Text>
          <View style={styles.aiResultContainer}>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceBarFill,
                  { width: `${transaction.confidence * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.confidenceText}>
              신뢰도: {(transaction.confidence * 100).toFixed(1)}%
            </Text>
          </View>
          <Text style={styles.aiDescription}>
            {transaction.confidence > 0.8 ? '높은 신뢰도로 분류되었습니다.' :
             transaction.confidence > 0.6 ? '중간 신뢰도로 분류되었습니다.' :
             '낮은 신뢰도로 분류되었습니다. 확인이 필요합니다.'}
          </Text>
        </View>

        {/* Memo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메모</Text>
          <TextInput
            style={[
              styles.memoInput,
              editMode ? styles.memoInputEditable : styles.memoInputReadonly
            ]}
            value={memo}
            onChangeText={setMemo}
            placeholder="메모를 입력하세요..."
            multiline
            editable={editMode}
            numberOfLines={4}
          />
        </View>

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>거래 정보</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>거래 ID</Text>
            <Text style={styles.detailValue}>{transaction.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>거래 유형</Text>
            <Text style={styles.detailValue}>
              {transaction.type === 'income' ? '수입' : '지출'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>처리 상태</Text>
            <Text style={[styles.detailValue, { color: getStatusColor(transaction.status) }]}>
              {getStatusText(transaction.status)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {editMode && (
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setEditMode(false);
                setEditedTransaction(transaction);
                setMemo(transaction.description || '');
              }}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>저장</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {renderCategoryModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  transactionCard: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  amountContainer: {
    alignItems: 'center',
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  incomeAmount: {
    color: Colors.indicator.positive,
  },
  expenseAmount: {
    color: Colors.indicator.negative,
  },
  amountType: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  categoryText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  editIcon: {
    fontSize: 16,
    color: Colors.primary,
  },
  aiResultContainer: {
    marginBottom: 8,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: Colors.card.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  aiDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  memoInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  memoInputEditable: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  memoInputReadonly: {
    borderColor: Colors.card.border,
    backgroundColor: Colors.background,
    color: Colors.text.secondary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.card.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modalCloseButton: {
    fontSize: 20,
    color: Colors.text.secondary,
    padding: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransactionDetailScreen;