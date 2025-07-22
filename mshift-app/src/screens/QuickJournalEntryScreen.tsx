import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AppDispatch } from '../store/store';
import {
  processTransaction,
  fetchChartOfAccounts,
  selectChartOfAccounts
} from '../store/slices/bookkeepingSlice';
import { TransactionToJournalRequest } from '../services/BookkeepingService';

interface QuickJournalEntryScreenProps {
  navigation: any;
}

const QuickJournalEntryScreen: React.FC<QuickJournalEntryScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const chartOfAccounts = useSelector(selectChartOfAccounts);
  
  const [transactionText, setTransactionText] = useState('');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (chartOfAccounts.length === 0) {
      dispatch(fetchChartOfAccounts());
    }
  }, []);

  useEffect(() => {
    if (transactionText.length > 10) {
      generateAISuggestions();
    } else {
      setAiSuggestions([]);
    }
  }, [transactionText]);

  const generateAISuggestions = () => {
    // AI 기반 추천 로직 시뮬레이션
    const suggestions = [
      {
        id: 1,
        description: '접대비 (고객 식사)',
        debitAccount: '접대비',
        creditAccount: '보통예금',
        confidence: 95,
        reasoning: '음식점 키워드 매칭'
      },
      {
        id: 2,
        description: '회의비 (카페 미팅)',
        debitAccount: '회의비',
        creditAccount: '보통예금',
        confidence: 78,
        reasoning: '카페 관련 키워드'
      }
    ];
    
    // 거래 텍스트에 따른 필터링
    if (transactionText.includes('카페') || transactionText.includes('커피')) {
      setAiSuggestions(suggestions);
    } else if (transactionText.includes('주유') || transactionText.includes('기름')) {
      setAiSuggestions([{
        id: 3,
        description: '차량유지비 (연료비)',
        debitAccount: '차량유지비',
        creditAccount: '보통예금',
        confidence: 98,
        reasoning: '주유소 키워드 매칭'
      }]);
    } else {
      setAiSuggestions(suggestions);
    }
  };

  const handleQuickProcess = async (suggestion?: any) => {
    if (!transactionText.trim() || !amount.trim()) {
      Alert.alert('입력 오류', '거래 내용과 금액을 모두 입력해주세요.');
      return;
    }

    try {
      setProcessing(true);

      const request: TransactionToJournalRequest = {
        transactionId: Date.now(), // 임시 ID
        companyId: 'default-company',
        forceRegenerate: true
      };

      const result = await dispatch(processTransaction(request)).unwrap();

      if (result.success && result.journalEntry) {
        Alert.alert(
          '분개 생성 완료',
          `자동 분개가 생성되었습니다.\n신뢰도: ${result.journalEntry.confidence}%`,
          [
            { text: '확인', onPress: () => {
              navigation.navigate('JournalEntryDetail', { 
                entryId: result.journalEntry!.id 
              });
            }}
          ]
        );
      } else {
        throw new Error(result.message || '분개 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('빠른 분개 생성 실패:', error);
      Alert.alert('오류', '분개 생성 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const formatAmount = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const formatted = numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formatted;
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatAmount(text);
    setAmount(formatted);
  };

  const renderAISuggestion = (suggestion: any) => (
    <TouchableOpacity
      key={suggestion.id}
      style={styles.suggestionCard}
      onPress={() => handleQuickProcess(suggestion)}
      disabled={processing}
    >
      <View style={styles.suggestionHeader}>
        <View style={styles.suggestionMain}>
          <Text style={styles.suggestionTitle}>{suggestion.description}</Text>
          <Text style={styles.suggestionAccounts}>
            차변: {suggestion.debitAccount} → 대변: {suggestion.creditAccount}
          </Text>
        </View>
        <View style={styles.suggestionRight}>
          <View style={[
            styles.confidenceBadge,
            { backgroundColor: suggestion.confidence >= 90 ? '#10B98115' : '#F59E0B15' }
          ]}>
            <Text style={[
              styles.confidenceText,
              { color: suggestion.confidence >= 90 ? '#10B981' : '#F59E0B' }
            ]}>
              {suggestion.confidence}%
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#6B7280" />
        </View>
      </View>
      
      <Text style={styles.suggestionReasoning}>
        <Ionicons name="flash" size={12} color="#8B5CF6" /> {suggestion.reasoning}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>빠른 분개 생성</Text>
        <Text style={styles.headerSubtitle}>AI가 자동으로 분개를 추천합니다</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Transaction Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>거래 내용</Text>
          <TextInput
            style={styles.textInput}
            placeholder="예: 스타벅스에서 고객과 미팅, 주유소에서 기름 주유..."
            placeholderTextColor="#9CA3AF"
            value={transactionText}
            onChangeText={setTransactionText}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>거래 금액</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₩</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.suggestionsHeader}>
              <Ionicons name="flash" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>AI 분개 추천</Text>
            </View>
            <Text style={styles.suggestionsSubtitle}>
              거래 내용을 분석한 결과입니다
            </Text>
            
            {aiSuggestions.map(renderAISuggestion)}
          </View>
        )}

        {/* Manual Process Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.manualButton, processing && styles.disabledButton]}
            onPress={() => handleQuickProcess()}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="flash" size={20} color="white" />
            )}
            <Text style={styles.manualButtonText}>
              {processing ? '처리 중...' : 'AI로 자동 처리'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.tipsTitle}>💡 빠른 분개 팁</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• 구체적인 거래처명을 입력하면 정확도가 높아집니다</Text>
            <Text style={styles.tipItem}>• "카페", "주유소", "편의점" 등 업종 키워드 포함</Text>
            <Text style={styles.tipItem}>• 거래 목적을 명시하면 계정과목 분류에 도움됩니다</Text>
            <Text style={styles.tipItem}>• 정기적인 거래는 패턴 학습으로 더욱 정확해집니다</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 10,
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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FAFBFC',
    minHeight: 80,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FAFBFC',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    paddingLeft: 16,
  },
  amountInput: {
    flex: 1,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  suggestionsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  suggestionCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FAFBFC',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  suggestionMain: {
    flex: 1,
    marginRight: 12,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  suggestionAccounts: {
    fontSize: 12,
    color: '#6B7280',
  },
  suggestionRight: {
    alignItems: 'flex-end',
  },
  confidenceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  suggestionReasoning: {
    fontSize: 11,
    color: '#8B5CF6',
    fontStyle: 'italic',
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  manualButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsList: {
    paddingLeft: 4,
  },
  tipItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default QuickJournalEntryScreen;