/**
 * HomeScreen - Main Dashboard
 * SGDUS Mobile App
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, oid } = useAuth();
  const { colors, spacing, borderRadius } = useTheme();

  const quickServices = [
    { id: 'health', name: t('services.health'), icon: '🏥', color: '#ef4444' },
    { id: 'education', name: t('services.education'), icon: '📚', color: '#3b82f6' },
    { id: 'agriculture', name: t('services.agriculture'), icon: '🌾', color: '#22c55e' },
    { id: 'finance', name: t('services.finance'), icon: '💰', color: '#f59e0b' },
  ];

  const allServices = [
    { id: 'health', name: t('services.health'), icon: '🏥' },
    { id: 'education', name: t('services.education'), icon: '📚' },
    { id: 'agriculture', name: t('services.agriculture'), icon: '🌾' },
    { id: 'finance', name: t('services.finance'), icon: '💰' },
    { id: 'justice', name: t('services.justice'), icon: '⚖️' },
    { id: 'labor', name: t('services.labor'), icon: '👷' },
    { id: 'social', name: t('services.social'), icon: '🤝' },
    { id: 'energy', name: t('services.energy'), icon: '⚡' },
    { id: 'infrastructure', name: t('services.infrastructure'), icon: '🏗️' },
    { id: 'foreignAffairs', name: t('services.foreignAffairs'), icon: '🌍' },
  ];

  const navigateToService = (serviceId) => {
    const screenMap = {
      health: 'Health',
      education: 'Education',
      agriculture: 'Agriculture',
      finance: 'Finance',
    };
    navigation.navigate('Services', {
      screen: screenMap[serviceId] || 'ServicesMain',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerTitle}>
            {t('nav.home')}
          </Text>
          <Text style={styles.headerSubtitle}>
            {user ? `${user.firstName} ${user.lastName}` : 'Citizen'}
          </Text>
          {oid && (
            <Text style={styles.oidText}>OID: {oid}</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('services.title')}
          </Text>
          <View style={styles.quickGrid}>
            {quickServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.quickCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: borderRadius.lg,
                  },
                ]}
                onPress={() => navigateToService(service.id)}
              >
                <View
                  style={[
                    styles.quickIcon,
                    { backgroundColor: service.color + '20' },
                  ]}
                >
                  <Text style={styles.quickIconText}>{service.icon}</Text>
                </View>
                <Text
                  style={[styles.quickName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {service.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* All Services */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('services.title')}
          </Text>
          <View style={styles.servicesGrid}>
            {allServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
                onPress={() => navigateToService(service.id)}
              >
                <Text style={styles.serviceIcon}>{service.icon}</Text>
                <Text
                  style={[styles.serviceName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {service.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Activity
          </Text>
          <View
            style={[
              styles.activityCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No recent activity
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginTop: 4,
    opacity: 0.9,
  },
  oidText: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 8,
    opacity: 0.7,
    fontFamily: 'monospace',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickCard: {
    width: '48%',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickIconText: {
    fontSize: 28,
  },
  quickName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '31%',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 11,
    textAlign: 'center',
  },
  activityCard: {
    padding: 20,
    borderWidth: 1,
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default HomeScreen;
