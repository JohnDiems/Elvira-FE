import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../ui/Icon';
import { ElviraTheme } from '@/constants/theme';

interface BottomNavigationProps {
  currentScreen: string;
  setCurrentScreen: (screen: any) => void;
  isDarkMode: boolean;
}

export function BottomNavigation({ currentScreen, setCurrentScreen, isDarkMode }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.navigationBar, 
      { 
        height: 56 + insets.bottom, 
        paddingBottom: insets.bottom,
        backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
        borderColor: isDarkMode ? '#2D2D2D' : ElviraTheme.border,
      }
    ]}>
      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('hub')}>
        <Icon name="home" size={20} color={currentScreen === 'hub' ? ElviraTheme.primary : (isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted)} />
        <Text style={[styles.navText, currentScreen === 'hub' && styles.activeNavText]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('register_pos')}>
        <Icon name="shop" size={20} color={currentScreen === 'register_pos' ? ElviraTheme.primary : (isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted)} />
        <Text style={[styles.navText, currentScreen === 'register_pos' && styles.activeNavText]}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('orders_list')}>
        <Icon name="catalog" size={20} color={currentScreen === 'orders_list' ? ElviraTheme.primary : (isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted)} />
        <Text style={[styles.navText, currentScreen === 'orders_list' && styles.activeNavText]}>Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('catalog')}>
        <Icon name="cafe" size={20} color={currentScreen === 'catalog' ? ElviraTheme.primary : (isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted)} />
        <Text style={[styles.navText, currentScreen === 'catalog' && styles.activeNavText]}>Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('settings')}>
        <Icon name="settings" size={20} color={currentScreen === 'settings' ? ElviraTheme.primary : (isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted)} />
        <Text style={[styles.navText, currentScreen === 'settings' && styles.activeNavText]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 100,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  navText: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 2,
  },
  activeNavText: {
    color: ElviraTheme.primary,
  },
});
