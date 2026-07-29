import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Modal, Text, TouchableOpacity } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { storage } from '@/components/API/storage';

// Screens
import { LoginScreen } from '@/components/screens/LoginScreen';
import { OtpScreen } from '@/components/screens/OtpScreen';
import { RegisterScreen } from '@/components/screens/RegisterScreen';
import { StoreSetupScreen } from '@/components/screens/StoreSetupScreen';
import { HubScreen } from '@/components/screens/HubScreen';
import { RegisterPosScreen } from '@/components/screens/RegisterPosScreen';
import { CheckoutScreen } from '@/components/screens/CheckoutScreen';
import { PaymentScreen } from '@/components/screens/PaymentScreen';
import { SuccessScreen } from '@/components/screens/SuccessScreen';
import { PrintPreviewScreen } from '@/components/screens/PrintPreviewScreen';
import { DashboardScreen } from '@/components/screens/DashboardScreen';
import { CatalogScreen } from '@/components/screens/CatalogScreen';
import { EditProductScreen } from '@/components/screens/EditProductScreen';
import { PriceHistoryScreen } from '@/components/screens/PriceHistoryScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { OrdersListScreen } from '@/components/screens/OrdersListScreen';
import { ManageCategoriesScreen } from '@/components/screens/ManageCategoriesScreen';
import { CreateCashierScreen } from '@/components/screens/CreateCashierScreen';

type ScreenType =
  | 'login'
  | 'otp'
  | 'register'
  | 'store_setup'
  | 'hub'
  | 'register_pos'
  | 'checkout'
  | 'payment'
  | 'success'
  | 'print_preview'
  | 'dashboard'
  | 'catalog'
  | 'edit_product'
  | 'price_history'
  | 'settings'
  | 'orders_list'
  | 'manage_categories'
  | 'create_cashier';

