/**
 * ProfileScreen - Citizen Profile
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ProfileScreen = () => {
  const { t } = useTranslation();
  const { user, oid, logout } = useAuth();
  const { colors, borderRadius } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatar}>👤</Text>
          <Text style={styles.name}>{user ? `${user.firstName} ${user.lastName}` : 'Citizen'}</Text>
          {oid && <Text style={styles.oid}>OID: {oid}</Text>}
        </View>
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>National ID</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user?.nationalId || 'N/A'}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Phone</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user?.phoneNumber || 'N/A'}</Text>
          </View>
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error, borderRadius: borderRadius.md }]} onPress={logout}>
            <Text style={styles.logoutText}>{t('auth.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 30, alignItems: 'center' },
  avatar: { fontSize: 60 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  oid: { fontSize: 12, color: '#fff', opacity: 0.8, marginTop: 5 },
  content: { padding: 16 },
  card: { padding: 16, marginBottom: 12, borderWidth: 1 },
  label: { fontSize: 12 },
  value: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  logoutButton: { padding: 16, alignItems: 'center', marginTop: 20 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
});

export default ProfileScreen;
