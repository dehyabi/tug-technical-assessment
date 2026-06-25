import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MobilePackage } from '../services/api';

interface PackageCardProps {
  package: MobilePackage;
}

export default function PackageCard({ package: pkg }: PackageCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{pkg.name}</Text>
        <View style={[styles.badge, getCategoryStyle(pkg.category)]}>
          <Text style={styles.badgeText}>{pkg.category}</Text>
        </view>
      </view>
      <View style={styles.details}>
        <Text style={styles.price}>${pkg.price.toFixed(2)}</Text>
        <Text style={styles.duration}>{pkg.duration_minutes} min</Text>
      </view>
    </view>
  );
}

function getCategoryStyle(category: string) {
  switch (category) {
    case 'massage':
      return { backgroundColor: '#dbeafe' };
    case 'facial':
      return { backgroundColor: '#fce7f3' };
    case 'fitness':
      return { backgroundColor: '#dcfce7' };
    default:
      return { backgroundColor: '#f3f4f6' };
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
  },
  duration: {
    fontSize: 14,
    color: '#6b7280',
  },
});
