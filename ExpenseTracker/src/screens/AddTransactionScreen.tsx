import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Category, Asset } from '../types';
import { RootState } from '../store';
import { createTransaction } from '../store/slices/transactionSlice';
import apiService from '../services/api';

type AddTransactionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddTransaction'>;

interface Props {
  navigation: AddTransactionScreenNavigationProp;
  route: {
    params?: {
      type?: 'INCOME' | 'EXPENSE';
    };
  };
}

export default function AddTransactionScreen({ navigation, route }: Props) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.transaction);

  const [formData, setFormData] = useState({
    transactionType: route.params?.type || 'EXPENSE',
    amount: '',
    description: '',
    memo: '',
    transactionDate: new Date().toISOString().split('T')[0],
    transactionTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
    assetId: 1,
    categoryId: 1,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);

  useEffect(() => {
    loadCategories();
    loadAssets();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      const filteredCategories = categoriesData.filter(
        cat => cat.categoryType === formData.transactionType
      );
      setCategories(filteredCategories);
      
      if (filteredCategories.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: filteredCategories[0].categoryId }));
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadAssets = async () => {
    try {
      const assetsData = await apiService.getAssets();
      setAssets(assetsData);
      
      if (assetsData.length > 0) {
        setFormData(prev => ({ ...prev, assetId: assetsData[0].assetId }));
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTransactionTypeChange = (type: 'INCOME' | 'EXPENSE') => {
    setFormData(prev => ({ ...prev, transactionType: type }));
    // 카테고리 다시 로드
    const filteredCategories = categories.filter(cat => cat.categoryType === type);
    if (filteredCategories.length > 0) {
      setFormData(prev => ({ ...prev, categoryId: filteredCategories[0].categoryId }));
    }
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('입력 오류', '금액을 올바르게 입력해주세요.');
      return false;
    }

    if (!formData.description.trim()) {
      Alert.alert('입력 오류', '거래 내용을 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    try {
      await dispatch(createTransaction(transactionData) as any);
      Alert.alert('성공', '거래가 성공적으로 추가되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('오류', '거래 추가 중 오류가 발생했습니다.');
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount.replace(/[^0-9]/g, ''));
    return isNaN(num) ? '0' : num.toLocaleString();
  };

  const selectedCategory = categories.find(cat => cat.categoryId === formData.categoryId);
  const selectedAsset = assets.find(asset => asset.assetId === formData.assetId);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.title}>거래 추가</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#007bff" />
          ) : (
            <Text style={styles.saveButton}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Transaction Type Toggle */}
        <View style={styles.section}>
          <Text style={styles.label}>거래 유형</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                formData.transactionType === 'INCOME' && styles.toggleButtonActive,
              ]}
              onPress={() => handleTransactionTypeChange('INCOME')}
            >
              <Text
                style={[
                  styles.toggleText,
                  formData.transactionType === 'INCOME' && styles.toggleTextActive,
                ]}
              >
                수입
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                formData.transactionType === 'EXPENSE' && styles.toggleButtonActive,
              ]}
              onPress={() => handleTransactionTypeChange('EXPENSE')}
            >
              <Text
                style={[
                  styles.toggleText,
                  formData.transactionType === 'EXPENSE' && styles.toggleTextActive,
                ]}
              >
                지출
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.label}>금액</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₩</Text>
            <TextInput
              style={styles.amountInput}
              value={formatCurrency(formData.amount)}
              onChangeText={(value) => handleInputChange('amount', value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              keyboardType="numeric"
              editable={!loading}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>거래 내용</Text>
          <TextInput
            style={styles.input}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="예: 점심식사, 급여 등"
            editable={!loading}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>카테고리</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowCategoryModal(true)}
            disabled={loading}
          >
            <Text style={styles.selectorText}>
              {selectedCategory?.categoryName || '카테고리 선택'}
            </Text>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Asset Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>자산</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowAssetModal(true)}
            disabled={loading}
          >
            <Text style={styles.selectorText}>
              {selectedAsset?.assetName || '자산 선택'}
            </Text>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Date and Time */}
        <View style={styles.row}>
          <View style={[styles.section, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>날짜</Text>
            <TextInput
              style={styles.input}
              value={formData.transactionDate}
              onChangeText={(value) => handleInputChange('transactionDate', value)}
              placeholder="YYYY-MM-DD"
              editable={!loading}
            />
          </View>
          <View style={[styles.section, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>시간</Text>
            <TextInput
              style={styles.input}
              value={formData.transactionTime}
              onChangeText={(value) => handleInputChange('transactionTime', value)}
              placeholder="HH:MM"
              editable={!loading}
            />
          </View>
        </View>

        {/* Memo */}
        <View style={styles.section}>
          <Text style={styles.label}>메모 (선택)</Text>
          <TextInput
            style={[styles.input, styles.memoInput]}
            value={formData.memo}
            onChangeText={(value) => handleInputChange('memo', value)}
            placeholder="추가 정보를 입력하세요"
            multiline
            numberOfLines={3}
            editable={!loading}
          />
        </View>
      </View>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>카테고리 선택</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalClose}>닫기</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {categories
                .filter(cat => cat.categoryType === formData.transactionType)
                .map(category => (
                <TouchableOpacity
                  key={category.categoryId}
                  style={[
                    styles.modalItem,
                    category.categoryId === formData.categoryId && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleInputChange('categoryId', category.categoryId);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{category.categoryName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Asset Selection Modal */}
      <Modal
        visible={showAssetModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAssetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>자산 선택</Text>
              <TouchableOpacity onPress={() => setShowAssetModal(false)}>
                <Text style={styles.modalClose}>닫기</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {assets.map(asset => (
                <TouchableOpacity
                  key={asset.assetId}
                  style={[
                    styles.modalItem,
                    asset.assetId === formData.assetId && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleInputChange('assetId', asset.assetId);
                    setShowAssetModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>
                    {asset.assetName} ({asset.assetType})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  memoInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#007bff',
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    paddingHorizontal: 15,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 16,
    color: '#007bff',
  },
  modalItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  modalItemSelected: {
    backgroundColor: '#e7f3ff',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});