/**
 * RegisterScreen - Placeholder
 */
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const RegisterScreen = () => {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.text, { color: colors.text }]}>Register Screen</Text>
        <Text style={[styles.subtext, { color: colors.textSecondary }]}>
          New citizen registration via USSD: Dial *123#
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 20, fontWeight: 'bold' },
  subtext: { marginTop: 10, textAlign: 'center' },
});

export default RegisterScreen;
