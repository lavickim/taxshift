import React from 'react';
import { render } from '@testing-library/react-native';
import StatCard from '../StatCard';

describe('StatCard', () => {
  const defaultProps = {
    title: '테스트 카드',
    value: '100',
    icon: 'stats-chart' as const,
    color: '#4F46E5',
    subtitle: ''
  };

  it('should render title and value correctly', () => {
    const { getByText } = render(<StatCard {...defaultProps} />);
    
    expect(getByText('테스트 카드')).toBeTruthy();
    expect(getByText('100')).toBeTruthy();
  });

  it('should render with subtitle when provided', () => {
    const props = {
      ...defaultProps,
      subtitle: '최근 30일'
    };

    const { getByText } = render(<StatCard {...props} />);
    
    expect(getByText('테스트 카드')).toBeTruthy();
    expect(getByText('100')).toBeTruthy();
    expect(getByText('최근 30일')).toBeTruthy();
  });

  it('should render without throwing error', () => {
    expect(() => render(<StatCard {...defaultProps} />)).not.toThrow();
  });

  it('should format numeric values correctly', () => {
    const props = {
      ...defaultProps,
      value: 1000
    };

    const { getByText } = render(<StatCard {...props} />);
    expect(getByText('1,000')).toBeTruthy();
  });

  it('should handle different icon types', () => {
    const iconTypes = ['document-text', 'cash', 'trending-up', 'checkmark-circle'];
    
    iconTypes.forEach(iconType => {
      const props = {
        ...defaultProps,
        icon: iconType as any
      };

      expect(() => render(<StatCard {...props} />)).not.toThrow();
    });
  });
});