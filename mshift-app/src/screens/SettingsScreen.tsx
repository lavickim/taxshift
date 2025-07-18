import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { apiCall, API_CONFIG } from '../config/api';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [totalRules, setTotalRules] = useState<number>(0);

  useEffect(() => {
    checkApiStatus();
    getRulesCount();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.HEALTH);
      if (response.ok) {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const getRulesCount = async () => {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.RULES);
      if (response.ok) {
        const rules = await response.json();
        setTotalRules(rules.length);
      }
    } catch (error) {
      console.log('Failed to fetch rules count');
    }
  };

  const refreshRulesCache = async () => {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.REFRESH_CACHE, {
        method: 'POST'
      });
      if (response.ok) {
        Alert.alert('성공', '규칙 캐시가 새로고침되었습니다.');
      } else {
        Alert.alert('실패', '캐시 새로고침에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('네트워크 오류', 'API 서버에 연결할 수 없습니다.');
    }
  };

  const navigateToDataConnection = () => {
    navigation.navigate('DataConnection' as never);
  };

  const settingsOptions = [
    { title: 'API 서버 상태', icon: '🔌', onPress: null, value: apiStatus === 'checking' ? '확인중...' : apiStatus === 'online' ? '온라인' : '오프라인' },
    { title: '규칙 개수', icon: '📏', onPress: null, value: `${totalRules}개` },
    { title: '캐시 새로고침', icon: '🔄', onPress: refreshRulesCache },
    { title: '계정 정보', icon: '👤', onPress: null },
    { title: '알림 설정', icon: '🔔', onPress: null },
    { title: '보안 설정', icon: '🔒', onPress: null },
    { title: '데이터 관리', icon: '📊', onPress: navigateToDataConnection },
    { title: '고객 지원', icon: '💬', onPress: null },
    { title: '앱 정보', icon: 'ℹ️', onPress: null },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            <Text style={styles.profileIcon}>👤</Text>
          </View>
          <Text style={styles.profileName}>사용자님</Text>
          <Text style={styles.profileEmail}>user@example.com</Text>
        </View>

        <View style={styles.optionsContainer}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.optionItem}
              onPress={option.onPress || (() => {})}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={styles.optionTitle}>{option.title}</Text>
              </View>
              <View style={styles.optionRight}>
                {option.value && (
                  <Text style={[
                    styles.optionValue,
                    option.title === 'API 서버 상태' && apiStatus === 'online' ? styles.statusOnline :
                    option.title === 'API 서버 상태' && apiStatus === 'offline' ? styles.statusOffline : {}
                  ]}>
                    {option.value}
                  </Text>
                )}
                {!option.value && (
                  <Text style={styles.optionArrow}>{'>'}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileIcon: {
    fontSize: 32,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  optionsContainer: {
    backgroundColor: Colors.white,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  optionArrow: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  logoutButton: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: Colors.indicator.negative,
    fontWeight: 'bold',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionValue: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  statusOnline: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusOffline: {
    color: '#F44336',
    fontWeight: 'bold',
  },
});

export default SettingsScreen; 