import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { apiService } from '@/components/API/BaseAPIService';
import { Icon } from '@/components/ui/Icon';

interface RegisterPosScreenProps {
  setCurrentScreen: (screen: any) => void;
  cart: Array<{ product: any; quantity: number }>;
  setCart: React.Dispatch<React.SetStateAction<Array<{ product: any; quantity: number }>>>;
  currentUser: any;
  isDarkMode: boolean;
  alertService: any;
}

export function RegisterPosScreen({
  setCurrentScreen,
  cart,
  setCart,
  currentUser,
  isDarkMode,
  alertService,
}: RegisterPosScreenProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null); // null = All
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const styles = getStyles(isDarkMode);

  const loadData = async () => {
    setLoading(true);
    try {
      const prodRes = await apiService.request('/products', 'GET');
      const catRes = await apiService.request('/categories', 'GET');
      setProducts(prodRes);
      setCategories(catRes);
      if (catRes.length > 0) {
        setSelectedCategory(catRes[0].id); // Default to first category (Coffee) like in mockup
      }
    } catch (err) {
      console.log('Error loading catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProductQuantity = (productId: number) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product: any) => {
    if (product.track_inventory && product.current_stock <= 0) {
      alertService.toast('Product is out of stock.', 'error');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.product.id === product.id);
      if (existing) {
        if (product.track_inventory && existing.quantity >= product.current_stock) {
          alertService.toast('Cannot add more. Limit of current stock reached.', 'error');
          return prevCart;
        }
        return prevCart.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prevCart.map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prevCart.filter((i) => i.product.id !== productId);
    });
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === null || p.category_id === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.product.selling_price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (price: number) => {
    return 'Php' + Number(price).toLocaleString('en-US', { minimumFractionDigits: 3 });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ElviraTheme.primary} />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header (mockup style) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentScreen('hub')}>
          <Icon name="back" size={16} color={isDarkMode ? '#F5F5F5' : '#1C221F'} style={{ marginRight: 6 }} />
          <Text style={styles.backText}>Register</Text>
        </TouchableOpacity>
        <View style={styles.cashierBadge}>
          <View style={styles.avatarMini}>
            <Text style={{ fontSize: 10 }}>👨‍🍳</Text>
          </View>
          <View>
            <Text style={styles.cashierName}>{currentUser?.name || 'Ivory'}</Text>
            <Text style={styles.roleLabel}>
              {currentUser?.role?.toLowerCase() === 'admin' ? 'Administrator' : 'Cashier'}
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Icon name="search" size={16} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Tabs */}
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
        </ScrollView>
      </View>

      {/* Grid Menu Products list */}
      <ScrollView contentContainerStyle={styles.menuGridList}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No menu items found.</Text>
          </View>
        ) : (
          filteredProducts.map((product) => {
            const qty = getProductQuantity(product.id);
            const isLowStock = product.track_inventory && product.current_stock <= product.low_stock_threshold;
            
            return (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.cardLeft}>
                  <View style={styles.productImage}>
                    <Text style={{ fontSize: 22 }}>☕</Text>
                    {isLowStock ? (
                      <View style={styles.lowStockBadge}>
                        <Text style={styles.lowStockText}>LOW STOCK</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>{formatPrice(product.selling_price)}</Text>
                  </View>
                </View>

                <View style={styles.actionContainer}>
                  {qty > 0 ? (
                    <View style={styles.quantityPill}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => handleRemoveFromCart(product.id)}>
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{qty}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => handleAddToCart(product)}>
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.cartAddBtn} onPress={() => handleAddToCart(product)}>
                      <Icon name="cart" size={14} color={ElviraTheme.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Checkout Drawer (Green Pill Style) */}
      {cart.length > 0 ? (
        <TouchableOpacity style={styles.checkoutPill} onPress={() => setCurrentScreen('checkout')}>
          <View style={styles.checkoutContent}>
            <Text style={styles.checkoutText}>Review Order ({cartItemsCount})</Text>
            <Text style={styles.checkoutTotal}>•  {formatPrice(cartTotal)}</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* Bottom Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('hub')}>
          <Icon name="home" size={20} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('register_pos')}>
          <Icon name="shop" size={20} color={ElviraTheme.primary} />
          <Text style={[styles.navText, styles.activeNavText]}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('orders_list')}>
          <Icon name="catalog" size={20} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('catalog')}>
          <Icon name="cafe" size={20} color={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted} />
          <Text style={styles.navText}>Menu</Text>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  cashierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: isDark ? '#2D2D2D' : '#F7F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
  },
  cashierName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  roleLabel: {
    fontSize: 8,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
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
  menuGridList: {
    padding: 20,
    paddingBottom: 130, // Extra padding for checkout pill
    gap: 12,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    fontSize: 13,
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
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: isDark ? '#2D2D2D' : '#F7F9F8',
    borderWidth: 1,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lowStockBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: ElviraTheme.red,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  lowStockText: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
    gap: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  productPrice: {
    fontSize: 11,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    fontWeight: '600',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  quantityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3A5340',
    borderRadius: 15,
    padding: 2,
    gap: 6,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(58, 83, 64, 0.3)' : '#E8EFE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 14,
    color: ElviraTheme.primary,
    fontWeight: 'bold',
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
    width: 14,
    textAlign: 'center',
  },
  cartAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? '#2D2D2D' : '#F7F9F8',
    borderWidth: 1,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutPill: {
    position: 'absolute',
    bottom: 68,
    left: 20,
    right: 20,
    height: 48,
    backgroundColor: ElviraTheme.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 560,
    width: '90%',
    alignSelf: 'center',
    shadowColor: 'rgba(58, 83, 64, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  checkoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkoutTotal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
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
});
