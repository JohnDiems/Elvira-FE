import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Modal } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { apiService } from '@/components/API/BaseAPIService';
import { Icon } from '@/components/ui/Icon';

interface ManageCategoriesScreenProps {
  setCurrentScreen: (screen: any) => void;
  isDarkMode: boolean;
  alertService: any;
}

export function ManageCategoriesScreen({
  setCurrentScreen,
  isDarkMode,
  alertService,
}: ManageCategoriesScreenProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states for creating
  const [newCatName, setNewCatName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Form states for editing
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const styles = getStyles(isDarkMode);

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.request('/categories', 'GET');
      setCategories(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      alertService.error('Validation Error', 'Category name cannot be empty.');
      return;
    }
    setCreateLoading(true);
    try {
      const res = await apiService.request('/categories', 'POST', {
        name: newCatName.trim(),
      });
      setCategories([...categories, res]);
      setNewCatName('');
      alertService.toast('Category created successfully!');
    } catch (err: any) {
      alertService.error('Create Failed', err.message || 'Failed to create category.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCatName.trim()) {
      alertService.error('Validation Error', 'Category name cannot be empty.');
      return;
    }
    setEditLoading(true);
    try {
      const res = await apiService.request(`/categories/${editingCategory.id}`, 'PUT', {
        name: editCatName.trim(),
      });
      setCategories(categories.map((c) => (c.id === editingCategory.id ? res : c)));
      setEditingCategory(null);
      setEditCatName('');
      alertService.toast('Category renamed successfully!');
    } catch (err: any) {
      alertService.error('Update Failed', err.message || 'Failed to update category.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    alertService.confirm(
      'Delete Category',
      `Are you sure you want to delete the category "${name}"?`,
      async () => {
        try {
          await apiService.request(`/categories/${id}`, 'DELETE');
          setCategories(categories.filter((c) => c.id !== id));
          alertService.toast('Category deleted successfully!');
        } catch (err: any) {
          alertService.error('Cannot Delete', err.message || 'Failed to delete category.');
        }
      }
    );
  };

  const handleStartEdit = (category: any) => {
    setEditingCategory(category);
    setEditCatName(category.name);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('catalog')}>
          <Icon name="back" size={16} color={isDarkMode ? '#F5F5F5' : '#1C221F'} style={{ marginRight: 6 }} />
          <Text style={styles.backText}>Categories</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Categories</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Create Category Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ADD NEW CATEGORY</Text>
          <View style={styles.addFormRow}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Pastries, Tea, etc."
              placeholderTextColor={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted}
              value={newCatName}
              onChangeText={setNewCatName}
            />
            <TouchableOpacity 
              style={styles.addBtn} 
              onPress={handleCreateCategory}
              disabled={createLoading}
            >
              {createLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.addBtnText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Listing */}
        <Text style={styles.groupHeader}>ALL CATEGORIES ({categories.length})</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={ElviraTheme.primary} style={{ marginTop: 20 }} />
        ) : categories.length === 0 ? (
          <Text style={styles.emptyText}>No categories found.</Text>
        ) : (
          <View style={styles.card}>
            {categories.map((cat, idx) => (
              <View 
                key={cat.id} 
                style={[
                  styles.categoryListItem,
                  idx < categories.length - 1 ? styles.itemBorder : null
                ]}
              >
                <Text style={styles.categoryNameText}>{cat.name}</Text>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionIconBtn} onPress={() => handleStartEdit(cat)}>
                    <Icon name="edit" size={14} color={ElviraTheme.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionIconBtn} onPress={() => handleDeleteCategory(cat.id, cat.name)}>
                    <Icon name="trash" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit Category Modal */}
      <Modal visible={editingCategory !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Category Name</Text>
              <TouchableOpacity onPress={() => setEditingCategory(null)}>
                <Icon name="close" size={20} color={isDarkMode ? '#F5F5F5' : '#1C221F'} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CATEGORY NAME</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={editCatName}
                  onChangeText={setEditCatName}
                  placeholder="Category Name"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.modalSaveBtn} 
              onPress={handleUpdateCategory}
              disabled={editLoading}
            >
              {editLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSaveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : ElviraTheme.bgDark,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
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
  addFormRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: isDark ? '#2D2D2D' : '#F7F9F8',
    borderWidth: 1,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 16,
    fontSize: 13,
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  addBtn: {
    backgroundColor: ElviraTheme.primary,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
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
  categoryListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderColor: isDark ? '#2D2D2D' : '#F4F6F5',
  },
  categoryNameText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIconBtn: {
    padding: 6,
  },
  emptyText: {
    fontSize: 12,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    textAlign: 'center',
    marginTop: 20,
  },
  // Modal styles
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
  modalTextInput: {
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
});
