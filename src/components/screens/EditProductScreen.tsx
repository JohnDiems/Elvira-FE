import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { apiService } from '@/components/API/BaseAPIService';
import { Icon } from '@/components/ui/Icon';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

interface EditProductScreenProps {
  setCurrentScreen: (screen: any) => void;
  selectedProduct: any;
}

export function EditProductScreen({
  setCurrentScreen,
  selectedProduct,
}: EditProductScreenProps) {
  const isEditing = !!selectedProduct;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [trackInventory, setTrackInventory] = useState(true);
  const [currentStock, setCurrentStock] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [warnLowStock, setWarnLowStock] = useState(true);

  // Custom picker state
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await apiService.request('/categories', 'GET');
        setCategories(res);
        if (res.length > 0 && !isEditing) {
          setCategoryId(res[0].id.toString());
        }
      } catch (err) {
        console.log('Error loading categories:', err);
      }
    };

    loadCategories();

    if (isEditing) {
      setName(selectedProduct.name);
      setCategoryId(selectedProduct.category_id.toString());
      setSellingPrice(selectedProduct.selling_price.toString());
      setCostPrice(selectedProduct.cost_price.toString());
      setTrackInventory(selectedProduct.track_inventory);
      setCurrentStock(selectedProduct.current_stock.toString());
      setLowStockThreshold(selectedProduct.low_stock_threshold.toString());
    }
  }, [selectedProduct]);

  const handleSave = async () => {
    if (!name || !categoryId || !sellingPrice || !costPrice) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name,
        category_id: parseInt(categoryId),
        selling_price: parseFloat(sellingPrice),
        cost_price: parseFloat(costPrice),
        track_inventory: trackInventory,
        current_stock: trackInventory ? parseInt(currentStock) : 0,
        low_stock_threshold: trackInventory ? parseInt(lowStockThreshold) : 0,
        price_change_reason: 'Catalog Modification'
      };

      if (isEditing) {
        await apiService.request(`/products/${selectedProduct.id}`, 'PUT', payload);
      } else {
        await apiService.request('/products', 'POST', payload);
      }

      setCurrentScreen('catalog');
    } catch (err: any) {
      setError(err.message || 'Failed to save product details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm('Are you sure you want to delete this product? This action is irreversible.');
    if (!confirm) return;

    setLoading(true);
    setError('');

    try {
      await apiService.request(`/products/${selectedProduct.id}`, 'DELETE');
      setCurrentScreen('catalog');
    } catch (err: any) {
      setError(err.message || 'Failed to delete product.');
      setLoading(false);
    }
  };

  const selectedCategoryName = categories.find((cat) => cat.id.toString() === categoryId)?.name || 'Select Category';

  return (
    <View style={styles.container}>
      {/* Header (mockup style) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => setCurrentScreen('catalog')}>
          <Text style={{ fontSize: 16, color: '#1C221F' }}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Elvira Cafe</Text>
        <View style={styles.profileCircle}>
          <Text style={{ fontSize: 16 }}>👤</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Screen Title & Right Aligned Delete Action */}
        <View style={styles.titleRow}>
          <Text style={styles.mainTitle}>{isEditing ? 'Edit Product' : 'Add Product'}</Text>
          {isEditing ? (
            <TouchableOpacity onPress={handleDelete} disabled={loading}>
              <Text style={styles.deleteLinkText}>Delete Product</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Product Photo Square Card */}
        <View style={styles.photoContainerCard}>
          <View style={styles.photoBox}>
            <Text style={{ fontSize: 54 }}>☕</Text>
          </View>
          <TouchableOpacity style={styles.replacePhotoLink}>
            <Text style={styles.replacePhotoLinkText}>Replace Photo</Text>
          </TouchableOpacity>
          <Text style={styles.imageHint}>Recommended size: 800x800px. Max 2MB.</Text>
        </View>

        {/* Details Form Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Iced Pistachio Latte"
                placeholderTextColor={ElviraTheme.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity style={styles.selectWrapper} onPress={() => setShowPicker(true)}>
              <Text style={styles.selectValueText}>{selectedCategoryName}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Price (Php)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="e.g. 45000"
                  placeholderTextColor={ElviraTheme.textMuted}
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Cost Price</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="e.g. 12000"
                  placeholderTextColor={ElviraTheme.textMuted}
                  value={costPrice}
                  onChangeText={setCostPrice}
                />
              </View>
            </View>
          </View>

          {trackInventory ? (
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Current Stock</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={ElviraTheme.textMuted}
                    value={currentStock}
                    onChangeText={setCurrentStock}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Low Limit</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="10"
                    placeholderTextColor={ElviraTheme.textMuted}
                    value={lowStockThreshold}
                    onChangeText={setLowStockThreshold}
                  />
                </View>
              </View>
            </View>
          ) : null}
        </View>

        {/* Discard & Save Buttons Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.discardButton} 
            onPress={() => setCurrentScreen('catalog')}
            disabled={loading}
          >
            <Text style={styles.discardButtonText}>Discard</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={ElviraTheme.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Toggles below buttons */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Track inventory</Text>
              <Text style={styles.toggleDesc}>Manage and alert when stock counts drop</Text>
            </View>
            <Switch
              value={trackInventory}
              onValueChange={setTrackInventory}
              trackColor={{ false: '#E2E6E4', true: 'rgba(58, 83, 64, 0.4)' }}
              thumbColor={trackInventory ? ElviraTheme.primary : '#BDD2C4'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Warn when stock is low</Text>
              <Text style={styles.toggleDesc}>Send alerts if threshold is reached</Text>
            </View>
            <Switch
              value={warnLowStock}
              onValueChange={setWarnLowStock}
              trackColor={{ false: '#E2E6E4', true: 'rgba(58, 83, 64, 0.4)' }}
              thumbColor={warnLowStock ? ElviraTheme.primary : '#BDD2C4'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Category Dropdown Picker Modal Overlay */}
      <Modal visible={showPicker} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <ScrollView style={styles.modalList}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.modalItem,
                      categoryId === cat.id.toString() ? styles.modalItemActive : null
                    ]}
                    onPress={() => {
                      setCategoryId(cat.id.toString());
                      setShowPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.modalItemText,
                      categoryId === cat.id.toString() ? styles.modalItemTextActive : null
                    ]}>
                      {cat.name}
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
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  deleteLinkText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  photoContainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  photoBox: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replacePhotoLink: {
    backgroundColor: '#E8EFE9',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: '#D4E2D7',
  },
  replacePhotoLinkText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: ElviraTheme.primary,
  },
  imageHint: {
    fontSize: 9,
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
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  discardButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discardButtonText: {
    color: '#1C221F',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: ElviraTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: ElviraTheme.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C221F',
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 10,
    color: ElviraTheme.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: '#F4F6F5',
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
