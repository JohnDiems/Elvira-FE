import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { apiService } from '@/components/API/BaseAPIService';
import { Icon } from '@/components/ui/Icon';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

interface OrdersListScreenProps {
  setCurrentScreen: (screen: any) => void;
  setCurrentOrder: (order: any) => void;
  isDarkMode: boolean;
}

export function OrdersListScreen({
  setCurrentScreen,
  setCurrentOrder,
  isDarkMode,
}: OrdersListScreenProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = getStyles(isDarkMode);

  const fetchOrders = async () => {
    try {
      const response = await apiService.request('/orders', 'GET');
      // Sort orders by id descending
      const sorted = response.sort((a: any, b: any) => b.id - a.id);
      setOrders(sorted);
    } catch (err) {
      console.log('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleSelectOrder = (order: any) => {
    setCurrentOrder(order);
    setCurrentScreen('print_preview');
  };

  const formatPrice = (price: number) => {
    return 'Php' + Number(price).toLocaleString('en-US', { minimumFractionDigits: 3 });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ElviraTheme.primary} />
        <Text style={styles.loadingText}>Fetching transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('hub')}>
          <Icon name="back" size={16} color={isDarkMode ? '#F5F5F5' : '#1C221F'} style={{ marginRight: 6 }} />
          <Text style={styles.backText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator size="small" color={ElviraTheme.primary} />
          ) : (
            <Text style={{ fontSize: 16 }}>🔄</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48 }}>📋</Text>
            <Text style={styles.emptyText}>No transactions recorded today.</Text>
            <TouchableOpacity style={styles.startBtn} onPress={() => setCurrentScreen('register_pos')}>
              <Text style={styles.startBtnText}>Start New Order</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => handleSelectOrder(order)}
            >
              <View style={styles.cardHeader}>
                <View>
                  {/* String cast safety to prevent substring undefined TypeError */}
                  <Text style={styles.orderId}>
                    Order #{String(order.id).substring(0, 8)}
                  </Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>PAID</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.bodyLeft}>
                  <Text style={styles.customerName}>{order.customer_name || 'Walk-in Customer'}</Text>
                  {order.table_number ? (
                    <Text style={styles.tableRef}>Table {order.table_number}</Text>
                  ) : null}
                  <Text style={styles.itemsCount}>{order.items?.length || 0} items purchased</Text>
                </View>
                <View style={styles.bodyRight}>
                  <Text style={styles.orderTotal}>{formatPrice(order.total_amount)}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 10, color: isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted }}>Details</Text>
                    <Icon name="arrow-right" size={10} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        currentScreen="orders_list"
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  refreshBtn: {
    padding: 6,
  },
  content: {
    padding: 20,
    paddingBottom: 90,
    gap: 12,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    fontSize: 13,
  },
  startBtn: {
    backgroundColor: ElviraTheme.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: isDark ? '#2D2D2D' : '#F4F6F5',
    paddingBottom: 8,
  },
  orderId: {
    fontSize: 13,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  orderDate: {
    fontSize: 9,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bodyLeft: {
    gap: 2,
  },
  customerName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  tableRef: {
    fontSize: 10,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  itemsCount: {
    fontSize: 10,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  bodyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E6F40',
  },
  statusBadge: {
    backgroundColor: isDark ? 'rgba(58, 83, 64, 0.2)' : '#E8EFE9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: isDark ? '#3A5340' : '#D4E2D7',
  },
  statusText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: ElviraTheme.primary,
    letterSpacing: 0.5,
  },

});
