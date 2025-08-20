import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AppDispatch } from '../store';
import {
  selectCurrentJournalEntry,
  fetchJournalEntry,
  confirmJournalEntry,
  setCurrentJournalEntry
} from '../store/slices/bookkeepingSlice';
import { JournalEntry, JournalEntryDetail } from '../services/BookkeepingService';
import BookkeepingService from '../services/BookkeepingService';

interface JournalEntryDetailScreenProps {
  navigation: any;
  route: {
    params: {
      entryId: number;
    };
  };
}

const JournalEntryDetailScreen: React.FC<JournalEntryDetailScreenProps> = ({
  navigation,
  route
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const journalEntry = useSelector(selectCurrentJournalEntry);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const { entryId } = route.params;

  useEffect(() => {
    loadJournalEntry();
  }, [entryId]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `분개 #${entryId}`,
      headerRight: () => (
        <View style={styles.headerActions}>
          {journalEntry?.status === 'DRAFT' && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleConfirm}
              disabled={confirming}
            >
              <Ionicons name="checkmark" size={24} color="#10B981" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [journalEntry, confirming]);

  const loadJournalEntry = async () => {
    try {
      setLoading(true);
      await dispatch(fetchJournalEntry(entryId)).unwrap();
    } catch (error) {
      console.error('분개 조회 실패:', error);
      Alert.alert('오류', '분개를 불러오는데 실패했습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!journalEntry) return;

    try {
      setConfirming(true);
      
      // 클라이언트 사이드 검증
      const validation = BookkeepingService.validateJournalEntry(journalEntry);
      
      if (!validation.isBalanced) {
        Alert.alert(
          '검증 실패',
          `분개에 오류가 있습니다:\n${validation.errors.join('\n')}`,
          [{ text: '확인' }]
        );
        return;
      }

      Alert.alert(
        '분개 승인',
        '이 분개를 승인하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '승인',
            onPress: async () => {
              try {
                await dispatch(confirmJournalEntry(entryId)).unwrap();
                Alert.alert('완료', '분개가 승인되었습니다.');
              } catch (error) {
                Alert.alert('오류', '분개 승인 중 오류가 발생했습니다.');
              }
            }
          }
        ]
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('JournalEntryEdit', { entryId });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { color: '#F59E0B', text: '검토 필요', icon: 'time' };
      case 'CONFIRMED':
        return { color: '#3B82F6', text: '승인됨', icon: 'checkmark-circle' };
      case 'POSTED':
        return { color: '#10B981', text: '완료됨', icon: 'checkmark-done-circle' };
      default:
        return { color: '#6B7280', text: status, icon: 'help-circle' };
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderJournalEntryDetail = (detail: JournalEntryDetail, index: number) => {
    const isDebit = detail.debitAmount > 0;
    const amount = isDebit ? detail.debitAmount : detail.creditAmount;

    return (
      <View key={detail.id || index} style={styles.detailRow}>
        <View style={styles.detailLeft}>
          <Text style={styles.lineNumber}>{detail.lineNumber}</Text>
          <View style={styles.accountInfo}>
            <Text style={styles.accountCode}>{detail.accountCode}</Text>
            <Text style={styles.accountName}>{detail.accountName}</Text>
            {detail.description && (
              <Text style={styles.detailDescription}>{detail.description}</Text>
            )}
          </View>
        </View>

        <View style={styles.detailRight}>
          <View style={styles.amountColumns}>
            <View style={styles.amountColumn}>
              <Text style={[styles.columnHeader, { color: '#DC2626' }]}>차변</Text>
              <Text style={[styles.amount, isDebit ? styles.activeAmount : styles.inactiveAmount]}>
                {isDebit ? `₩${formatAmount(amount)}` : '-'}
              </Text>
            </View>
            <View style={styles.amountColumn}>
              <Text style={[styles.columnHeader, { color: '#059669' }]}>대변</Text>
              <Text style={[styles.amount, !isDebit ? styles.activeAmount : styles.inactiveAmount]}>
                {!isDebit ? `₩${formatAmount(amount)}` : '-'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>분개를 불러오는 중...</Text>
      </View>
    );
  }

  if (!journalEntry) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="document-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>분개를 찾을 수 없습니다</Text>
      </View>
    );
  }

  const statusInfo = getStatusInfo(journalEntry.status);
  const validation = BookkeepingService.validateJournalEntry(journalEntry);

  return (
    <ScrollView style={styles.container}>
      {/* Header Info */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.entryId}>분개 #{journalEntry.id}</Text>
          <Text style={styles.entryDate}>{formatDate(journalEntry.entryDate)}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
          <Ionicons name={statusInfo.icon as any} size={16} color="white" />
          <Text style={styles.statusText}>{statusInfo.text}</Text>
        </View>
      </LinearGradient>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>거래 내용</Text>
        <Text style={styles.description}>{journalEntry.description}</Text>
      </View>

      {/* AI Generation Info */}
      {journalEntry.autoGenerated && (
        <View style={styles.section}>
          <View style={styles.aiHeader}>
            <Ionicons name="flash" size={20} color="#8B5CF6" />
            <Text style={styles.aiTitle}>AI 자동 생성</Text>
            {journalEntry.confidence && (
              <Text style={styles.confidenceScore}>신뢰도: {journalEntry.confidence}%</Text>
            )}
          </View>
        </View>
      )}

      {/* Validation Status */}
      <View style={styles.section}>
        <View style={styles.validationHeader}>
          <Ionicons
            name={validation.isBalanced ? 'shield-checkmark' : 'warning'}
            size={20}
            color={validation.isBalanced ? '#10B981' : '#EF4444'}
          />
          <Text style={[
            styles.validationTitle,
            { color: validation.isBalanced ? '#10B981' : '#EF4444' }
          ]}>
            {validation.isBalanced ? '대차평균 일치' : '대차평균 불일치'}
          </Text>
        </View>
        
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceText}>
            차변 합계: ₩{formatAmount(validation.totalDebit)}
          </Text>
          <Text style={styles.balanceText}>
            대변 합계: ₩{formatAmount(validation.totalCredit)}
          </Text>
        </View>

        {validation.errors.length > 0 && (
          <View style={styles.errorsContainer}>
            <Text style={styles.errorsTitle}>검증 오류:</Text>
            {validation.errors.map((error, index) => (
              <Text key={index} style={styles.errorItem}>• {error}</Text>
            ))}
          </View>
        )}
      </View>

      {/* Journal Entry Details */}
      <View style={styles.section}>
        <View style={styles.detailsHeader}>
          <Text style={styles.sectionTitle}>분개 상세</Text>
          <Text style={styles.totalAmount}>
            총액: ₩{formatAmount(journalEntry.totalAmount)}
          </Text>
        </View>

        <View style={styles.detailsTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>계정과목</Text>
            <View style={styles.amountHeaders}>
              <Text style={[styles.tableHeaderText, { color: '#DC2626' }]}>차변</Text>
              <Text style={[styles.tableHeaderText, { color: '#059669' }]}>대변</Text>
            </View>
          </View>

          {journalEntry.details.map((detail, index) => 
            renderJournalEntryDetail(detail, index)
          )}
        </View>
      </View>

      {/* Reference Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>참조 정보</Text>
        <View style={styles.referenceInfo}>
          <Text style={styles.referenceItem}>
            참조 유형: {journalEntry.referenceType}
          </Text>
          {journalEntry.referenceId && (
            <Text style={styles.referenceItem}>
              참조 ID: {journalEntry.referenceId}
            </Text>
          )}
          <Text style={styles.referenceItem}>
            생성일: {formatDate(journalEntry.createdAt)}
          </Text>
          <Text style={styles.referenceItem}>
            수정일: {formatDate(journalEntry.updatedAt)}
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
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  entryId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  entryDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 8,
    flex: 1,
  },
  confidenceScore: {
    fontSize: 14,
    color: '#6B7280',
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  validationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  balanceInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  balanceText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  errorsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorItem: {
    fontSize: 13,
    color: '#DC2626',
    marginBottom: 4,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  detailsTable: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
  },
  amountHeaders: {
    flexDirection: 'row',
    width: 160,
    justifyContent: 'space-between',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lineNumber: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 12,
    minWidth: 20,
  },
  accountInfo: {
    flex: 1,
  },
  accountCode: {
    fontSize: 12,
    color: '#6B7280',
  },
  accountName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 2,
  },
  detailDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  detailRight: {
    width: 160,
  },
  amountColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountColumn: {
    alignItems: 'center',
    width: 70,
  },
  columnHeader: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  amount: {
    fontSize: 12,
    textAlign: 'center',
  },
  activeAmount: {
    fontWeight: '600',
    color: '#1F2937',
  },
  inactiveAmount: {
    color: '#D1D5DB',
  },
  referenceInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  referenceItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default JournalEntryDetailScreen;