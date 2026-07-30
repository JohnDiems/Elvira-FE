import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { apiService } from '@/components/API/BaseAPIService';
import { Icon } from '@/components/ui/Icon';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

interface HubScreenProps {
  setCurrentScreen: (screen: any) => void;
  currentUser: any;
  setStoreConfig: (config: any) => void;
  onLogout: () => void;
  activeShift: any;
  setActiveShift: (shift: any) => void;
  isDarkMode: boolean;
}

export function HubScreen({
  setCurrentScreen,
  currentUser,
  setStoreConfig,
  onLogout,
  activeShift,
  setActiveShift,
  isDarkMode,
}: HubScreenProps) {
  const [loading, setLoading] = useState(true);
  const [ordersCount, setOrdersCount] = useState(0);
  const [shiftStartText, setShiftStartText] = useState('08:00 AM');
  const [lowStockCount, setLowStockCount] = useState(3);
  const [productsCount, setProductsCount] = useState(42);

  // Drawer sidebar state
  const [showDrawer, setShowDrawer] = useState(false);

  const styles = getStyles(isDarkMode);

  const fetchShiftAndMetrics = async () => {
    setLoading(true);
    try {
      const shiftRes = await apiService.request('/shifts/status', 'GET');
      setActiveShift(shiftRes.active_shift);
      setOrdersCount(shiftRes.orders_processed_today ?? 12);

      if (shiftRes.active_shift) {
        const startTime = new Date(shiftRes.active_shift.started_at);
        setShiftStartText(startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }

      // Load catalog count
      const prodRes = await apiService.request('/products', 'GET');
      setProductsCount(prodRes?.length ?? 42);
      const lowStock = prodRes?.filter(
        (p: any) => p.track_inventory && p.current_stock <= p.low_stock_threshold
      ) || [];
      setLowStockCount(lowStock.length);
    } catch (err) {
      console.log('Error loading hub details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftAndMetrics();
  }, []);

  const handleLaunchRegister = () => {
    setCurrentScreen('register_pos');
  };

  if (loading && !activeShift) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ElviraTheme.primary} />
        <Text style={styles.loadingText}>Loading workspace...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header (mockup style) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setShowDrawer(true)}>
          <Icon name="menu" size={20} color={isDarkMode ? '#F5F5F5' : '#1C221F'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Elvira Cafe</Text>
        <View style={styles.profileIndicatorWrapper}>
          <View style={styles.profileCircle}>
            <Icon name="profile" size={16} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
          </View>
          <View style={styles.onlineDot} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Welcome block */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back, {currentUser?.name?.split(' ')[0] || 'Ivory'}</Text>
          <Text style={styles.shiftSubtitle}>
            🟢 Shift started at {shiftStartText}
          </Text>
        </View>

        {/* Register Launcher card (Large dark-green card with register icon) */}
        <TouchableOpacity style={styles.registerLauncherCard} onPress={handleLaunchRegister}>
          <View style={styles.registerLeft}>
            <View style={styles.registerIconCircle}>
              <Icon name="shop" size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.registerTitle}>Register</Text>
              <Text style={styles.registerDesc}>Launch Point of Sale</Text>
            </View>
          </View>
          <View style={styles.cardArrow}>
            <Icon name="arrow-right" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Quick Grid cards */}
        <View style={styles.grid}>
          {/* Orders */}
          <TouchableOpacity style={styles.gridCard} onPress={() => setCurrentScreen('orders_list')}>
            <View style={styles.gridIconCircleBlue}>
              <Icon name="catalog" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.gridTitle}>Orders</Text>
            <Text style={styles.gridDesc}>{ordersCount} Active Today</Text>
          </TouchableOpacity>

          {/* Inventory (Admin only) */}
          {currentUser?.role?.toLowerCase() === 'admin' ? (
            <TouchableOpacity style={styles.gridCard} onPress={() => setCurrentScreen('dashboard')}>
              <View style={styles.gridIconCircleRed}>
                <Icon name="inventory" size={16} color={ElviraTheme.red} />
              </View>
              <Text style={styles.gridTitle}>Inventory</Text>
              <Text style={[styles.gridDesc, lowStockCount > 0 ? { color: ElviraTheme.red, fontWeight: 'bold' } : null]}>
                {lowStockCount} Low Stock
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Analytics (Admin only) */}
          {currentUser?.role?.toLowerCase() === 'admin' ? (
            <TouchableOpacity style={styles.gridCard} onPress={() => setCurrentScreen('dashboard')}>
              <View style={styles.gridIconCircleGreen}>
                <Icon name="dashboard" size={16} color="#10B981" />
              </View>
              <Text style={styles.gridTitle}>Analytics</Text>
              <Text style={styles.gridDesc}>View Reports</Text>
            </TouchableOpacity>
          ) : null}

          {/* Add Staff (Admin only) */}
          {currentUser?.role?.toLowerCase() === 'admin' ? (
            <TouchableOpacity style={styles.gridCard} onPress={() => setCurrentScreen('create_cashier')}>
              <View style={styles.gridIconCircleBlue}>
                <Icon name="person-add" size={16} color="#3B82F6" />
              </View>
              <Text style={styles.gridTitle}>Add Staff</Text>
              <Text style={styles.gridDesc}>Create Account</Text>
            </TouchableOpacity>
          ) : null}

          {/* Menu */}
          <TouchableOpacity style={styles.gridCard} onPress={() => setCurrentScreen('catalog')}>
            <View style={styles.gridIconCircleAmber}>
              <Icon name="cafe" size={16} color="#F59E0B" />
            </View>
            <Text style={styles.gridTitle}>Menu</Text>
            <Text style={styles.gridDesc}>{productsCount} Items</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Navigation row option */}
        <TouchableOpacity style={styles.settingsRowCard} onPress={() => setCurrentScreen('settings')}>
          <View style={styles.settingsRowLeft}>
            <View style={styles.settingsIconCircle}>
              <Icon name="settings" size={16} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
            </View>
            <View>
              <Text style={styles.settingsRowTitle}>Settings</Text>
              <Text style={styles.settingsRowSub}>System Preferences</Text>
            </View>
          </View>
          <Icon name="arrow-right" size={14} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
        </TouchableOpacity>

        {/* Daily hours details footer */}
        <View style={styles.hubFooter}>
          <View style={styles.footerBadge}>
            <Text style={styles.footerBadgeLabel}>DAILY HOURS</Text>
            <Text style={styles.footerBadgeValue}>07:00 - 20:00</Text>
          </View>
          <View style={styles.footerBadge}>
            <Text style={styles.footerBadgeLabel}>STATUS</Text>
            <Text style={styles.footerBadgeValueGreen}>Online</Text>
          </View>
        </View>
      </ScrollView>

      {/* Slide-out Sidebar Drawer Modal */}
      <Modal visible={showDrawer} transparent animationType="fade">
        <View style={styles.drawerOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowDrawer(false)}>
            <View style={styles.drawerBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.drawerContent}>
            <View style={{ flex: 1, gap: 16 }}>
              {/* Drawer Header with Left: Profile and Right: Close X */}
              <View style={styles.drawerHeader}>
                <View style={styles.drawerHeaderLeft}>
                  <View style={styles.drawerAvatarCircle}>
                    <Text style={{ fontSize: 24 }}>👨‍🍳</Text>
                  </View>
                  <View>
                    <Text style={styles.drawerName}>{currentUser?.name || 'Ivory Dolina'}</Text>
                    <Text style={styles.drawerRole}>{currentUser?.role?.toUpperCase() || 'CASHIER'}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.drawerCloseX} onPress={() => setShowDrawer(false)}>
                  <Icon name="close" size={18} color={isDarkMode ? '#F5F5F5' : '#1C221F'} />
                </TouchableOpacity>
              </View>

              <View style={styles.drawerDivider} />

              {/* Navigation links */}
              <View style={styles.drawerLinks}>
                <TouchableOpacity 
                  style={styles.drawerLinkItem} 
                  onPress={() => { setShowDrawer(false); setCurrentScreen('hub'); }}
                >
                  <Icon name="home" size={18} color={ElviraTheme.primary} style={{ marginRight: 12 }} />
                  <Text style={styles.drawerLinkText}>Hub / Home</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.drawerLinkItem} 
                  onPress={() => { setShowDrawer(false); setCurrentScreen('register_pos'); }}
                >
                  <Icon name="shop" size={18} color={ElviraTheme.primary} style={{ marginRight: 12 }} />
                  <Text style={styles.drawerLinkText}>Point of Sale (Register)</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.drawerLinkItem} 
                  onPress={() => { setShowDrawer(false); setCurrentScreen('orders_list'); }}
                >
                  <Icon name="catalog" size={18} color={ElviraTheme.primary} style={{ marginRight: 12 }} />
                  <Text style={styles.drawerLinkText}>Transaction History</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.drawerLinkItem} 
                  onPress={() => { setShowDrawer(false); setCurrentScreen('catalog'); }}
                >
                  <Icon name="cafe" size={18} color={ElviraTheme.primary} style={{ marginRight: 12 }} />
                  <Text style={styles.drawerLinkText}>Product Catalog</Text>
                </TouchableOpacity>

                {currentUser?.role?.toLowerCase() === 'admin' ? (
                  <>
                    <TouchableOpacity 
                      style={styles.drawerLinkItem} 
                      onPress={() => { setShowDrawer(false); setCurrentScreen('manage_categories'); }}
                    >
                      <Icon name="catalog" size={18} color={ElviraTheme.primary} style={{ marginRight: 12 }} />
                      <Text style={styles.drawerLinkText}>Manage Categories</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.drawerLinkItem} 
                      onPress={() => { setShowDrawer(false); setCurrentScreen('create_cashier'); }}
                    >
                      <Icon name="person-add" size={18} color={ElviraTheme.primary} style={{ marginRight: 12 }} />
                      <Text style={styles.drawerLinkText}>Add Staff Account</Text>
                    </TouchableOpacity>
                  </>
                ) : null}

                <TouchableOpacity 
                  style={styles.drawerLinkItem} 
                  onPress={() => { setShowDrawer(false); setCurrentScreen('settings'); }}
                >
                  <Icon name="settings" size={18} color={ElviraTheme.primary} style={{ marginRight: 12 }} />
                  <Text style={styles.drawerLinkText}>Settings</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.drawerDivider} />

            {/* Logout button positioned cleanly at the bottom */}
            <TouchableOpacity 
              style={styles.drawerLogoutBtn} 
              onPress={() => { setShowDrawer(false); onLogout(); }}
            >
              <Icon name="logout" size={16} color="#EF4444" style={{ marginRight: 10 }} />
              <Text style={styles.drawerLogoutText}>Logout Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        currentScreen="hub"
        setCurrentScreen={setCurrentScreen}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : ElviraTheme.bgDark,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : ElviraTheme.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    fontSize: 14,
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
  menuBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  profileIndicatorWrapper: {
    position: 'relative',
  },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? '#2D2D2D' : '#F7F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1,
    borderColor: isDark ? '#1A1A1A' : '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 80,
    gap: 16,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  welcomeSection: {
    alignItems: 'flex-start',
    marginTop: 4,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
    marginBottom: 2,
  },
  shiftSubtitle: {
    fontSize: 12,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    fontWeight: '500',
  },
  registerLauncherCard: {
    backgroundColor: ElviraTheme.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  registerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  registerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  registerDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  cardArrow: {
    padding: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '47%',
    flexGrow: 1,
    minWidth: 120,
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    padding: 16,
    gap: 6,
  },
  gridIconCircleBlue: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridIconCircleRed: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridIconCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridIconCircleAmber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  gridDesc: {
    fontSize: 11,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  settingsRowCard: {
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: isDark ? '#2D2D2D' : '#F7F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
  },
  settingsRowTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
    marginBottom: 2,
  },
  settingsRowSub: {
    fontSize: 10,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  hubFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  footerBadge: {
    flex: 1,
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  footerBadgeLabel: {
    fontSize: 8,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerBadgeValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  footerBadgeValueGreen: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
  },

  // Slide-out sidebar drawer styles
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  drawerBackdrop: {
    flex: 1,
  },
  drawerContent: {
    width: 280,
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    height: '100%',
    padding: 20,
    paddingTop: 50,
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  drawerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drawerCloseX: {
    padding: 6,
  },
  drawerAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? '#2D2D2D' : '#F7F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
  },
  drawerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  drawerRole: {
    fontSize: 10,
    color: ElviraTheme.primary,
    fontWeight: 'bold',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: isDark ? '#2D2D2D' : '#F4F6F5',
    marginVertical: 4,
  },
  drawerLinks: {
    gap: 14,
    marginTop: 8,
  },
  drawerLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  drawerLinkText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 14,
    height: 44,
    width: '100%',
    marginBottom: 20,
  },
  drawerLogoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
