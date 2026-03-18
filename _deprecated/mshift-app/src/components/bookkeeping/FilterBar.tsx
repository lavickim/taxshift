import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BookkeepingState } from '../../store/slices/bookkeepingSlice';

interface FilterBarProps {
  filters: BookkeepingState['filters'];
  onFiltersChange: (filters: Partial<BookkeepingState['filters']>) => void;
  statusCounts: {
    ALL: number;
    DRAFT: number;
    CONFIRMED: number;
    POSTED: number;
  };
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  statusCounts
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');

  const statusOptions = [
    { key: 'ALL', label: '전체', count: statusCounts.ALL, color: '#6B7280' },
    { key: 'DRAFT', label: '검토 필요', count: statusCounts.DRAFT, color: '#F59E0B' },
    { key: 'CONFIRMED', label: '승인됨', count: statusCounts.CONFIRMED, color: '#3B82F6' },
    { key: 'POSTED', label: '완료됨', count: statusCounts.POSTED, color: '#10B981' }
  ] as const;

  const handleStatusChange = (status: BookkeepingState['filters']['status']) => {
    onFiltersChange({ status });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      
      if (datePickerMode === 'start') {
        onFiltersChange({ startDate: dateString });
      } else {
        onFiltersChange({ endDate: dateString });
      }
    }
  };

  const openDatePicker = (mode: 'start' | 'end') => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getQuickDateRange = (range: 'today' | 'week' | 'month') => {
    const now = new Date();
    let startDate: string;
    let endDate: string = now.toISOString().split('T')[0];

    switch (range) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = monthStart.toISOString().split('T')[0];
        break;
      default:
        startDate = endDate;
    }

    onFiltersChange({ startDate, endDate });
  };

  const renderStatusFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>상태별 필터</Text>
      <View style={styles.statusButtons}>
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.statusButton,
              filters.status === option.key && styles.statusButtonActive,
              { borderColor: option.color }
            ]}
            onPress={() => handleStatusChange(option.key)}
          >
            <Text style={[
              styles.statusButtonText,
              filters.status === option.key && styles.statusButtonTextActive,
              { color: filters.status === option.key ? 'white' : option.color }
            ]}>
              {option.label}
            </Text>
            {option.count > 0 && (
              <View style={[
                styles.statusCount,
                { backgroundColor: filters.status === option.key ? 'rgba(255,255,255,0.3)' : `${option.color}15` }
              ]}>
                <Text style={[
                  styles.statusCountText,
                  { color: filters.status === option.key ? 'white' : option.color }
                ]}>
                  {option.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDateFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>기간 필터</Text>
      
      {/* Quick Date Buttons */}
      <View style={styles.quickDateButtons}>
        <TouchableOpacity
          style={styles.quickDateButton}
          onPress={() => getQuickDateRange('today')}
        >
          <Text style={styles.quickDateText}>오늘</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickDateButton}
          onPress={() => getQuickDateRange('week')}
        >
          <Text style={styles.quickDateText}>이번 주</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickDateButton}
          onPress={() => getQuickDateRange('month')}
        >
          <Text style={styles.quickDateText}>이번 달</Text>
        </TouchableOpacity>
      </View>

      {/* Date Range Selector */}
      <View style={styles.dateRangeContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => openDatePicker('start')}
        >
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.dateButtonText}>
            {formatDate(filters.startDate)}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.dateSeparator}>
          <Text style={styles.dateSeparatorText}>~</Text>
        </View>
        
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => openDatePicker('end')}
        >
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.dateButtonText}>
            {formatDate(filters.endDate)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderStatusFilter()}
      {renderDateFilter()}
      
      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(datePickerMode === 'start' ? filters.startDate : filters.endDate)}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  statusButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: 'white',
  },
  statusCount: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  statusCountText: {
    fontSize: 10,
    fontWeight: '600',
  },
  quickDateButtons: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  quickDateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  quickDateText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  dateSeparator: {
    marginHorizontal: 12,
  },
  dateSeparatorText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

export default FilterBar;