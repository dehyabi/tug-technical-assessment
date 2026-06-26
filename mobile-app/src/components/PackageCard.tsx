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
        <View style={[styles.badge, { backgroundColor: getCategoryColors(pkg.category).bg }]}>
          <Text style={[styles.badgeText, { color: getCategoryColors(pkg.category).text }]}>
            {pkg.category}
          </Text>
        </View>
      </View>
      <View style={styles.details}>
        <Text style={styles.price}>${typeof pkg.price === 'number' ? pkg.price.toFixed(2) : pkg.price}</Text>
        <Text style={styles.duration}>{pkg.duration_minutes} min</Text>
      </View>
    </View>
  );
}

function getCategoryColors(category: string) {
  switch (category) {
    case 'massage':
      return { bg: '#bfdbfe', text: '#1e40af' };   // blue
    case 'facial':
      return { bg: '#fbcfe8', text: '#9d174d' };   // pink
    case 'fitness':
      return { bg: '#bbf7d0', text: '#166534' };   // green
    default:
      return { bg: '#e5e7eb', text: '#374151' };   // grey
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
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
