import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Modal, TextInput } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { apiService } from '@/components/API/BaseAPIService';
import { storage } from '@/components/API/storage';
import { Icon } from '@/components/ui/Icon';

interface SettingsScreenProps {
  setCurrentScreen: (screen: any) => void;
  currentUser: any;
  setCurrentUser: (user: any) => void;
  onLogout: () => void;
  activeShift: any;
  setActiveShift: (shift: any) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  alertService: any;
}

export function SettingsScreen({
  setCurrentScreen,
  currentUser,
  setCurrentUser,
  onLogout,
  activeShift,
  setActiveShift,
  isDarkMode,
  setIsDarkMode,
  alertService,
}: SettingsScreenProps) {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [ordersCount, setOrdersCount] = useState(0);
  const [shiftHoursText, setShiftHoursText] = useState('0h 0m');
  const [language, setLanguage] = useState('English (US)');

  // Modal forms states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newName, setNewName] = useState(currentUser?.name || '');
  const [newEmail, setNewEmail] = useState(currentUser?.email || '');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const styles = getStyles(isDarkMode);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const persistedNotif = await storage.getItem('_notifications');
        if (persistedNotif !== null) {
          setNotifications(persistedNotif === 'true');
        }
        const persistedLang = await storage.getItem('_language');
        if (persistedLang !== null) {
          setLanguage(persistedLang);
        }
      } catch (err) {
        console.log('Error loading preferences:', err);
      }
    };
    loadPreferences();
  }, []);

  useEffect(() => {
    const calculateShiftStats = () => {
      if (activeShift) {
        setOrdersCount(activeShift.orders_count || 0);
        
        try {
          const startedAt = new Date(activeShift.started_at);
          const now = new Date();
          const diffMs = now.getTime() - startedAt.getTime();
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          setShiftHoursText(`${diffHrs}h ${diffMins}m`);
        } catch {
          setShiftHoursText('Running');
        }
      }
    };

    calculateShiftStats();
    const interval = setInterval(calculateShiftStats, 60000);
    return () => clearInterval(interval);
  }, [activeShift]);

  const handleEndShift = () => {
    alertService.confirm(
      'End Cashier Shift',
      'Are you sure you want to end your active cashier shift? This will generate your print report.',
      async () => {
        setLoading(true);
        try {
          await apiService.request(`/shifts/${activeShift.id}/end`, 'POST');
          setActiveShift(null);
          alertService.success('Shift Ended', 'Shift ended successfully. Report sent to printer!');
          setCurrentScreen('hub');
        } catch (err: any) {
          alertService.error('Error', err.message || 'Failed to end shift.');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleUpdateProfile = async () => {
    if (!newName.trim() || !newEmail.trim()) {
      setModalError('All fields are required.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      const res = await apiService.request('/user/profile', 'PUT', {
        name: newName,
        email: newEmail,
      });
      setCurrentUser(res.user);
      alertService.success('Profile Saved', 'Personal information updated successfully.');
      setShowProfileModal(false);
    } catch (err: any) {
      setModalError(err.message || 'Failed to update profile.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setModalError('All fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      setModalError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('New passwords do not match.');
      return;
    }

    setModalLoading(true);
    setModalError('');
    try {
      await apiService.request('/user/password', 'PUT', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      alertService.success('Security Updated', 'Your password was changed successfully.');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setModalError(err.message || 'Failed to update password.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleNotifications = async (val: boolean) => {
    setNotifications(val);
    try {
      await storage.setItem('_notifications', String(val));
      alertService.toast(`Notifications ${val ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.log(err);
    }
  };

  const handleToggleDarkMode = async (val: boolean) => {
    try {
      await storage.setItem('_dark_mode', String(val));
      setIsDarkMode(val);
      alertService.toast(`Dark Mode ${val ? 'enabled' : 'disabled'}`, 'info');
    } catch (err) {
      console.log(err);
    }
  };

  const handleSelectLanguage = async (lang: string) => {
    setLanguage(lang);
    try {
      await storage.setItem('_language', lang);
      alertService.toast(`Language switched to ${lang}`, 'info');
      setShowLanguageModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircleMini}>
            <Icon name="profile" size={16} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
          </View>
          <View>
            <Text style={styles.headerTitle}>ElviraCafe POS</Text>
            <Text style={styles.headerSub}>Settings</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsIcon} onPress={() => setCurrentScreen('hub')}>
          <Icon name="close" size={18} color={isDarkMode ? '#F5F5F5' : '#1C221F'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card Info */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfoLeft}>
            <View style={styles.avatarCircleLarge}>
              <Text style={{ fontSize: 32 }}>👨‍🍳</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{currentUser?.name || 'Ivory Dolina'}</Text>
              <Text style={styles.profileRole}>Role: {currentUser?.role?.toUpperCase() || 'CASHIER'}</Text>
              <Text style={styles.cashierBadgeId}>ID: #{currentUser?.id ? String(currentUser.id).substring(0, 4) : '8821'}</Text>
            </View>
          </View>
        </View>

        {/* Shift Details (Only display if shift is active) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>SHIFT STATUS</Text>
          
          <View style={styles.shiftDetailsRow}>
            <View style={styles.statusBlock}>
              <Text style={styles.statusDot}>🟢</Text>
              <Text style={styles.statusLabel}>{activeShift ? 'Shift Active' : 'No Shift Active'}</Text>
            </View>
            {activeShift ? (
              <Text style={styles.startedTimeText}>
                Started: {new Date(activeShift.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            ) : null}
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Hours Elapsed</Text>
              <Text style={styles.statValue}>{shiftHoursText}</Text>
            </View>
            <View style={[styles.statBox, styles.statBorderLeft]}>
              <Text style={styles.statLabel}>Orders Processed</Text>
              <Text style={styles.statValue}>{ordersCount}</Text>
            </View>
          </View>

          {activeShift && currentUser.role === 'cashier' ? (
            <TouchableOpacity 
              style={styles.endShiftBtn} 
              onPress={handleEndShift}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={ElviraTheme.red} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="alert" size={14} color="#EF4444" />
                  <Text style={styles.endShiftText}>End Active Shift</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Account Settings */}
        <Text style={styles.groupHeader}>ACCOUNT SETTINGS</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => {
              setNewName(currentUser?.name || '');
              setNewEmail(currentUser?.email || '');
              setModalError('');
              setShowProfileModal(true);
            }}
          >
            <View style={styles.settingItemLeft}>
              <View style={styles.itemIconBox}>
                <Icon name="profile" size={14} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
              </View>
              <Text style={styles.settingText}>Personal Information</Text>
            </View>
            <Icon name="arrow-right" size={12} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setModalError('');
              setShowPasswordModal(true);
            }}
          >
            <View style={styles.settingItemLeft}>
              <View style={styles.itemIconBox}>
                <Icon name="lock" size={14} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
              </View>
              <Text style={styles.settingText}>Security & Password</Text>
            </View>
            <Icon name="arrow-right" size={12} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Application settings */}
        <Text style={styles.groupHeader}>APPLICATION</Text>
        <View style={styles.card}>
          <View style={styles.settingItemRow}>
            <View style={styles.settingItemLeft}>
              <View style={styles.itemIconBox}>
                <Icon name="bell" size={14} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
              </View>
              <Text style={styles.settingText}>Notification Preferences</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: isDarkMode ? '#333333' : ElviraTheme.border, true: 'rgba(58, 83, 64, 0.4)' }}
              thumbColor={notifications ? ElviraTheme.primary : '#BDD2C4'}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={() => setShowLanguageModal(true)}>
            <View style={styles.settingItemLeft}>
              <View style={styles.itemIconBox}>
                <Icon name="globe" size={14} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
              </View>
              <Text style={styles.settingText}>Language</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.settingValue}>{language}</Text>
              <Icon name="arrow-right" size={11} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={styles.settingItemRow}>
            <View style={styles.settingItemLeft}>
              <View style={styles.itemIconBox}>
                <Icon name="moon" size={14} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
              </View>
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: isDarkMode ? '#333333' : ElviraTheme.border, true: 'rgba(58, 83, 64, 0.4)' }}
              thumbColor={isDarkMode ? ElviraTheme.primary : '#BDD2C4'}
            />
          </View>
        </View>

        {/* Logout session item */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Icon name="logout" size={14} color="#EF4444" style={{ marginRight: 6 }} />
          <Text style={styles.logoutBtnText}>Logout Session</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Elvira POS v2.1.0-Release • Powered by Sanctum</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showProfileModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Personal Information</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <Icon name="close" size={20} color={isDarkMode ? '#F5F5F5' : '#1C221F'} />
              </TouchableOpacity>
            </View>

            {modalError ? <Text style={styles.modalErrorText}>{modalError}</Text> : null}

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter full name"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter email address"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted}
                  keyboardType="email-address"
                  value={newEmail}
                  onChangeText={setNewEmail}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.modalSaveBtn} 
              onPress={handleUpdateProfile}
              disabled={modalLoading}
            >
              {modalLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSaveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Security & Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Icon name="close" size={20} color={isDarkMode ? '#F5F5F5' : '#1C221F'} />
              </TouchableOpacity>
            </View>

            {modalError ? <Text style={styles.modalErrorText}>{modalError}</Text> : null}

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CURRENT PASSWORD</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter current password"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NEW PASSWORD</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Repeat new password"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.modalSaveBtn} 
              onPress={handleUpdatePassword}
              disabled={modalLoading}
            >
              {modalLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSaveBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Picker Modal */}
      <Modal visible={showLanguageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Icon name="close" size={20} color={isDarkMode ? '#F5F5F5' : '#1C221F'} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {['English (US)', 'Indonesian (ID)', 'Spanish (ES)'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.langSelectItem,
                    language === lang ? styles.activeLangSelectItem : null
                  ]}
                  onPress={() => handleSelectLanguage(lang)}
                >
                  <Text style={[
                    styles.langSelectText,
                    language === lang ? styles.activeLangSelectText : null
                  ]}>
                    {lang}
                  </Text>
                  {language === lang ? (
                    <Text style={styles.langCheckMark}>✓</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('hub')}>
          <Icon name="home" size={20} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('register_pos')}>
          <Icon name="shop" size={20} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
          <Text style={styles.navText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('orders_list')}>
          <Icon name="catalog" size={20} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('catalog')}>
          <Icon name="cafe" size={20} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
          <Text style={styles.navText}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('settings')}>
          <Icon name="settings" size={20} color={ElviraTheme.primary} />
          <Text style={[styles.navText, styles.activeNavText]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#F4F6F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
    borderBottomWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
    marginTop: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircleMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? '#2D2D2D' : '#F7F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  headerSub: {
    fontSize: 10,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  settingsIcon: {
    padding: 6,
  },
  content: {
    padding: 20,
    paddingBottom: 90,
    gap: 16,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  profileCard: {
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircleLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: isDark ? '#2D2D2D' : '#F7F9F8',
    borderWidth: 1,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 11,
    color: ElviraTheme.primary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cashierBadgeId: {
    fontSize: 10,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  card: {
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    borderBottomWidth: 1,
    borderColor: isDark ? '#2D2D2D' : '#F4F6F5',
    paddingBottom: 8,
    marginBottom: 4,
  },
  shiftDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    fontSize: 10,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  startedTimeText: {
    fontSize: 11,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: isDark ? '#2D2D2D' : '#F4F6F5',
    paddingTop: 12,
    marginTop: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statBorderLeft: {
    borderLeftWidth: 1,
    borderColor: isDark ? '#2D2D2D' : '#F4F6F5',
  },
  statLabel: {
    fontSize: 10,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  endShiftBtn: {
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  endShiftText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
  groupHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    marginTop: 10,
    marginBottom: 2,
    paddingLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: isDark ? '#2D2D2D' : '#F7F9F8',
    borderWidth: 0.5,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 12,
    fontWeight: '500',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  settingValue: {
    fontSize: 11,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2',
    borderRadius: 14,
    height: 44,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 9,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    textAlign: 'center',
    marginTop: 14,
  },
  navigationBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
    borderTopWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: 9,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  activeNavText: {
    color: ElviraTheme.primary,
  },
  // Modal dialog styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: isDark ? 1 : 0,
    borderColor: '#3D3D3D',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: isDark ? '#2D2D2D' : '#F4F6F5',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  modalErrorText: {
    color: ElviraTheme.red,
    fontSize: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  modalBody: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  textInput: {
    backgroundColor: isDark ? '#2D2D2D' : '#F7F9F8',
    borderWidth: 1,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 13,
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  modalSaveBtn: {
    backgroundColor: ElviraTheme.primary,
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  // Language list styles
  langSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF',
    marginBottom: 8,
  },
  activeLangSelectItem: {
    borderColor: ElviraTheme.primary,
    backgroundColor: isDark ? 'rgba(58, 83, 64, 0.2)' : '#E8EFE9',
  },
  langSelectText: {
    fontSize: 13,
    color: isDark ? '#F5F5F5' : '#1C221F',
    fontWeight: '500',
  },
  activeLangSelectText: {
    color: ElviraTheme.primary,
    fontWeight: 'bold',
  },
  langCheckMark: {
    color: ElviraTheme.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
