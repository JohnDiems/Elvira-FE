import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { apiService } from '@/components/API/BaseAPIService';
import { Icon } from '@/components/ui/Icon';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

interface PriceHistoryScreenProps {
  setCurrentScreen: (screen: any) => void;
  selectedProduct: any;
  setSelectedProduct: (product: any) => void;
}

export function PriceHistoryScreen({
  setCurrentScreen,
  selectedProduct,
  setSelectedProduct,
}: PriceHistoryScreenProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [newPrice, setNewPrice] = useState(selectedProduct?.selling_price?.toString() || '');
  const [costPrice, setCostPrice] = useState(selectedProduct?.cost_price?.toString() || '');
  const [reason, setReason] = useState('Price Increase');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Dropdown modal state
  const [showPicker, setShowPicker] = useState(false);

  const reasonsList = [
    'Price Increase',
    'Seasonal Update',
    'Cost Adjustment',
    'Promo Campaign',
    'Correction'
  ];

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await apiService.request(`/products/${selectedProduct.id}/price-history`, 'GET');
      setHistory(res);
    } catch (err) {
      console.log('Error loading price history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      loadHistory();
    }
  }, [selectedProduct]);

  const handleUpdatePrice = async () => {
    const parsedPrice = parseFloat(newPrice);
    const parsedCost = parseFloat(costPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid selling price.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await apiService.request(`/products/${selectedProduct.id}`, 'PUT', {
        selling_price: parsedPrice,
        cost_price: isNaN(parsedCost) ? selectedProduct.cost_price : parsedCost,
        price_change_reason: reason,
      });

      setSelectedProduct(response.product);
      setNewPrice(response.product.selling_price.toString());
      setCostPrice(response.product.cost_price.toString());
      await loadHistory();
      alert('Price adjustment saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update pricing details.');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return 'Php' + Number(price).toLocaleString('en-US', { minimumFractionDigits: 3 });
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ElviraTheme.primary} />
        <Text style={styles.loadingText}>Loading price logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('edit_product')}>
          <Text style={{ fontSize: 16, color: '#1C221F', marginRight: 6 }}>➔</Text>
          <Text style={styles.backText}>Edit Price</Text>
        </TouchableOpacity>
        <View style={styles.profileCircle}>
          <Text style={{ fontSize: 16 }}>👤</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Product banner details (Mockup style) */}
        <View style={styles.productBannerCard}>
          <View style={styles.productLeft}>
            <View style={styles.productImageMini}>
              <Text style={{ fontSize: 24 }}>☕</Text>
            </View>
            <View>
              <Text style={styles.productName}>{selectedProduct.name}</Text>
              <View style={styles.signatureBadge}>
                <Text style={styles.signatureBadgeText}>Signature Coffee</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pricing inputs */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>PRICING DETAILS</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Selling Price</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="e.g. 45000"
                placeholderTextColor={ElviraTheme.textMuted}
                value={newPrice}
                onChangeText={setNewPrice}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cost Price</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="e.g. 18500"
                placeholderTextColor={ElviraTheme.textMuted}
                value={costPrice}
                onChangeText={setCostPrice}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reason for Price Adjustment</Text>
            <TouchableOpacity style={styles.selectWrapper} onPress={() => setShowPicker(true)}>
              <Text style={styles.selectValueText}>{reason}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleUpdatePrice}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={ElviraTheme.white} />
            ) : (
              <Text style={styles.saveButtonText}>💾 Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Price History Auditing Log */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Price History</Text>
            <Text style={styles.timeframeText}>Last 6 Months</Text>
          </View>
          
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No price logs recorded.</Text>
          ) : (
            <View style={styles.historyList}>
              {history.map((log) => {
                const isIncrease = log.new_price > log.old_price;
                const isInitial = log.reason === 'Initial Setup';
                
                return (
                  <View key={log.id} style={styles.historyItem}>
                    <View style={styles.historyLeft}>
                      <View style={[
                        styles.indicatorDot, 
                        isInitial ? { backgroundColor: '#6B7280' } : isIncrease ? { backgroundColor: '#10B981' } : { backgroundColor: '#EF4444' }
                      ]} />
                      <View>
                        <Text style={styles.historyReason}>{log.reason}</Text>
                        <Text style={styles.historyDate}>{formatDate(log.created_at)}</Text>
                      </View>
                    </View>
                    <View style={styles.historyPrices}>
                      <Text style={styles.historyNew}>{formatPrice(log.new_price)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Dropdown Modal Selector for Adjustment Reason */}
      <Modal visible={showPicker} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adjustment Reason</Text>
              <ScrollView style={styles.modalList}>
                {reasonsList.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.modalItem,
                      reason === item ? styles.modalItemActive : null
                    ]}
                    onPress={() => {
                      setReason(item);
                      setShowPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.modalItemText,
                      reason === item ? styles.modalItemTextActive : null
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowPicker(false)}>
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        currentScreen="catalog"
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
  loadingContainer: {
    flex: 1,
    backgroundColor: ElviraTheme.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: ElviraTheme.textMuted,
    fontSize: 14,
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
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ElviraTheme.border,
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
  productBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    padding: 16,
  },
  productLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productImageMini: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C221F',
    marginBottom: 2,
  },
  signatureBadge: {
    backgroundColor: '#E8EFE9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  signatureBadgeText: {
    fontSize: 9,
    color: ElviraTheme.primary,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  timeframeText: {
    fontSize: 10,
    color: ElviraTheme.textMuted,
    fontWeight: 'bold',
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    color: ElviraTheme.textMuted,
    fontWeight: 'bold',
  },
  inputWrapper: {
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  textInput: {
    color: '#1C221F',
    fontSize: 13,
    height: '100%',
  },
  selectWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    height: 40,
    paddingHorizontal: 12,
  },
  selectValueText: {
    fontSize: 13,
    color: '#1C221F',
  },
  dropdownArrow: {
    fontSize: 10,
    color: ElviraTheme.textMuted,
  },
  saveButton: {
    backgroundColor: ElviraTheme.primary,
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  saveButtonText: {
    color: ElviraTheme.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 12,
    color: ElviraTheme.textMuted,
    textAlign: 'center',
    paddingVertical: 10,
  },
  historyList: {
    gap: 10,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#F4F6F5',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  historyReason: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C221F',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 9,
    color: ElviraTheme.textMuted,
  },
  historyPrices: {
    alignItems: 'flex-end',
  },
  historyNew: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C221F',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalList: {
    maxHeight: 200,
  },
  modalItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modalItemActive: {
    backgroundColor: '#E8EFE9',
  },
  modalItemText: {
    fontSize: 13,
    color: '#1C221F',
  },
  modalItemTextActive: {
    color: ElviraTheme.primary,
    fontWeight: 'bold',
  },
  modalCloseBtn: {
    backgroundColor: '#F4F6F5',
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C221F',
  },

});
