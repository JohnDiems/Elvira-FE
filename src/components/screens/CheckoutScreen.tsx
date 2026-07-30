import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CheckoutScreenProps {
  setCurrentScreen: (screen: any) => void;
  cart: Array<{ product: any; quantity: number }>;
  customerName: string;
  setCustomerName: (name: string) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  addToCart: (product: any) => void;
  removeFromCart: (product: any) => void;
}

export function CheckoutScreen({
  setCurrentScreen,
  cart,
  customerName,
  setCustomerName,
  tableNumber,
  setTableNumber,
  addToCart,
  removeFromCart,
}: CheckoutScreenProps) {
  const insets = useSafeAreaInsets();
  const [error, setError] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.selling_price * item.quantity, 0);
  const taxRate = 0.11; // 11% PPN
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleProcessCheckout = () => {
    if (!customerName) {
      setError('Please enter a customer name.');
      return;
    }
    setError('');
    setCurrentScreen('payment');
  };

  const formatPrice = (price: number) => {
    return 'Php' + Number(price).toLocaleString('en-US', { minimumFractionDigits: 3 });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('register_pos')}>
          <Icon name="back" size={16} color="#1C221F" style={{ marginRight: 6 }} />
          <Text style={styles.backText}>Check Out</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={{ fontSize: 16 }}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Customer Information Cards */}
        <View style={styles.infoCardGroup}>
          <View style={styles.infoRowCard}>
            <View style={styles.infoRowLeft}>
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 13 }}>📍</Text>
              </View>
              <View>
                <Text style={styles.infoRowLabel}>Table / Place</Text>
                <TextInput
                  style={styles.infoRowTextInput}
                  placeholder="e.g. Outdoor, 7"
                  placeholderTextColor={ElviraTheme.textMuted}
                  value={tableNumber}
                  onChangeText={setTableNumber}
                />
              </View>
            </View>
          </View>

          <View style={styles.infoRowCard}>
            <View style={styles.infoRowLeft}>
              <View style={styles.iconCircleGreen}>
                <Text style={{ fontSize: 13, color: ElviraTheme.primary }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoRowLabel}>Name Customer</Text>
                {isEditingName ? (
                  <TextInput
                    style={styles.infoRowTextInputActive}
                    placeholder="Enter name"
                    placeholderTextColor={ElviraTheme.textMuted}
                    value={customerName}
                    onChangeText={setCustomerName}
                    autoFocus
                    onBlur={() => setIsEditingName(false)}
                  />
                ) : (
                  <Text style={styles.infoRowValue}>{customerName || 'April Pellasco'}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity 
              style={styles.editInfoBtn}
              onPress={() => setIsEditingName(!isEditingName)}
            >
              <Text style={styles.editInfoBtnText}>{isEditingName ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu list section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Menu ElviraCafe</Text>
          
          <View style={styles.itemsList}>
            {cart.map((item) => (
              <View key={item.product.id} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <View style={styles.itemImageMini}>
                    <Text style={{ fontSize: 16 }}>☕</Text>
                  </View>
                  <View>
                    <Text style={styles.itemName}>{item.product.name}</Text>
                    <Text style={styles.itemPrice}>{formatPrice(item.product.selling_price)}</Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  {/* Quantity adjustments controls (Mockup design layout buttons) */}
                  <View style={styles.quantityControls}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.product)}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item.product)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemSub}>{formatPrice(item.product.selling_price * item.quantity)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bill calculations */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>PAYMENT DETAIL</Text>
          
          <View style={styles.breakdownList}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Subtotal</Text>
              <Text style={styles.breakdownValue}>{formatPrice(subtotal)}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>PPN 11%</Text>
              <Text style={styles.breakdownValue}>{formatPrice(taxAmount)}</Text>
            </View>

            <View style={[styles.breakdownRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom, height: 70 + insets.bottom }]}>
        <TouchableOpacity style={styles.processButton} onPress={handleProcessCheckout}>
          <Text style={styles.processButtonText}>Process CheckOut</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
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
  errorText: {
    color: ElviraTheme.red,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  infoCardGroup: {
    gap: 10,
  },
  infoRowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 0.8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ElviraTheme.border,
  },
  iconCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8EFE9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4E2D7',
  },
  infoRowLabel: {
    fontSize: 10,
    color: ElviraTheme.textMuted,
    marginBottom: 2,
  },
  infoRowValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  infoRowTextInput: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1C221F',
    padding: 0,
    height: 20,
    width: 180,
  },
  infoRowTextInputActive: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1C221F',
    padding: 0,
    height: 20,
    borderBottomWidth: 1,
    borderColor: ElviraTheme.primary,
  },
  editInfoBtn: {
    backgroundColor: '#E8EFE9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: '#D4E2D7',
  },
  editInfoBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: ElviraTheme.primary,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1C221F',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F4F6F5',
    paddingBottom: 8,
  },
  itemsList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 0.45,
  },
  itemImageMini: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  itemPrice: {
    fontSize: 10,
    color: ElviraTheme.textMuted,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 0.55,
    justifyContent: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9F8',
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: ElviraTheme.border,
    padding: 2,
    gap: 4,
  },
  qtyBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8EFE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 12,
    color: ElviraTheme.primary,
    fontWeight: 'bold',
  },
  qtyValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C221F',
    width: 14,
    textAlign: 'center',
  },
  itemSub: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C221F',
    minWidth: 70,
    textAlign: 'right',
  },
  breakdownList: {
    gap: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: ElviraTheme.textMuted,
  },
  breakdownValue: {
    fontSize: 12,
    color: '#1C221F',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: '#F4F6F5',
    paddingTop: 10,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E6F40', // Deep highlighted green for payment total
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: ElviraTheme.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  processButton: {
    backgroundColor: ElviraTheme.primary,
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  processButtonText: {
    color: ElviraTheme.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
