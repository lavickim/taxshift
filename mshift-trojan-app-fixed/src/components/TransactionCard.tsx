import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

export interface TransactionItem {
  id: number;
  merchant: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  transactionDate: string;
  status: 'approved' | 'pending' | 'rejected';
  confidence: number;
  description?: string;
}

interface TransactionCardProps {
  transaction: TransactionItem;
  onPress?: (transaction: TransactionItem) => void;
  showConfidence?: boolean;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction, 
  onPress, 
  showConfidence = true 
}) => {
  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const sign = type === 'income' ? '+' : '-';
    return `${sign}${amount.toLocaleString()}원`;
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
      case 'approved': return '승인';
      case 'pending': return '검토중';
      case 'rejected': return '거절';
      default: return '미확인';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return Colors.status.success;
    if (confidence >= 0.6) return Colors.status.warning;
    return Colors.status.error;
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress?.(transaction)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.merchant}>{transaction.merchant}</Text>
        <Text style={[
          styles.amount,
          { color: transaction.type === 'income' ? Colors.status.success : Colors.status.error }
        ]}>
          {formatAmount(transaction.amount, transaction.type)}
        </Text>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>분류</Text>
          <Text style={styles.category}>{transaction.category}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
            <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
          </View>
          
          {showConfidence && (
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>신뢰도</Text>
              <Text style={[
                styles.confidenceValue,
                { color: getConfidenceColor(transaction.confidence) }
              ]}>
                {(transaction.confidence * 100).toFixed(0)}%
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.date}>
          {new Date(transaction.transactionDate).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        
        {transaction.description && (
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  merchant: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    flex: 1,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  description: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
    marginLeft: 8,
    textAlign: 'right',
  },
});

export default TransactionCard;