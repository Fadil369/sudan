/**
 * HealthScreen - Health Services
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const healthServices = [
  { id: 'records', nameAr: 'السجلات الطبية', nameEn: 'Medical Records', icon: '📋' },
  { id: 'appointments', nameAr: 'الحجوزات', nameEn: 'Appointments', icon: '📅' },
  { id: 'vaccinations', nameAr: 'التطعيمات', nameEn: 'Vaccinations', icon: '💉' },
  { id: 'prescriptions', nameAr: 'الوصفات الطبية', nameEn: 'Prescriptions', icon: '💊' },
  { id: 'hospitals', nameAr: 'المستشفيات', nameEn: 'Hospitals', icon: '🏥' },
  { id: 'emergency', nameAr: 'الطوارئ', nameEn: 'Emergency', icon: '🚑' },
];

const HealthScreen = () => {
  const { t, i18n } = useTranslation();
  const { colors, borderRadius } = useTheme();
  const isArabic = i18n.language === 'ar';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.grid}>
        {healthServices.map((service) => (
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

export default HealthScreen;
