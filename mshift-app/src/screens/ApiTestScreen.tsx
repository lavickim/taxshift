import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { apiCall } from '../config/api';

const ApiTestScreen = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState('http://192.168.45.219:8080/mshift-api');
  const [testText, setTestText] = useState('GS25 편의점 결제');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/rule-engine/health`);
      if (response.ok) {
        const text = await response.text();
        setResult(`✅ API 연결 성공: ${text}`);
        Alert.alert('성공', 'API 서버에 연결되었습니다.');
      } else {
        setResult(`❌ API 연결 실패: ${response.status}`);
        Alert.alert('실패', `API 서버 연결 실패: ${response.status}`);
      }
    } catch (error) {
      setResult(`❌ 네트워크 오류: ${error}`);
      Alert.alert('네트워크 오류', 'API 서버에 연결할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const testClassification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/rule-engine/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputText: testText,
          returnAllMatches: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        const category = data.matchedRules?.[0]?.category || '미분류';
        setResult(`✅ 분류 결과: ${category}`);
        Alert.alert('분류 성공', `결과: ${category}`);
      } else {
        setResult(`❌ 분류 실패: ${response.status}`);
        Alert.alert('분류 실패', `API 호출 실패: ${response.status}`);
      }
    } catch (error) {
      setResult(`❌ 네트워크 오류: ${error}`);
      Alert.alert('네트워크 오러', 'API 서버에 연결할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickSetLocalIP = () => {
    setApiBaseUrl('http://192.168.45.219:8080/mshift-api');
  };

  const quickSetLocalhost = () => {
    setApiBaseUrl('http://localhost:8080/mshift-api');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>API 테스트</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API 서버 주소</Text>
          <TextInput
            style={styles.input}
            value={apiBaseUrl}
            onChangeText={setApiBaseUrl}
            placeholder="API 서버 주소 입력"
            autoCapitalize="none"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.quickButton} onPress={quickSetLocalIP}>
              <Text style={styles.quickButtonText}>로컬 IP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickButton} onPress={quickSetLocalhost}>
              <Text style={styles.quickButtonText}>localhost</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>테스트 텍스트</Text>
          <TextInput
            style={styles.input}
            value={testText}
            onChangeText={setTestText}
            placeholder="분류할 텍스트 입력"
          />
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.testButton, isLoading && styles.disabledButton]} 
            onPress={testApiConnection}
            disabled={isLoading}
          >
            <Text style={styles.testButtonText}>
              {isLoading ? '테스트 중...' : 'API 연결 테스트'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, styles.classifyButton, isLoading && styles.disabledButton]} 
            onPress={testClassification}
            disabled={isLoading}
          >
            <Text style={styles.testButtonText}>
              {isLoading ? '분류 중...' : '거래 분류 테스트'}
            </Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>테스트 결과</Text>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        )}
      </ScrollView>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.card.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.background,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  classifyButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: Colors.text.secondary,
  },
  testButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultSection: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});

export default ApiTestScreen;