/**
 * SettingsScreen
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const { colors, borderRadius, isDarkMode, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Display</Text>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
            <Switch value={isDarkMode} onValueChange={toggleTheme} />
          </View>
          <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} onPress={toggleLanguage}>
            <Text style={[styles.label, { color: colors.text }]}>Language / اللغة</Text>
            <Text style={[styles.value, { color: colors.textSecondary }]}>{i18n.language === 'ar' ? 'العربية' : 'English'}</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.text }]}>Version</Text>
            <Text style={[styles.value, { color: colors.textSecondary }]}>1.0.0</Text>
          </View>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.text }]}>OID Root</Text>
            <Text style={[styles.value, { color: colors.textSecondary }]}>1.3.6.1.4.1.61026</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  sectionTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  label: { fontSize: 16 },
  value: { fontSize: 14 },
});

export default SettingsScreen;
