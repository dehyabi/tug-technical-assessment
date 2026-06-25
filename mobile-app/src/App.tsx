import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import PackagesScreen from './screens/PackagesScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <PackagesScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});
