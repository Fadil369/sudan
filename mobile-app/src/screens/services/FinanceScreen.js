/**
 * FinanceScreen - Finance Services
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const financeServices = [
  { id: 'tax', nameAr: 'الضرائب', nameEn: 'Tax Records', icon: '📊' },
  { id: 'benefits', nameAr: 'المساعدة الاجتماعية', nameEn: 'Social Benefits', icon: '🤝' },
  { id: 'bank', nameAr: 'الحساب المصرفي', nameEn: 'Bank Account', icon: '🏦' },
];

const FinanceScreen = () => {
  const { i18n } = useTranslation();
  const { colors, borderRadius } = useTheme();
  const isArabic = i18n.language === 'ar';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.grid}>
        {financeServices.map((service) => (
          <TouchableOpacity key={service.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
            <Text style={styles.icon}>{service.icon}</Text>
            <Text style={[styles.name, { color: colors.text }]}>{isArabic ? service.nameAr : service.nameEn}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, justifyContent: 'space-between' },
  card: { width: '48%', padding: 20, marginBottom: 12, alignItems: 'center', borderWidth: 1 },
  icon: { fontSize: 36, marginBottom: 8 },
  name: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});

export default FinanceScreen;
