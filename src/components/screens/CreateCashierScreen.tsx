import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { apiService } from '@/components/API/BaseAPIService';
import { Icon } from '@/components/ui/Icon';

interface CreateCashierScreenProps {
  setCurrentScreen: (screen: any) => void;
  isDarkMode: boolean;
  alertService: any;
}

export function CreateCashierScreen({
  setCurrentScreen,
  isDarkMode,
  alertService,
}: CreateCashierScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'cashier' | 'admin'>('cashier');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Field validation error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const styles = getStyles(isDarkMode);

  const handleCreateAccount = async () => {
    let hasError = false;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setError('');

    // Field-level validations
    if (!name.trim()) {
      setNameError('Full name is required.');
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError('Email address is required.');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Password is required.');
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      hasError = true;
    }

    if (hasError) return;
    
    setLoading(true);
    try {
      await apiService.request('/register', 'POST', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: role,
      });

      alertService.success(
        'Account Created',
        `The ${role} account for ${name} has been successfully registered.`
      );
      
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setRole('cashier');
      
      // Return to Hub
      setCurrentScreen('hub');
    } catch (err: any) {
      setError(err.message || 'Failed to create user account.');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (nameError) setNameError('');
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (passwordError) setPasswordError('');
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setPasswordError('');
    setShowPassword(true);
    alertService.toast('Temporary password generated!', 'info');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('hub')}>
          <Icon name="back" size={16} color={isDarkMode ? '#F5F5F5' : '#1C221F'} style={{ marginRight: 6 }} />
          <Text style={styles.backText}>Hub</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Staff</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Register Staff Account</Text>
          <Text style={styles.subtitle}>Create a cashier or administrator account to grant access to the system.</Text>
          
          {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full Name <Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={[styles.inputWrapper, nameError ? styles.inputWrapperError : null]}>
              <TextInput
                style={styles.input}
                placeholder="e.g. John Doe"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted}
                value={name}
                onChangeText={handleNameChange}
              />
            </View>
            {nameError ? <Text style={styles.fieldErrorText}>{nameError}</Text> : null}
          </View>

          {/* Email Address Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email Address <Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={[styles.inputWrapper, emailError ? styles.inputWrapperError : null]}>
              <TextInput
                style={styles.input}
                placeholder="e.g. johndoe@elviracafe.com"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted}
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {emailError ? <Text style={styles.fieldErrorText}>{emailError}</Text> : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.label}>
                Password <Text style={styles.asterisk}>*</Text>
              </Text>
              <TouchableOpacity onPress={generateRandomPassword}>
                <Text style={styles.generateLink}>Generate</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputWrapper, passwordError ? styles.inputWrapperError : null]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Minimum 8 characters"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : ElviraTheme.textMuted}
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <Text style={{ fontSize: 14 }}>{showPassword ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.fieldErrorText}>{passwordError}</Text> : null}
          </View>

          {/* Role selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Access Level Role</Text>
            <View style={styles.roleOptions}>
              <TouchableOpacity 
                style={[styles.roleOption, role === 'cashier' ? styles.roleActive : null]}
                onPress={() => setRole('cashier')}
              >
                <Text style={[styles.roleOptionText, role === 'cashier' ? styles.roleActiveText : null]}>
                  👨‍🍳 Cashier
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.roleOption, role === 'admin' ? styles.roleActive : null]}
                onPress={() => setRole('admin')}
              >
                <Text style={[styles.roleOptionText, role === 'admin' ? styles.roleActiveText : null]}>
                  🔑 Administrator
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action button */}
          <TouchableOpacity 
            style={[styles.submitBtn, loading ? styles.submitBtnDisabled : null]}
            onPress={handleCreateAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#F4F6F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDark ? '#2D2D2D' : ElviraTheme.border,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? '#F5F5F5' : '#1C221F',
  },
  subtitle: {
    fontSize: 12,
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
    lineHeight: 18,
    marginBottom: 8,
  },
  errorText: {
    color: ElviraTheme.red,
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2',
    padding: 10,
    borderRadius: 8,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  asterisk: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#2A2A2A' : '#F7F9F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
    height: 42,
    paddingHorizontal: 12,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  input: {
    color: isDark ? '#F5F5F5' : '#1C221F',
    fontSize: 13,
    height: '100%',
    width: '100%',
  },
  eyeBtn: {
    padding: 6,
  },
  generateLink: {
    fontSize: 11,
    fontWeight: 'bold',
    color: ElviraTheme.primary,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#3D3D3D' : ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? '#2A2A2A' : '#F7F9F8',
  },
  roleActive: {
    backgroundColor: isDark ? 'rgba(58, 83, 64, 0.2)' : '#E8EFE9',
    borderColor: isDark ? '#3A5340' : '#D4E2D7',
  },
  roleOptionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: isDark ? '#9CA3AF' : ElviraTheme.textMuted,
  },
  roleActiveText: {
    color: ElviraTheme.primary,
  },
  submitBtn: {
    backgroundColor: ElviraTheme.primary,
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  fieldErrorText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
