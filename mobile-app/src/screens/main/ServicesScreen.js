/**
 * ServicesScreen - All Government Services
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const servicesList = [
  { id: 'health', nameAr: 'الخدمات الصحية', nameEn: 'Health Services', icon: '🏥' },
  { id: 'education', nameAr: 'الخدمات التعليمية', nameEn: 'Education Services', icon: '📚' },
  { id: 'agriculture', nameAr: 'الخدمات الزراعية', nameEn: 'Agriculture Services', icon: '🌾' },
  { id: 'finance', nameAr: 'الخدمات المالية', nameEn: 'Finance Services', icon: '💰' },
  { id: 'justice', nameAr: 'الخدمات العدلية', nameEn: 'Justice Services', icon: '⚖️' },
  { id: 'labor', nameAr: 'خدمات العمل', nameEn: 'Labor Services', icon: '👷' },
  { id: 'social', nameAr: 'الرعاية الاجتماعية', nameEn: 'Social Welfare', icon: '🤝' },
  { id: 'energy', nameAr: 'الطاقة', nameEn: 'Energy', icon: '⚡' },
  { id: 'infrastructure', nameAr: 'البنية التحتية', nameEn: 'Infrastructure', icon: '🏗️' },
  { id: 'foreign', nameAr: 'الخارجية', nameEn: 'Foreign Affairs', icon: '🌍' },
];

const ServicesScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { colors, borderRadius } = useTheme();
  const isArabic = i18n.language === 'ar';

  const handleServicePress = (serviceId) => {
    const screenMap = { health: 'Health', education: 'Education', agriculture: 'Agriculture', finance: 'Finance' };
    if (screenMap[serviceId]) {
      navigation.navigate(screenMap[serviceId]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.grid}>
        {servicesList.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}
            onPress={() => handleServicePress(service.id)}
          >
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

export default ServicesScreen;
