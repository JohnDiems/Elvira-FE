import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { apiService } from '@/components/API/BaseAPIService';
import { storage } from '@/components/API/storage';
import { Icon } from '@/components/ui/Icon';

interface RegisterScreenProps {
  setCurrentScreen: (screen: any) => void;
  setCurrentUser: (user: any) => void;
  setStoreConfig: (config: any) => void;
}

export function RegisterScreen({
  setCurrentScreen,
  setCurrentUser,
  setStoreConfig,
}: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'cashier'>('cashier');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.request('/register', 'POST', {
        name,
        email,
        password,
        role,
      });

      await storage.setItem('_token', response.token);
      await storage.setItem('_user', JSON.stringify(response.user));

      setCurrentUser(response.user);

      if (response.user.role === 'admin') {
        // Force store config setup for first time admin
        setStoreConfig(null);
        setCurrentScreen('store_setup');
      } else {
        // Cashiers go straight to the Hub
        setCurrentScreen('hub');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Top Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('login')}>
            <Text style={{ fontSize: 16, color: '#1C221F' }}>➔</Text>
          </TouchableOpacity>
          <Text style={styles.brandTitle}>🌿 Elvira Cafe</Text>
          <TouchableOpacity style={styles.langBtn}>
            <Text style={{ fontSize: 16 }}>🌐</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.joinText}>Join Elvira Cafe</Text>
        <Text style={styles.subText}>Create your staff or admin account to get started.</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Inputs */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Icon name="profile" size={16} color={ElviraTheme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={ElviraTheme.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Icon name="profile" size={16} color={ElviraTheme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="name@elviracafe.com"
              placeholderTextColor={ElviraTheme.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Icon name="lock" size={16} color={ElviraTheme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Min. 8 characters"
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>User Role</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleOption, role === 'cashier' ? styles.activeRole : null]}
              onPress={() => setRole('cashier')}
            >
              <Text style={[styles.roleText, role === 'cashier' ? styles.activeRoleText : null]}>
                Cashier (Staff)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleOption, role === 'admin' ? styles.activeRole : null]}
              onPress={() => setRole('admin')}
            >
              <Text style={[styles.roleText, role === 'admin' ? styles.activeRoleText : null]}>
                Admin (Owner)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Checkbox row */}
        <TouchableOpacity 
          style={styles.agreeRow} 
          onPress={() => setAgreeTerms(!agreeTerms)}
        >
          <View style={[styles.checkbox, agreeTerms ? styles.checkedCheckbox : null]}>
            {agreeTerms ? <Text style={styles.checkboxTick}>✓</Text> : null}
          </View>
          <Text style={styles.agreeText}>
            I agree to the Terms of Service and Privacy Policy
          </Text>
        </TouchableOpacity>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={ElviraTheme.white} />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.createButtonText}>Create Account</Text>
              <Text style={styles.createButtonArrow}>➔</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Redirect */}
        <TouchableOpacity onPress={() => setCurrentScreen('login')} style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Log in</Text>
          </Text>
        </TouchableOpacity>

        {/* Sign up Page footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>— BOUTIQUE MODERN POS —</Text>
          <Text style={styles.secureText}>🔒 Secure Email Authentication</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    transform: [{ rotate: '180deg' }], // points left
    padding: 4,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  langBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8EFE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C221F',
    textAlign: 'center',
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: ElviraTheme.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: ElviraTheme.red,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 8,
    padding: 8,
    fontSize: 12,
    marginBottom: 14,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#1C221F',
    marginBottom: 6,
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
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  roleOption: {
    flex: 1,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeRole: {
    backgroundColor: '#E8EFE9',
    borderColor: ElviraTheme.primary,
  },
  roleText: {
    fontSize: 12,
    color: ElviraTheme.textMuted,
    fontWeight: '500',
  },
  activeRoleText: {
    color: ElviraTheme.primary,
    fontWeight: '600',
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  checkedCheckbox: {
    backgroundColor: ElviraTheme.primary,
    borderColor: ElviraTheme.primary,
  },
  checkboxTick: {
    color: ElviraTheme.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  agreeText: {
    fontSize: 11,
    color: ElviraTheme.textMuted,
    flex: 1,
  },
  createButton: {
    backgroundColor: ElviraTheme.primary,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  createButtonText: {
    color: ElviraTheme.white,
    fontSize: 15,
    fontWeight: '600',
  },
  createButtonArrow: {
    color: ElviraTheme.white,
    fontSize: 16,
  },
  loginContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 13,
    color: ElviraTheme.textMuted,
  },
  loginLink: {
    color: ElviraTheme.primary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: ElviraTheme.border,
    paddingTop: 16,
    marginTop: 20,
  },
  footerTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: ElviraTheme.textMuted,
    marginBottom: 4,
    letterSpacing: 1,
  },
  secureText: {
    fontSize: 10,
    color: ElviraTheme.textMuted,
  },
});
