import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { apiService } from '@/components/API/BaseAPIService';
import { storage } from '@/components/API/storage';

interface OtpScreenProps {
  setCurrentScreen: (screen: any) => void;
  setCurrentUser: (user: any) => void;
  setStoreConfig: (config: any) => void;
  tempAdminId: any;
}

export function OtpScreen({
  setCurrentScreen,
  setCurrentUser,
  setStoreConfig,
  tempAdminId,
}: OtpScreenProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.request('/login/otp', 'POST', {
        user_id: tempAdminId,
        otp,
      });

      await storage.setItem('_token', response.token);
      await storage.setItem('_user', JSON.stringify(response.user));

      setCurrentUser(response.user);
      if (response.user.store_config) {
        setStoreConfig(response.user.store_config);
        setCurrentScreen('hub');
      } else {
        // First-time admin login: configure store configuration setup
        setCurrentScreen('store_setup');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('login')}>
          <Text style={{ fontSize: 13, color: '#1C221F', marginRight: 4 }}>➔</Text>
          <Text style={styles.backText}>Back to login</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.securityTitle}>🔒 Two-Factor Security</Text>
          <Text style={styles.subText}>
            Enter the 6-digit One-Time Password (OTP) sent to your registered device.
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* OTP Input box */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>OTP Verification Code</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="000000"
            placeholderTextColor={ElviraTheme.textMuted}
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>

        {/* Action button */}
        <TouchableOpacity 
          style={styles.verifyButton} 
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={ElviraTheme.white} />
          ) : (
            <Text style={styles.verifyButtonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        {/* Notice Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Admin privileges require MFA verification to protect financial reporting, user logs, and product price catalogs.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ElviraTheme.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    padding: 24,
    shadowColor: 'rgba(28, 34, 33, 0.1)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
    transform: [{ rotate: '180deg' }], // points left
  },
  backText: {
    fontSize: 12,
    color: '#1C221F',
    fontWeight: 'bold',
    transform: [{ rotate: '180deg' }], // keep text straight after rotation
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C221F',
    marginBottom: 6,
    textAlign: 'center',
  },
  subText: {
    fontSize: 11,
    color: ElviraTheme.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
  errorText: {
    color: ElviraTheme.red,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  inputContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 12,
    color: '#1C221F',
    marginBottom: 10,
    fontWeight: '500',
  },
  otpInput: {
    width: '80%',
    height: 48,
    backgroundColor: '#F7F9F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    color: '#1C221F',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
  },
  verifyButton: {
    backgroundColor: ElviraTheme.primary,
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#F7F9F8',
    borderWidth: 0.5,
    borderColor: ElviraTheme.border,
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  infoText: {
    fontSize: 10,
    color: ElviraTheme.textMuted,
    lineHeight: 14,
  },
});
