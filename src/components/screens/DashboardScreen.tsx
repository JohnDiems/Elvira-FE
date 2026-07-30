import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { apiService } from '@/components/API/BaseAPIService';
import { Icon } from '@/components/ui/Icon';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

interface DashboardScreenProps {
  setCurrentScreen: (screen: any) => void;
  isDarkMode: boolean;
  alertService: any;
}

export function DashboardScreen({ 
  setCurrentScreen,
  isDarkMode,
  alertService,
}: DashboardScreenProps) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const styles = getStyles(isDarkMode);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await apiService.request('/dashboard/summary', 'GET');
      setSummary(res);
    } catch (err) {
      console.log('Error loading dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleRestock = async (productId: number, currentStock: number) => {
    try {
      const newStock = currentStock + 20;
      await apiService.request(`/products/${productId}`, 'PUT', {
        current_stock: newStock,
        price_change_reason: 'Restock Action'
      });
      await loadSummary();
      alertService.success('Restock Successful', 'Product stock level increased by 20 units!');
    } catch (err: any) {
      alertService.error('Restock Failed', err.message || 'Failed to update stock.');
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return 'Php' + (price / 1000000).toFixed(1) + 'M';
    }
    return 'Php' + Number(price).toLocaleString('en-US', { minimumFractionDigits: 0 });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ElviraTheme.primary} />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  // Safely extract low stock list
  const lowStockList = summary?.low_stock || [];

  return (
    <View style={styles.container}>
      {/* Header (mockup style) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('hub')}>
            <Icon name="back" size={16} color={isDarkMode ? '#F5F5F5' : '#1C221F'} style={{ marginRight: 6 }} />
            <Text style={styles.backText}>Dashboard</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.settingsIcon} onPress={() => setCurrentScreen('settings')}>
          <Icon name="settings" size={18} color={isDarkMode ? '#F5F5F5' : '#1C221F'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Metric Cards Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={styles.metricIconCircleGreen}>
                <Icon name="dashboard" size={14} color="#10B981" />
              </View>
              <Text style={styles.metricBadge}>+12%</Text>
            </View>
            <Text style={styles.metricLabel}>Total Revenue</Text>
            <Text style={styles.metricValue}>{formatPrice(summary?.total_revenue ?? 0)}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={styles.metricIconCircleBlue}>
                <Text style={{ fontSize: 13, color: '#3B82F6' }}>🛒</Text>
              </View>
              <Text style={styles.metricBadge}>+6%</Text>
            </View>
            <Text style={styles.metricLabel}>Total Orders</Text>
            <Text style={styles.metricValue}>{summary?.total_orders ?? 0}</Text>
          </View>
        </View>

        {/* Weekly Sales Chart Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Weekly Sales</Text>
            <TouchableOpacity style={styles.chartTimeframeBtn}>
              <Text style={styles.chartTimeframeText}>This Week ▾</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartContainer}>
            {/* Tooltip on top of active Wednesday bar */}
            <View style={styles.tooltipPositioner}>
              <View style={styles.chartTooltip}>
                <Text style={styles.chartTooltipText}>Php3.5M</Text>
              </View>
              <View style={styles.tooltipArrow} />
            </View>

            <View style={styles.chartBars}>
              {[
                { label: 'P', amount: 40 },
                { label: 'T', amount: 30 },
                { label: 'W', amount: 85, active: true },
                { label: 'T', amount: 50 },
                { label: 'F', amount: 65 },
                { label: 'S', amount: 45 },
                { label: 'S', amount: 35 },
              ].map((item: any, index: number) => (
                <View key={index} style={styles.chartColumn}>
                  <View style={styles.barTrack}>
                    <View 
                      style={[
                        styles.barFill, 
                        { height: `${item.amount}%` },
                        item.active ? { backgroundColor: ElviraTheme.primary } : null
                      ]} 
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Low Stock alerts */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Low Stock</Text>
            <TouchableOpacity onPress={() => setCurrentScreen('catalog')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            {lowStockList.length === 0 ? (
              <Text style={styles.emptyText}>All products are fully stocked.</Text>
            ) : (
              lowStockList.map((item: any) => (
                <View key={item.id} style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <View style={styles.itemThumbMini}>
                      <Icon name="inventory" size={16} color={ElviraTheme.primary} />
                    </View>
                    <View>
                      <Text style={styles.listItemName}>{item.name}</Text>
                      <Text style={styles.listItemSub}>
                        Only {item.current_stock} left (Thresh: {item.low_stock_threshold})
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.restockBtn} 
                    onPress={() => handleRestock(item.id, item.current_stock)}
                  >
                    <Text style={styles.restockBtnText}>Restock</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Top Selling Products */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Selling</Text>
          
          <View style={styles.topSellingList}>
            {summary?.top_selling && summary.top_selling.length > 0 ? (
              summary.top_selling.map((item: any, idx: number) => (
                <View key={idx} style={styles.topSellingRow}>
                  <View style={styles.topSellerLeft}>
                    <View style={styles.itemThumbMini}>
                      <Icon name="shop" size={16} color={ElviraTheme.primary} />
                    </View>
                    <Text style={styles.topSellerName}>{item.name}</Text>
                  </View>
                  <Text style={styles.topSellerQty}>{item.total_sold} Sold Today</Text>
                </View>
              ))
            ) : (
              <View>
                <View style={styles.topSellingRow}>
                  <View style={styles.topSellerLeft}>
                    <View style={styles.itemThumbMini}>
                      <Icon name="shop" size={16} color={ElviraTheme.primary} />
                    </View>
                    <Text style={styles.topSellerName}>Americano</Text>
                  </View>
                  <Text style={styles.topSellerQty}>42 Sold Today</Text>
                </View>

                <View style={styles.topSellingRow}>
                  <View style={styles.topSellerLeft}>
                    <View style={styles.itemThumbMini}>
                      <Icon name="shop" size={16} color={ElviraTheme.primary} />
                    </View>
                    <Text style={styles.topSellerName}>Cappuccino</Text>
                  </View>
                  <Text style={styles.topSellerQty}>30 Sold Today</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        currentScreen="dashboard"
        setCurrentScreen={setCurrentScreen}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#F4F6F5',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#F4F6F5',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  settingsIcon: {
    padding: 6,
  },
  content: {
    padding: 20,
    paddingBottom: 90,
    gap: 14,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    padding: 14,
    gap: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricIconCircleGreen: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricIconCircleBlue: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10B981',
    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#E8EFE9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  card: {
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  chartTimeframeBtn: {
    backgroundColor: isDark ? '#2D2D2D' : '#F7F9F8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
  },
  chartTimeframeText: {
    fontSize: 10,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    fontWeight: 'bold',
  },
  chartContainer: {
    height: 140,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  tooltipPositioner: {
    position: 'absolute',
    top: 0,
    left: '25%',
    alignItems: 'center',
    zIndex: 10,
  },
  chartTooltip: {
    backgroundColor: '#1E2421',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chartTooltipText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    borderRightWidth: 4,
    borderRightColor: 'transparent',
    borderTopWidth: 4,
    borderTopColor: '#1E2421',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  chartColumn: {
    alignItems: 'center',
    width: '10%',
  },
  barTrack: {
    height: 80,
    width: 10,
    backgroundColor: isDark ? '#2D2D2D' : '#F4F6F5',
    borderRadius: 5,
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  barFill: {
    width: '100%',
    backgroundColor: isDark ? '#3D3D3D' : '#BDD2C4',
    borderRadius: 5,
  },
  barLabel: {
    fontSize: 9,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    fontWeight: 'bold',
  },
  viewAllLink: {
    fontSize: 11,
    color: ElviraTheme.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemThumbMini: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: isDark ? '#2D2D2D' : '#F7F9F8',
    borderWidth: 0.5,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  listItemSub: {
    fontSize: 10,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  restockBtn: {
    backgroundColor: ElviraTheme.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  restockBtnText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  topSellingList: {
    gap: 10,
  },
  topSellingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  topSellerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topSellerName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  topSellerQty: {
    fontSize: 11,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 12,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    textAlign: 'center',
    paddingVertical: 10,
  },

});
