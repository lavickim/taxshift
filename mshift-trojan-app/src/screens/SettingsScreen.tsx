import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout, updateUser } from '../store/slices/userSlice';

export default function SettingsScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences?.notifications ?? true
  );
  const [autoCategoryEnabled, setAutoCategoryEnabled] = useState(
    user?.preferences?.autoCategory ?? true
  );
  const [dataSharingEnabled, setDataSharingEnabled] = useState(
    user?.preferences?.dataSharing ?? false
  );

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive',
          onPress: () => dispatch(logout())
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      '데이터 내보내기',
      '엑셀 파일로 거래 내역을 내보내시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '내보내기', 
          onPress: () => {
            // TODO: Implement actual Excel export
            Alert.alert('알림', '엑셀 파일이 다운로드되었습니다.');
          }
        },
      ]
    );
  };

  const handleUpgradePremium = () => {
    Alert.alert(
      '프리미엄 업그레이드',
      '프리미엄 플랜으로 업그레이드하시겠습니까?\n\n• 무제한 영수증 저장\n• 고급 분석 기능\n• 자동 은행 연동\n• 우선 고객 지원\n\n월 9,900원',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '업그레이드', 
          onPress: () => {
            // TODO: Implement premium upgrade
            Alert.alert('알림', '업그레이드 기능은 곧 출시됩니다.');
          }
        },
      ]
    );
  };

  const updatePreferences = (key: string, value: boolean) => {
    if (user) {
      dispatch(updateUser({
        preferences: {
          ...user.preferences,
          [key]: value,
        },
      }));
    }
  };

  const settingsSections = [
    {
      title: '계정',
      items: [
        {
          icon: 'person-outline',
          title: '프로필 설정',
          subtitle: '이름, 프로필 사진 변경',
          onPress: () => {},
        },
        {
          icon: 'shield-checkmark-outline',
          title: '보안 설정',
          subtitle: '비밀번호, 생체인증',
          onPress: () => {},
        },
      ],
    },
    {
      title: '앱 설정',
      items: [
        {
          icon: 'notifications-outline',
          title: '알림',
          subtitle: '푸시 알림 설정',
          toggle: true,
          value: notificationsEnabled,
          onToggle: (value: boolean) => {
            setNotificationsEnabled(value);
            updatePreferences('notifications', value);
          },
        },
        {
          icon: 'pricetag-outline',
          title: '자동 분류',
          subtitle: '거래 자동 카테고리 분류',
          toggle: true,
          value: autoCategoryEnabled,
          onToggle: (value: boolean) => {
            setAutoCategoryEnabled(value);
            updatePreferences('autoCategory', value);
          },
        },
        {
          icon: 'analytics-outline',
          title: '데이터 공유',
          subtitle: '서비스 개선을 위한 익명 데이터 공유',
          toggle: true,
          value: dataSharingEnabled,
          onToggle: (value: boolean) => {
            setDataSharingEnabled(value);
            updatePreferences('dataSharing', value);
          },
        },
      ],
    },
    {
      title: '데이터',
      items: [
        {
          icon: 'download-outline',
          title: '데이터 내보내기',
          subtitle: '엑셀 파일로 거래 내역 다운로드',
          onPress: handleExportData,
        },
        {
          icon: 'cloud-upload-outline',
          title: '데이터 백업',
          subtitle: '클라우드에 데이터 백업',
          onPress: () => {},
        },
      ],
    },
    {
      title: '지원',
      items: [
        {
          icon: 'help-circle-outline',
          title: '도움말',
          subtitle: '사용법 및 FAQ',
          onPress: () => {},
        },
        {
          icon: 'mail-outline',
          title: '문의하기',
          subtitle: '고객 지원팀에 문의',
          onPress: () => {},
        },
        {
          icon: 'star-outline',
          title: '앱 평가',
          subtitle: '앱스토어에서 평가하기',
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color="#666" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || '사용자'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              <Text style={user?.isPremium ? styles.userStatusPremium : styles.userStatus}>
                {user?.isPremium ? '프리미엄 사용자' : '무료 사용자'}
              </Text>
            </View>
          </View>
          
          {!user?.isPremium && (
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={handleUpgradePremium}
            >
              <Ionicons name="star" size={20} color="white" />
              <Text style={styles.upgradeButtonText}>프리미엄으로 업그레이드</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.settingItem}
                onPress={item.onPress}
                disabled={item.toggle}
              >
                <Ionicons name={item.icon} size={24} color="#666" />
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                {item.toggle ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
                    thumbColor="white"
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Gamification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>달성 현황</Text>
          <View style={styles.achievementCard}>
            <View style={styles.achievementHeader}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.achievementTitle}>레벨 3 - 절약 마스터</Text>
            </View>
            <Text style={styles.achievementDescription}>
              영수증 50장 달성! 다음 레벨까지 영수증 23장 남았습니다.
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '68%' }]} />
            </View>
            <Text style={styles.progressText}>68% 완료</Text>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>MoneyShift 가계부 v1.0.0</Text>
            <Text style={styles.appInfoText}>© 2024 MoneyShift Inc.</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  userStatusPremium: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '500',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  achievementCard: {
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  appInfo: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B6B',
  },
  bottomSpacing: {
    height: 40,
  },
});