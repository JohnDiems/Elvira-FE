import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

interface SuccessScreenProps {
  setCurrentScreen: (screen: any) => void;
  currentOrder: any;
  setCustomerName: (name: string) => void;
  setTableNumber: (table: string) => void;
}

export function SuccessScreen({
  setCurrentScreen,
  currentOrder,
  setCustomerName,
  setTableNumber,
}: SuccessScreenProps) {
  if (!currentOrder) return null;

  const handleNewTransaction = () => {
    setCustomerName('');
    setTableNumber('');
    setCurrentScreen('register_pos');
  };

  const handleSend = () => {
    alert('Mock Action: Receipt sent to customer via email/SMS!');
  };

  const formatPrice = (price: number) => {
    return 'Php' + Number(price).toLocaleString('en-US', { minimumFractionDigits: 3 });
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerCheckIcon}>
          <Text style={{ fontSize: 16 }}>✓</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Elvira Cafe</Text>
        <TouchableOpacity>
          <Text style={{ fontSize: 16 }}>🌐</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Success checkmark banner */}
        <View style={styles.successHeader}>
          <View style={styles.checkCircle}>
            <Text style={{ fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' }}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Payment Successful</Text>
          <Text style={styles.successSub}>Thank you for your visit!</Text>
        </View>

        {/* Invoice details card */}
        <View style={styles.card}>
          <View style={styles.metadataRow}>
            <View>
              <Text style={styles.metadataLabel}>ORDER ID</Text>
              <Text style={styles.metadataValue}>#{currentOrder.id ? String(currentOrder.id).substring(0, 8) : '2938'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.metadataLabel}>CASHIER</Text>
              <Text style={styles.metadataValue}>{currentOrder.cashier?.name || 'Ivory Dolina'}</Text>
            </View>
          </View>

          <View style={styles.metadataRow}>
            <View>
              <Text style={styles.metadataLabel}>DATE</Text>
              <Text style={styles.metadataValue}>{formatDate(currentOrder.created_at)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.metadataLabel}>CUSTOMER</Text>
              <Text style={styles.metadataValue}>{currentOrder.customer_name || 'April Pellasco'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Items mapping */}
          <View style={styles.itemsList}>
            {currentOrder.items?.map((item: any) => (
              <View key={item.id} style={styles.itemRow}>
                <View>
                  <Text style={styles.itemName}>{item.product?.name || 'Item'}</Text>
                  <Text style={styles.itemQty}>Php {Number(item.unit_price).toFixed(2)} x {item.quantity}</Text>
                </View>
                <Text style={styles.itemSubtotal}>{formatPrice(item.subtotal)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Breakdown billing */}
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Subtotal</Text>
            <Text style={styles.breakdownValue}>{formatPrice(currentOrder.subtotal)}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Tax (11%)</Text>
            <Text style={styles.breakdownValue}>{formatPrice(currentOrder.tax_amount)}</Text>
          </View>

          <View style={[styles.breakdownRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(currentOrder.total_amount)}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>PAYMENT METHOD</Text>
            <Text style={styles.breakdownValue}>{currentOrder.payment_method?.toUpperCase() || 'CASH'}</Text>
          </View>
        </View>

        {/* Action Button: + New Transaction */}
        <TouchableOpacity style={styles.newTxBtn} onPress={handleNewTransaction}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.newTxBtnText}>New Transaction</Text>
          </View>
        </TouchableOpacity>

        {/* Print & Send Buttons Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => setCurrentScreen('print_preview')}
          >
            <Icon name="print" size={14} color={ElviraTheme.primary} style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Print</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleSend}>
            <Icon name="share" size={14} color={ElviraTheme.primary} style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* Promotional coffee card illustration banner */}
        <View style={styles.promoCard}>
          <View style={styles.coffeeCupMock}>
            <Text style={{ fontSize: 42 }}>☕</Text>
          </View>
          <Text style={styles.promoText}>"A perfect brew for a perfect day."</Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        currentScreen="register_pos"
        setCurrentScreen={setCurrentScreen}
        isDarkMode={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ElviraTheme.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
    borderBottomWidth: 1,
    borderColor: ElviraTheme.border,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  headerCheckIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  content: {
    padding: 20,
    paddingBottom: 90,
    gap: 14,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  successHeader: {
    alignItems: 'center',
    marginVertical: 6,
  },
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C221F',
    marginBottom: 2,
  },
  successSub: {
    fontSize: 12,
    color: ElviraTheme.textMuted,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    padding: 16,
    gap: 10,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadataLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: ElviraTheme.textMuted,
    letterSpacing: 0.5,
  },
  metadataValue: {
    fontSize: 12,
    color: '#1C221F',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F4F6F5',
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  itemQty: {
    fontSize: 10,
    color: ElviraTheme.textMuted,
    marginTop: 1,
  },
  itemSubtotal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C221F',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 11,
    color: ElviraTheme.textMuted,
  },
  breakdownValue: {
    fontSize: 11,
    color: '#1C221F',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: '#F4F6F5',
    paddingTop: 8,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2E6F40',
  },
  newTxBtn: {
    backgroundColor: ElviraTheme.primary,
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newTxBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#1C221F',
    fontSize: 13,
    fontWeight: 'bold',
  },
  promoCard: {
    backgroundColor: '#BDD2C4',
    borderRadius: 16,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#A8C0B0',
  },
  coffeeCupMock: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8EFE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoText: {
    color: '#3A5340',
    fontSize: 13,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },

});