export default function AppIndex() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [storeConfig, setStoreConfig] = useState<any>(null);
  const [activeShift, setActiveShift] = useState<any>(null);
  
  // Cart & Order State
  const [cart, setCart] = useState<Array<{ product: any; quantity: number }>>([]);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  
  // Product state
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // OTP state
  const [tempAdminId, setTempAdminId] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Custom Alert Modal State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'confirm';
    onOk?: () => void;
    onCancel?: () => void;
  } | null>(null);

  // Custom Toast State
  const [toastConfig, setToastConfig] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const alertService = {
    success: (title: string, message: string) => {
      setAlertConfig({ visible: true, title, message, type: 'success' });
    },
    error: (title: string, message: string) => {
      setAlertConfig({ visible: true, title, message, type: 'error' });
    },
    confirm: (title: string, message: string, onOk: () => void) => {
      setAlertConfig({
        visible: true,
        title,
        message,
        type: 'confirm',
        onOk: () => {
          setAlertConfig(null);
          onOk();
        },
        onCancel: () => setAlertConfig(null),
      });
    },
    toast: (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToastConfig({ visible: true, message, type });
      setTimeout(() => {
        setToastConfig((prev) => (prev?.message === message ? null : prev));
      }, 2500);
    },
  };

  // Check auto-login on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await storage.getItem('_token');
        const userStr = await storage.getItem('_user');
        const dark = await storage.getItem('_dark_mode');
        
        setIsDarkMode(dark === 'true');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          if (user.store_config) {
            setStoreConfig(user.store_config);
          }
          setCurrentScreen('hub');
        }
      } catch (err) {
        console.log('Error verifying session cache:', err);
      } finally {
        setInitializing(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await storage.removeItem('_token');
      await storage.removeItem('_user');
      setCurrentUser(null);
      setStoreConfig(null);
      setActiveShift(null);
      setCart([]);
      setCustomerName('');
      setTableNumber('');
      setCurrentOrder(null);
      setSelectedProduct(null);
      setTempAdminId(null);
      setCurrentScreen('login');
    } catch (err) {
      console.log('Error during logout:', err);
    }
  };

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ElviraTheme.primary} />
      </View>
    );
  }

  // Render screens conditionally based on state router
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            setCurrentScreen={setCurrentScreen}
            setCurrentUser={setCurrentUser}
            setStoreConfig={setStoreConfig}
            setTempAdminId={setTempAdminId}
          />
        );
      case 'otp':
        return (
          <OtpScreen
            setCurrentScreen={setCurrentScreen}
            setCurrentUser={setCurrentUser}
            setStoreConfig={setStoreConfig}
            tempAdminId={tempAdminId}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            setCurrentScreen={setCurrentScreen}
            setCurrentUser={setCurrentUser}
            setStoreConfig={setStoreConfig}
          />
        );
      case 'store_setup':
        return (
          <StoreSetupScreen
            setCurrentScreen={setCurrentScreen}
            setStoreConfig={setStoreConfig}
          />
        );
      case 'hub':
        return (
          <HubScreen
            setCurrentScreen={setCurrentScreen}
            currentUser={currentUser}
            setStoreConfig={setStoreConfig}
            onLogout={handleLogout}
            activeShift={activeShift}
            setActiveShift={setActiveShift}
            isDarkMode={isDarkMode}
          />
        );
      case 'register_pos':
        return (
          <RegisterPosScreen
            setCurrentScreen={setCurrentScreen}
            cart={cart}
            setCart={setCart}
            currentUser={currentUser}
            isDarkMode={isDarkMode}
            alertService={alertService}
          />
        );
      case 'checkout':
        return (
          <CheckoutScreen
            setCurrentScreen={setCurrentScreen}
            cart={cart}
            customerName={customerName}
            setCustomerName={setCustomerName}
            tableNumber={tableNumber}
            setTableNumber={setTableNumber}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            isDarkMode={isDarkMode}
            alertService={alertService}
          />
        );
      case 'payment':
        return (
          <PaymentScreen
            setCurrentScreen={setCurrentScreen}
            cart={cart}
            setCart={setCart}
            customerName={customerName}
            tableNumber={tableNumber}
            setCurrentOrder={setCurrentOrder}
            isDarkMode={isDarkMode}
          />
        );
      case 'success':
        return (
          <SuccessScreen
            setCurrentScreen={setCurrentScreen}
            currentOrder={currentOrder}
            setCustomerName={setCustomerName}
            setTableNumber={setTableNumber}
            isDarkMode={isDarkMode}
            alertService={alertService}
          />
        );
      case 'print_preview':
        return (
          <PrintPreviewScreen
            setCurrentScreen={setCurrentScreen}
            currentOrder={currentOrder}
            isDarkMode={isDarkMode}
          />
        );
      case 'dashboard':
        return (
          <DashboardScreen
            setCurrentScreen={setCurrentScreen}
            isDarkMode={isDarkMode}
            alertService={alertService}
          />
        );
      case 'catalog':
        return (
          <CatalogScreen
            setCurrentScreen={setCurrentScreen}
            setSelectedProduct={setSelectedProduct}
            currentUser={currentUser}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
          />
        );
      case 'edit_product':
        return (
          <EditProductScreen
            setCurrentScreen={setCurrentScreen}
            selectedProduct={selectedProduct}
            isDarkMode={isDarkMode}
          />
        );
      case 'price_history':
        return (
          <PriceHistoryScreen
            setCurrentScreen={setCurrentScreen}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            isDarkMode={isDarkMode}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            setCurrentScreen={setCurrentScreen}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            onLogout={handleLogout}
            activeShift={activeShift}
            setActiveShift={setActiveShift}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            alertService={alertService}
          />
        );
      case 'orders_list':
        return (
          <OrdersListScreen
            setCurrentScreen={setCurrentScreen}
            setCurrentOrder={setCurrentOrder}
            isDarkMode={isDarkMode}
          />
        );
      case 'manage_categories':
        return (
          <ManageCategoriesScreen
            setCurrentScreen={setCurrentScreen}
            isDarkMode={isDarkMode}
            alertService={alertService}
          />
        );
      case 'create_cashier':
        return (
          <CreateCashierScreen
            setCurrentScreen={setCurrentScreen}
            isDarkMode={isDarkMode}
            alertService={alertService}
          />
        );
      default:
        return (
          <LoginScreen
            setCurrentScreen={setCurrentScreen}
            setCurrentUser={setCurrentUser}
            setStoreConfig={setStoreConfig}
            setTempAdminId={setTempAdminId}
          />
        );
    }
  };

  return (
    <SafeAreaView style={[styles.safeContainer, isDarkMode ? { backgroundColor: '#121212' } : null]}>
      <View style={styles.appContainer}>{renderScreen()}</View>

      {/* Global SweetAlert-Style Modal */}
      {alertConfig?.visible && (
        <Modal transparent visible={alertConfig.visible} animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={[styles.alertCard, isDarkMode ? styles.alertCardDark : null]}>
              {/* Icon Circle */}
              <View style={[
                styles.alertIconCircle,
                alertConfig.type === 'success' ? styles.iconSuccess :
                alertConfig.type === 'error' ? styles.iconError : styles.iconConfirm
              ]}>
                <Text style={{ fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' }}>
                  {alertConfig.type === 'success' ? '✓' :
                   alertConfig.type === 'error' ? '✕' : '?'}
                </Text>
              </View>

              <Text style={[styles.alertTitle, isDarkMode ? { color: '#F5F5F5' } : null]}>{alertConfig.title}</Text>
              <Text style={[styles.alertMessage, isDarkMode ? { color: '#9CA3AF' } : null]}>{alertConfig.message}</Text>

              <View style={styles.alertActions}>
                {alertConfig.type === 'confirm' && (
                  <TouchableOpacity 
                    style={[styles.alertBtn, styles.btnCancel, isDarkMode ? styles.btnCancelDark : null]} 
                    onPress={alertConfig.onCancel}
                  >
                    <Text style={[styles.btnCancelText, isDarkMode ? { color: '#9CA3AF' } : null]}>Cancel</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.alertBtn, styles.btnOk]} 
                  onPress={alertConfig.onOk ? alertConfig.onOk : () => setAlertConfig(null)}
                >
                  <Text style={styles.btnOkText}>
                    {alertConfig.type === 'confirm' ? 'Confirm' : 'OK'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Global Toast Pill Notification */}
      {toastConfig?.visible && (
        <View style={[
          styles.toastContainer,
          toastConfig.type === 'error' ? styles.toastError :
          toastConfig.type === 'info' ? styles.toastInfo : styles.toastSuccess
        ]}>
          <Text style={styles.toastText}>
            {toastConfig.type === 'success' ? '💚  ' :
             toastConfig.type === 'error' ? '❤️  ' : '💙  '}
            {toastConfig.message}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: ElviraTheme.bgDark,
  },
  appContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: ElviraTheme.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 320,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  alertCardDark: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  alertIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconSuccess: {
    backgroundColor: '#10B981',
  },
  iconError: {
    backgroundColor: '#EF4444',
  },
  iconConfirm: {
    backgroundColor: '#F59E0B',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1C221F',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 12,
    color: '#727E78',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnOk: {
    backgroundColor: '#3A5340',
  },
  btnOkText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  btnCancel: {
    backgroundColor: '#F4F6F5',
    borderWidth: 1,
    borderColor: '#E2E6E4',
  },
  btnCancelDark: {
    backgroundColor: '#2A2A2A',
    borderColor: '#3D3D3D',
  },
  btnCancelText: {
    color: '#1C221F',
    fontWeight: 'bold',
    fontSize: 13,
  },
  toastContainer: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 9999,
  },
  toastSuccess: {
    backgroundColor: 'rgba(58, 83, 64, 0.95)',
  },
  toastError: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
  },
  toastInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.95)',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
