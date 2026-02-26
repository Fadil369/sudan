/**
 * NotificationsScreen
 */
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const NotificationsScreen = () => {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.empty}>
        <Text style={styles.icon}>🔔</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>No notifications</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 48, marginBottom: 10 },
  text: { fontSize: 16 },
});

export default NotificationsScreen;
