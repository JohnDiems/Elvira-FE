import { apiService } from '@/components/API/BaseAPIService';
import { storage } from '@/components/API/storage';
import { Icon } from '@/components/ui/Icon';
import { ElviraTheme } from '@/constants/theme';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';

interface LoginScreenProps {
  setCurrentScreen: (screen: any) => void;
  setCurrentUser: (user: any) => void;
  setStoreConfig: (config: any) => void;
  setTempAdminId: (id: any) => void;
}

export function LoginScreen({
  setCurrentScreen,
  setCurrentUser,
  setStoreConfig,
  setTempAdminId,
}: LoginScreenProps) {
  const [email, setEmail] = useState(''); // Pre-fill for easy demonstration
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.request('/login', 'POST', { email, password });

      if (response.otp_required) {
        // Redirection to OTP Screen
        setTempAdminId(response.user_id);

        // Output for easy local testing
        console.log(`[TESTING OTP]: Generated OTP code is: ${response.otp}`);
        Alert.alert('MOCK OTP', `OTP code sent to your registered mobile is: ${response.otp}`);

        setCurrentScreen('otp');
      } else {
        // Successful cashier login (MFA bypassed)
        await storage.setItem('_token', response.token);
        await storage.setItem('_user', JSON.stringify(response.user));

        setCurrentUser(response.user);
        if (response.user.store_config) {
          setStoreConfig(response.user.store_config);
        }

        setCurrentScreen('hub');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Top Header Row */}
        <View style={styles.headerRow}>
          <Text style={styles.brandTitle}>🌿 ElviraCafe</Text>
          <TouchableOpacity style={styles.langBtn}>
            <Text style={{ fontSize: 16 }}>🌐</Text>
          </TouchableOpacity>
        </View>

        {/* Cashier Counter Illustration Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('../../../assets/images/cafe_login_hero.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Welcome Text block */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.subText}>Manage your business easily and efficiently.</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Inputs */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputWrapper}>
            <Icon name="profile" size={16} color={ElviraTheme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor={ElviraTheme.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.passwordLabelRow}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            <Icon name="lock" size={16} color={ElviraTheme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={ElviraTheme.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Text style={{ fontSize: 14 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={ElviraTheme.white} />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.loginButtonText}>Log In</Text>
              <Text style={styles.loginButtonArrow}>➔</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Signup redirection links */}
        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => Alert.alert('Info', 'Boutique Modern POS Info')}>
            <Text style={styles.linkTextSecondary}>Learn more about POS</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.secureText}>🔒 Secure Connection  •  v2.4.0</Text>
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
    maxWidth: 400,
    backgroundColor: ElviraTheme.bgCard,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C221F',
    letterSpacing: -0.3,
  },
  langBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8EFE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D4E2D7',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  welcomeSection: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C221F',
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: ElviraTheme.textMuted,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#1C221F',
    marginBottom: 6,
    fontWeight: '500',
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 11,
    color: ElviraTheme.textMuted,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 44,
    color: '#1C221F',
    fontSize: 13,
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: ElviraTheme.primary,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: ElviraTheme.white,
    fontSize: 15,
    fontWeight: '600',
  },
  loginButtonArrow: {
    color: ElviraTheme.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linksRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    marginBottom: 12,
  },
  linkText: {
    fontSize: 13,
    color: ElviraTheme.primary,
    fontWeight: 'bold',
  },
  linkTextSecondary: {
    fontSize: 12,
    color: ElviraTheme.textMuted,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: ElviraTheme.border,
    paddingTop: 16,
    marginTop: 12,
  },
  secureText: {
    fontSize: 10,
    color: ElviraTheme.textMuted,
  },
});
