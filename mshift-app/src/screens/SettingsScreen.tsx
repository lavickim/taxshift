import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Switch,
  Dimensions,
  Modal,
  TextInput,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { apiCall, API_CONFIG } from '../config/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateSettings, setProfile } from '../store/slices/userSlice';

const { width } = Dimensions.get('window');

const SettingsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { profile, settings } = useAppSelector(state => state.user);
  
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [totalRules, setTotalRules] = useState<number>(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile || {});

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

  const toggleNotifications = (value: boolean) => {
    dispatch(updateSettings({ notifications: value }));
  };

  const toggleDarkMode = (value: boolean) => {
    dispatch(updateSettings({ darkMode: value }));
  };

  const handleProfileSave = () => {
    dispatch(setProfile(tempProfile));
    setShowProfileModal(false);
    Alert.alert('프로필 저장', '프로필이 성공적으로 저장되었습니다.');
  };

  const navigateToDataConnection = () => {
    navigation.navigate('DataConnection' as never);
  };

  const renderProfileModal = () => (
    <Modal
      visible={showProfileModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowProfileModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
              <Text style={styles.modalCloseButton}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>프로필 편집</Text>
            <TouchableOpacity onPress={handleProfileSave}>
              <Text style={styles.modalSaveButton}>저장</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.profileEditSection}>
              <View style={styles.profileImageContainer}>
                <View style={styles.profileImageLarge}>
                  <Text style={styles.profileIconLarge}>👤</Text>
                </View>
                <TouchableOpacity style={styles.editImageButton}>
                  <Text style={styles.editImageButtonText}>사진 변경</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>사업자명</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempProfile.businessName || ''}
                  onChangeText={(text) => setTempProfile({...tempProfile, businessName: text})}
                  placeholder="사업자명을 입력하세요"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>사업자 유형</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempProfile.businessType || ''}
                  onChangeText={(text) => setTempProfile({...tempProfile, businessType: text})}
                  placeholder="개인사업자, 법인 등"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>연락처</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempProfile.phoneNumber || ''}
                  onChangeText={(text) => setTempProfile({...tempProfile, phoneNumber: text})}
                  placeholder="연락처를 입력하세요"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>주소</Text>
                <TextInput
                  style={[styles.textInput, styles.textInputMultiline]}
                  value={tempProfile.address || ''}
                  onChangeText={(text) => setTempProfile({...tempProfile, address: text})}
                  placeholder="주소를 입력하세요"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSettingsSection = (title: string, children: React.ReactNode) => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderSettingsItem = (
    icon: string, 
    title: string, 
    subtitle?: string, 
    onPress?: () => void, 
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity 
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.settingsIcon}>
          <Text style={styles.settingsIconText}>{icon}</Text>
        </View>
        <View style={styles.settingsContent}>
          <Text style={styles.settingsTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightComponent || <Text style={styles.settingsArrow}>›</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderStatusBadge = (status: string) => {
    const isOnline = status === 'online';
    return (
      <View style={[styles.statusBadge, isOnline ? styles.statusOnline : styles.statusOffline]}>
        <View style={[styles.statusDot, isOnline ? styles.statusDotOnline : styles.statusDotOffline]} />
        <Text style={[styles.statusText, isOnline ? styles.statusTextOnline : styles.statusTextOffline]}>
          {status === 'checking' ? '확인중' : isOnline ? '연결됨' : '오프라인'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileHeaderBackground}>
            <View style={styles.profileHeaderContent}>
              <TouchableOpacity 
                style={styles.profileImageContainer}
                onPress={() => setShowProfileModal(true)}
              >
                <View style={styles.profileImage}>
                  <Text style={styles.profileIcon}>👤</Text>
                </View>
                <View style={styles.editBadge}>
                  <Text style={styles.editBadgeText}>✎</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {profile?.businessName || '사업자명'}
                </Text>
                <Text style={styles.profileType}>
                  {profile?.businessType || '개인사업자'}
                </Text>
                <Text style={styles.profileEmail}>
                  {profile?.phoneNumber || '연락처를 등록하세요'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* System Status */}
        {renderSettingsSection('시스템 상태', (
          <View>
            {renderSettingsItem(
              '🔌', 
              'API 서버', 
              '백엔드 서버 연결 상태',
              undefined,
              renderStatusBadge(apiStatus)
            )}
            {renderSettingsItem(
              '📋', 
              '분류 규칙', 
              `${totalRules}개의 규칙이 활성화됨`,
              refreshRulesCache,
              <Text style={styles.rulesCount}>{totalRules}</Text>
            )}
          </View>
        ))}

        {/* App Settings */}
        {renderSettingsSection('앱 설정', (
          <View>
            {renderSettingsItem(
              '🔔', 
              '알림', 
              '푸시 알림 및 소리 설정',
              undefined,
              <Switch 
                value={settings.notifications}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#E0E0E0', true: Colors.primary }}
                thumbColor={settings.notifications ? Colors.white : '#F4F4F4'}
              />
            )}
            {renderSettingsItem(
              '🌙', 
              '다크 모드', 
              '어두운 테마 사용',
              undefined,
              <Switch 
                value={settings.darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#E0E0E0', true: Colors.primary }}
                thumbColor={settings.darkMode ? Colors.white : '#F4F4F4'}
              />
            )}
            {renderSettingsItem(
              '🌐', 
              '언어', 
              '현재: 한국어',
              () => Alert.alert('준비 중', '언어 설정 기능을 준비 중입니다.')
            )}
          </View>
        ))}

        {/* Data Management */}
        {renderSettingsSection('데이터 관리', (
          <View>
            {renderSettingsItem(
              '📊', 
              '데이터 연결', 
              '은행 및 카드 연동 관리',
              navigateToDataConnection
            )}
            {renderSettingsItem(
              '💾', 
              '백업', 
              '데이터 백업 및 복원',
              () => Alert.alert('준비 중', '백업 기능을 준비 중입니다.')
            )}
            {renderSettingsItem(
              '🔄', 
              '캐시 관리', 
              '앱 캐시 및 임시 파일 정리',
              () => Alert.alert('캐시 정리', '캐시를 정리하시겠습니까?', [
                { text: '취소', style: 'cancel' },
                { text: '정리', onPress: refreshRulesCache }
              ])
            )}
          </View>
        ))}

        {/* Security */}
        {renderSettingsSection('보안', (
          <View>
            {renderSettingsItem(
              '🔒', 
              '생체 인증', 
              '지문 또는 Face ID 사용',
              () => Alert.alert('준비 중', '생체 인증 기능을 준비 중입니다.')
            )}
            {renderSettingsItem(
              '🔐', 
              '비밀번호 변경', 
              '로그인 비밀번호 수정',
              () => Alert.alert('준비 중', '비밀번호 변경 기능을 준비 중입니다.')
            )}
            {renderSettingsItem(
              '🛡️', 
              '개인정보 보호', 
              '데이터 수집 및 이용 약관',
              () => Alert.alert('준비 중', '개인정보 보호 설정을 준비 중입니다.')
            )}
          </View>
        ))}

        {/* Support */}
        {renderSettingsSection('지원', (
          <View>
            {renderSettingsItem(
              '💬', 
              '고객 지원', 
              '문의 및 피드백',
              () => Alert.alert('고객 지원', '문의사항이 있으시면 support@moneyshift.com으로 연락해주세요.')
            )}
            {renderSettingsItem(
              'ℹ️', 
              '앱 정보', 
              '버전 1.0.0',
              () => Alert.alert('앱 정보', '머니쉬프트 v1.0.0\n\n스마트한 재무 관리 솔루션')
            )}
            {renderSettingsItem(
              '⭐', 
              '앱 평가', 
              '앱스토어에서 평가하기',
              () => Alert.alert('감사합니다', '앱스토어에서 평가를 남겨주세요!')
            )}
          </View>
        ))}

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
              { text: '취소', style: 'cancel' },
              { text: '로그아웃', style: 'destructive', onPress: () => Alert.alert('로그아웃', '로그아웃되었습니다.') }
            ])}
          >
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderProfileModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    backgroundColor: Colors.white,
    marginBottom: 20,
  },
  profileHeaderBackground: {
    backgroundColor: Colors.primary,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeaderContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileIcon: {
    fontSize: 40,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  editBadgeText: {
    color: Colors.white,
    fontSize: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  profileType: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
  },
  settingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsIconText: {
    fontSize: 20,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  settingsItemRight: {
    marginLeft: 16,
  },
  settingsArrow: {
    fontSize: 20,
    color: Colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusOnline: {
    backgroundColor: '#E8F5E8',
  },
  statusOffline: {
    backgroundColor: '#FFEBEE',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotOnline: {
    backgroundColor: '#4CAF50',
  },
  statusDotOffline: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextOnline: {
    color: '#4CAF50',
  },
  statusTextOffline: {
    color: '#F44336',
  },
  rulesCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  logoutSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  logoutButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.indicator.negative,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    color: Colors.indicator.negative,
    fontWeight: '600',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modalCloseButton: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  modalSaveButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
  },
  profileEditSection: {
    padding: 20,
  },
  profileImageLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  profileIconLarge: {
    fontSize: 48,
  },
  editImageButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    marginBottom: 32,
  },
  editImageButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.card.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.white,
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default SettingsScreen;