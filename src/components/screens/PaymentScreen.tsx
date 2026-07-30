import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { apiService } from '@/components/API/BaseAPIService';
import { Icon } from '@/components/ui/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PaymentScreenProps {
  setCurrentScreen: (screen: any) => void;
  cart: Array<{ product: any; quantity: number }>;
  setCart: (cart: any) => void;
  customerName: string;
  tableNumber: string;
  setCurrentOrder: (order: any) => void;
}

export function PaymentScreen({
  setCurrentScreen,
  cart,
  setCart,
  customerName,
  tableNumber,
  setCurrentOrder,
}: PaymentScreenProps) {
  const insets = useSafeAreaInsets();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'e_wallet'>('cash');
  const [paymentProvider, setPaymentProvider] = useState<string | null>(null);
  const [amountReceived, setAmountReceived] = useState('50.000'); // Pre-fill with mockup value
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.product.selling_price * item.quantity, 0);
  const taxRate = 0.11; // 11% standard
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const cleanAmount = (val: string) => {
    // Parse values like 50.000 or 50000 safely
    const normalized = val.replace(/\./g, '');
    return parseFloat(normalized) || 0;
  };

  const numericAmountReceived = cleanAmount(amountReceived);
  const change = Math.max(0, numericAmountReceived - total);

  const handleConfirmPayment = async () => {
    if (paymentMethod === 'cash' && numericAmountReceived < total) {
      setError('Amount received is less than total due.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const itemsPayload = cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      const response = await apiService.request('/orders', 'POST', {
        customer_name: customerName,
        table_number: tableNumber,
        payment_method: paymentMethod,
        payment_provider: paymentProvider,
        amount_received: paymentMethod === 'cash' ? numericAmountReceived : total,
        items: itemsPayload,
      });

      setCurrentOrder(response.order);
      setCart([]); // Clear cart
      setCurrentScreen('success');
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return 'Php' + Number(price).toLocaleString('en-US', { minimumFractionDigits: 3 });
  };

  const isExactSelected = numericAmountReceived === total;
  const is40Selected = numericAmountReceived === 40000;
  const is50Selected = numericAmountReceived === 50000;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('checkout')}>
          <Icon name="back" size={16} color="#1C221F" style={{ marginRight: 6 }} />
          <Text style={styles.backText}>Payment</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.totalBox}>
          <Text style={styles.totalBoxLabel}>Total Amount Due</Text>
          <Text style={styles.totalBoxValue}>{formatPrice(total)}</Text>
        </View>

        {/* Section 1: Payment Method */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
          
          <TouchableOpacity 
            style={[styles.methodCard, paymentMethod === 'cash' ? styles.activeMethodCard : null]}
            onPress={() => { setPaymentMethod('cash'); setPaymentProvider(null); }}
          >
            <View style={styles.methodLeft}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>💵</Text>
              <Text style={styles.methodLabel}>Cash</Text>
            </View>
            {paymentMethod === 'cash' ? (
              <View style={styles.greenCheck}>
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>✓</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodCard, paymentMethod === 'credit_card' ? styles.activeMethodCard : null]}
            onPress={() => { setPaymentMethod('credit_card'); setPaymentProvider(null); }}
          >
            <View style={styles.methodLeft}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>💳</Text>
              <Text style={styles.methodLabel}>Credit Card</Text>
            </View>
            {paymentMethod === 'credit_card' ? (
              <View style={styles.greenCheck}>
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>✓</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodCard, paymentMethod === 'e_wallet' ? styles.activeMethodCard : null]}
            onPress={() => { setPaymentMethod('e_wallet'); setPaymentProvider('OVO'); }}
          >
            <View style={styles.methodLeft}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>📱</Text>
              <Text style={styles.methodLabel}>E-Wallet</Text>
            </View>
            {paymentMethod === 'e_wallet' ? (
              <View style={styles.greenCheck}>
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>✓</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          {/* E-Wallet Sub selectors */}
          {paymentMethod === 'e_wallet' ? (
            <View style={styles.walletProviders}>
              {['OVO', 'DANA', 'SHOPEE'].map((prov) => (
                <TouchableOpacity
                  key={prov}
                  style={[
                    styles.providerBadge,
                    paymentProvider === prov ? styles.activeProviderBadge : null
                  ]}
                  onPress={() => setPaymentProvider(prov)}
                >
                  <Text style={[
                    styles.providerText,
                    paymentProvider === prov ? styles.activeProviderText : null
                  ]}>
                    {prov}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        {/* Section 2: Cash Input Details (Only visible for Cash payments) */}
        {paymentMethod === 'cash' ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>AMOUNT RECEIVED</Text>
            
            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencySymbol}>Php</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="0.000"
                placeholderTextColor={ElviraTheme.textMuted}
                value={amountReceived}
                onChangeText={setAmountReceived}
              />
            </View>

            {/* Quick cash helper buttons (matching mockup values) */}
            <View style={styles.quickCashContainer}>
              <TouchableOpacity 
                style={[styles.quickCashBtn, isExactSelected ? styles.activeQuickCashBtn : null]} 
                onPress={() => setAmountReceived((total).toFixed(3))}
              >
                <Text style={[styles.quickCashText, isExactSelected ? styles.activeQuickCashText : null]}>Exact</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickCashBtn, is40Selected ? styles.activeQuickCashBtn : null]} 
                onPress={() => setAmountReceived('40.000')}
              >
                <Text style={[styles.quickCashText, is40Selected ? styles.activeQuickCashText : null]}>40.000</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.quickCashBtn, is50Selected ? styles.activeQuickCashBtn : null]} 
                onPress={() => setAmountReceived('50.000')}
              >
                <Text style={[styles.quickCashText, is50Selected ? styles.activeQuickCashText : null]}>50.000</Text>
              </TouchableOpacity>
            </View>

            {/* Change indicator */}
            <View style={styles.changeRow}>
              <Text style={styles.changeLabel}>CHANGE</Text>
              <Text style={styles.changeValue}>{formatPrice(change)}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Footer Confirm Payment Button */}
      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom, height: 72 + insets.bottom }]}>
        <View style={styles.footerContent}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTotalValue}>{formatPrice(total)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={handleConfirmPayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={ElviraTheme.white} />
            ) : (
              <View style={styles.confirmButtonContent}>
                <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                <Text style={styles.confirmButtonArrow}>➔</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
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
    display: 'none', // hide on layout to keep centered Title
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    gap: 16,
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
  totalBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  totalBoxLabel: {
    fontSize: 11,
    color: ElviraTheme.textMuted,
    marginBottom: 4,
  },
  totalBoxValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: ElviraTheme.textMuted,
    borderBottomWidth: 1,
    borderColor: '#F4F6F5',
    paddingBottom: 8,
    marginBottom: 4,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    padding: 14,
  },
  activeMethodCard: {
    borderColor: ElviraTheme.primary,
    backgroundColor: '#E8EFE9',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  greenCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3A5340',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletProviders: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  providerBadge: {
    flex: 1,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeProviderBadge: {
    backgroundColor: '#E8EFE9',
    borderColor: ElviraTheme.primary,
  },
  providerText: {
    fontSize: 9,
    color: ElviraTheme.textMuted,
    fontWeight: 'bold',
  },
  activeProviderText: {
    color: ElviraTheme.primary,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C221F',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    color: '#1C221F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickCashContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  quickCashBtn: {
    flex: 1,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeQuickCashBtn: {
    backgroundColor: ElviraTheme.primary,
    borderColor: ElviraTheme.primary,
  },
  quickCashText: {
    fontSize: 12,
    color: '#1C221F',
    fontWeight: 'bold',
  },
  activeQuickCashText: {
    color: ElviraTheme.white,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#F4F6F5',
    paddingTop: 12,
    marginTop: 4,
  },
  changeLabel: {
    fontSize: 12,
    color: ElviraTheme.textMuted,
    fontWeight: 'bold',
  },
  changeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E6F40', // Highlight change value in green
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
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  footerLeft: {
    gap: 2,
  },
  footerTotalLabel: {
    fontSize: 11,
    color: ElviraTheme.textMuted,
  },
  footerTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  confirmButton: {
    backgroundColor: ElviraTheme.primary,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confirmButtonText: {
    color: ElviraTheme.white,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonArrow: {
    color: ElviraTheme.white,
    fontSize: 15,
  },
});
