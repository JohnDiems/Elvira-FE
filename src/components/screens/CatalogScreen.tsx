import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { apiService } from '@/components/API/BaseAPIService';
import { Icon } from '@/components/ui/Icon';

interface CatalogScreenProps {
  setCurrentScreen: (screen: any) => void;
  setSelectedProduct: (product: any) => void;
  currentUser: any;
  onLogout: () => void;
  isDarkMode: boolean;
}

export function CatalogScreen({
  setCurrentScreen,
  setSelectedProduct,
  currentUser,
  onLogout,
  isDarkMode,
}: CatalogScreenProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Drawer sidebar state
  const [showDrawer, setShowDrawer] = useState(false);

  const styles = getStyles(isDarkMode);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const catRes = await apiService.request('/categories', 'GET');
      setCategories(catRes);

      const prodRes = await apiService.request('/products', 'GET');
      setProducts(prodRes);
    } catch (err) {
      console.log('Error loading catalog details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[DEBUG] CatalogScreen mounted. currentUser:', currentUser);
    loadCatalog();
  }, []);

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setCurrentScreen('edit_product');
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setCurrentScreen('edit_product');
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === null || p.category_id === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const formatPrice = (price: number) => {
    return 'Php' + Number(price).toLocaleString('en-US', { minimumFractionDigits: 3 });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ElviraTheme.primary} />
        <Text style={styles.loadingText}>Loading catalog...</Text>
      </View>
    );
  }

  // Group products by category name for cleaner layout
  const groupedProducts: { [key: string]: any[] } = {};
  filteredProducts.forEach((prod) => {
    const catName = prod.category?.name || 'Uncategorized';
    if (!groupedProducts[catName]) {
      groupedProducts[catName] = [];
    }
    groupedProducts[catName].push(prod);
  });

  return (
    <View style={styles.container}>
      {/* Header (mockup style) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setShowDrawer(true)}>
          <Icon name="menu" size={20} color={isDarkMode ? '#F5F5F5' : '#1C221F'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Elvira Cafe</Text>
        <View style={styles.profileCircle}>
          <Icon name="profile" size={16} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Icon name="search" size={16} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            placeholderTextColor={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filter Tabs */}
      <View style={{ height: 44, marginVertical: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedCategory === null ? styles.activeTab : null]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.tabText, selectedCategory === null ? styles.activeTabText : null]}>
              All Items
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.tab, selectedCategory === cat.id ? styles.activeTab : null]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.tabText, selectedCategory === cat.id ? styles.activeTabText : null]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Admin category management trigger tab */}
          {currentUser?.role?.toLowerCase() === 'admin' ? (
            <TouchableOpacity
              style={[
                styles.tab, 
                { 
                  borderColor: ElviraTheme.primary, 
                  backgroundColor: isDarkMode ? 'rgba(58, 83, 64, 0.15)' : 'rgba(58, 83, 64, 0.05)' 
                }
              ]}
              onPress={() => setCurrentScreen('manage_categories')}
            >
              <Text style={[styles.tabText, { color: ElviraTheme.primary }]}>
                ⚙️ Manage
              </Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </View>

      {/* Products listing grouped by Category name */}
      <ScrollView contentContainerStyle={styles.catalogList}>
        {Object.keys(groupedProducts).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No catalog items found.</Text>
          </View>
        ) : (
          Object.keys(groupedProducts).map((catName) => (
            <View key={catName} style={styles.categorySection}>
              <Text style={styles.categorySectionHeader}>{catName}</Text>
              <View style={styles.categoryItemsGrid}>
                {groupedProducts[catName].map((product) => (
                  <View key={product.id} style={styles.productCard}>
                    <View style={styles.productLeft}>
                      <View style={styles.productThumb}>
                        <Text style={{ fontSize: 18 }}>☕</Text>
                      </View>
                      <View>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productPrice}>{formatPrice(product.selling_price)}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.editBtn} 
                      onPress={() => handleEditProduct(product)}
                    >
                      <Icon name="edit" size={14} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) (Circular Green Button on Bottom Right) */}
      <TouchableOpacity style={styles.fabBtn} onPress={handleAddProduct}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

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
          <Icon name="cafe" size={20} color={ElviraTheme.primary} />
          <Text style={[styles.navText, styles.activeNavText]}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('settings')}>
          <Icon name="settings" size={20} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
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
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    height: 42,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: isDark ? '#F5F5F5' : '#1C221F',
    fontSize: 13,
    height: '100%',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  tab: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: isDark ? 'rgba(58, 83, 64, 0.2)' : '#E8EFE9',
    borderColor: isDark ? '#3A5340' : '#D4E2D7',
  },
  tabText: {
    fontSize: 11,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: ElviraTheme.primary,
  },
  catalogList: {
    padding: 20,
    paddingBottom: 90,
    gap: 16,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  categorySection: {
    gap: 10,
  },
  categorySectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
    paddingLeft: 4,
  },
  categoryItemsGrid: {
    gap: 8,
  },
  productCard: {
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productThumb: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: isDark ? '#2D2D2D' : '#F7F9F8',
    borderWidth: 1,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 11,
    color: ElviraTheme.primary,
    fontWeight: 'bold',
  },
  editBtn: {
    padding: 6,
  },
  fabBtn: {
    position: 'absolute',
    bottom: 76,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ElviraTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ElviraTheme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    fontSize: 13,
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
