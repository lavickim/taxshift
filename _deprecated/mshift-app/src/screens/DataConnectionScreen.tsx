import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';

const DataConnectionScreen = () => {
  const navigation = useNavigation();

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>데이터연동 관리</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>추가</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 홈택스 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>홈택스</Text>
          <TouchableOpacity style={styles.connectionItem}>
            <View style={styles.connectionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#4285f4' }]}>
                <Text style={styles.iconText}>홈</Text>
              </View>
              <View style={styles.connectionInfo}>
                <Text style={styles.connectionName}>홈택스</Text>
                <Text style={styles.connectionSubtitle}>아이디로 연동</Text>
              </View>
            </View>
            <View style={styles.connectionRight}>
              <Text style={styles.lastUpdate}>최근 업데이트</Text>
              <Text style={styles.updateTime}>5월 29일 13:54</Text>
              <Text style={styles.arrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 카드 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>카드(신용/체크)</Text>
          <TouchableOpacity style={styles.connectionItem}>
            <View style={styles.connectionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#dc3545' }]}>
                <Text style={styles.iconText}>BC</Text>
              </View>
              <View style={styles.connectionInfo}>
                <Text style={styles.connectionName}>비씨카드</Text>
                <Text style={styles.connectionSubtitle}>홈택스 (메일 15일정 등기화)</Text>
              </View>
            </View>
            <View style={styles.connectionRight}>
              <Text style={styles.cardNumber}>529803*****7928</Text>
              <Text style={styles.lastUpdate}>최근 업데이트</Text>
              <Text style={styles.updateTime}>7월 19일 17:09</Text>
              <Text style={styles.arrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>

          {/* 실시간 동기화 버튼 */}
          <TouchableOpacity style={styles.syncButton}>
            <Text style={styles.syncIcon}>🔄</Text>
            <Text style={styles.syncText}>실시간 동기화</Text>
          </TouchableOpacity>
        </View>

        {/* 은행계좌 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>은행계좌</Text>
          <TouchableOpacity style={styles.connectionItem}>
            <View style={styles.connectionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#0066cc' }]}>
                <Text style={styles.iconText}>IBK</Text>
              </View>
              <View style={styles.connectionInfo}>
                <Text style={styles.connectionName}>기업은행</Text>
                <Text style={styles.connectionSubtitle}>공동인증서로 연동</Text>
              </View>
            </View>
            <View style={styles.connectionRight}>
              <View style={styles.warningContainer}>
                <Text style={styles.warningIcon}>⚠️</Text>
              </View>
              <Text style={styles.accountNumber}>131*****4011</Text>
              <Text style={styles.balance}>잔액</Text>
              <Text style={styles.balanceAmount}>130,293원</Text>
              <Text style={styles.lastUpdate}>최근 업데이트</Text>
              <Text style={styles.updateTime}>5월 18일 10:43</Text>
              <Text style={styles.errorText}>활성화되지 않음</Text>
              <Text style={styles.arrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 18,
    color: Colors.text.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  addButton: {
    padding: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  connectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  connectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  connectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  connectionRight: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  warningContainer: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  warningIcon: {
    fontSize: 16,
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  balance: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  lastUpdate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  updateTime: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: Colors.indicator.negative,
    marginBottom: 4,
  },
  arrow: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.card.border,
    backgroundColor: Colors.white,
  },
  syncIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  syncText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
});

export default DataConnectionScreen; 