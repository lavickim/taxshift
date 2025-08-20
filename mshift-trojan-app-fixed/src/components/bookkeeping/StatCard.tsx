import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  subtitle: string;
  isAmount?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  isAmount = false
}) => {
  const formatValue = (val: number | string) => {
    if (isAmount && typeof val === 'string' && val.startsWith('₩')) {
      return val;
    }
    if (typeof val === 'number' && val >= 1000) {
      return val.toLocaleString();
    }
    return val.toString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color }]} numberOfLines={1} adjustsFontSizeToFit>
          {formatValue(value)}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      
      {/* Background decoration */}
      <View style={[styles.backgroundDecoration, { backgroundColor: `${color}08` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    
    // Shadow for Android
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  backgroundDecoration: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.3,
  },
});

export default StatCard;