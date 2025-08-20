import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BalanceSheet } from '../../services/FinancialStatementService';

interface BalanceSheetComponentProps {
  data: BalanceSheet;
  asOfDate: string;
}

const BalanceSheetComponent: React.FC<BalanceSheetComponentProps> = ({ data, asOfDate }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

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

  const getTotalAssets = () => {
    return data.assets.reduce((sum, asset) => sum + asset.amount, 0);
  };

  const getTotalLiabilities = () => {
    return data.liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  };

  const getTotalEquity = () => {
    return data.equity.reduce((sum, equity) => sum + equity.amount, 0);
  };

  const isBalanced = () => {
    const assets = getTotalAssets();
    const liabilitiesAndEquity = getTotalLiabilities() + getTotalEquity();
    return Math.abs(assets - liabilitiesAndEquity) < 1;
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
            
            {/* Section Total */}
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
    const totalAssets = getTotalAssets();
    const totalLiabilities = getTotalLiabilities();
    const totalEquity = getTotalEquity();
    const balanced = isBalanced();

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>대차대조표 요약</Text>
          <View style={[
            styles.balanceIndicator,
            { backgroundColor: balanced ? '#10B98115' : '#EF444415' }
          ]}>
            <Ionicons
              name={balanced ? 'checkmark-circle' : 'warning'}
              size={16}
              color={balanced ? '#10B981' : '#EF4444'}
            />
            <Text style={[
              styles.balanceText,
              { color: balanced ? '#10B981' : '#EF4444' }
            ]}>
              {balanced ? '대차균형' : '대차불균형'}
            </Text>
          </View>
        </View>

        <View style={styles.summaryItems}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryItemHeader}>
              <View style={[styles.summaryDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.summaryItemTitle}>총 자산</Text>
            </View>
            <Text style={styles.summaryItemAmount}>₩{formatAmount(totalAssets)}</Text>
          </View>

          <View style={styles.summaryItem}>
            <View style={styles.summaryItemHeader}>
              <View style={[styles.summaryDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.summaryItemTitle}>총 부채</Text>
            </View>
            <Text style={styles.summaryItemAmount}>₩{formatAmount(totalLiabilities)}</Text>
          </View>

          <View style={styles.summaryItem}>
            <View style={styles.summaryItemHeader}>
              <View style={[styles.summaryDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.summaryItemTitle}>총 자본</Text>
            </View>
            <Text style={styles.summaryItemAmount}>₩{formatAmount(totalEquity)}</Text>
          </View>
        </View>

        {/* Financial Ratios */}
        <View style={styles.ratiosContainer}>
          <Text style={styles.ratiosTitle}>주요 비율</Text>
          <View style={styles.ratiosGrid}>
            <View style={styles.ratioItem}>
              <Text style={styles.ratioLabel}>부채비율</Text>
              <Text style={styles.ratioValue}>
                {((totalLiabilities / totalAssets) * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.ratioItem}>
              <Text style={styles.ratioLabel}>자기자본비율</Text>
              <Text style={styles.ratioValue}>
                {((totalEquity / totalAssets) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Summary Card */}
      {renderSummaryCard()}

      {/* Assets Section */}
      {renderSection('자산', data.assets, 'assets', '#3B82F6')}

      {/* Liabilities Section */}
      {renderSection('부채', data.liabilities, 'liabilities', '#EF4444')}

      {/* Equity Section */}
      {renderSection('자본', data.equity, 'equity', '#10B981')}

      {/* Equation Display */}
      <View style={styles.equationContainer}>
        <Text style={styles.equationTitle}>대차대조표 등식</Text>
        <View style={styles.equation}>
          <View style={styles.equationItem}>
            <Text style={styles.equationLabel}>자산</Text>
            <Text style={styles.equationAmount}>₩{formatAmount(getTotalAssets())}</Text>
          </View>
          
          <Ionicons name="arrow-forward" size={20} color="#6B7280" />
          
          <View style={styles.equationItem}>
            <Text style={styles.equationLabel}>부채 + 자본</Text>
            <Text style={styles.equationAmount}>
              ₩{formatAmount(getTotalLiabilities() + getTotalEquity())}
            </Text>
          </View>
        </View>
        
        {!isBalanced() && (
          <View style={styles.imbalanceWarning}>
            <Ionicons name="warning" size={16} color="#EF4444" />
            <Text style={styles.imbalanceText}>
              차액: ₩{formatAmount(Math.abs(getTotalAssets() - (getTotalLiabilities() + getTotalEquity())))}
            </Text>
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  balanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  balanceText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  summaryItems: {
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  summaryItemTitle: {
    fontSize: 14,
    color: '#374151',
  },
  summaryItemAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  ratiosContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  ratiosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  ratiosGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  ratioItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  ratioLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  ratioValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
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
  equationContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  equationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  equation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  equationItem: {
    alignItems: 'center',
  },
  equationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  equationAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  imbalanceWarning: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  imbalanceText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 6,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default BalanceSheetComponent;