import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0E110F' }}>
      <StatusBar style="light" />
      {Platform.OS === 'web' && (
        <style>{`
          select {
            border: none !important;
            outline: none !important;
            cursor: pointer !important;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
        `}</style>
      )}
      <Slot />
    </View>
  );
}
