import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { apiService } from '@/components/API/BaseAPIService';

interface StoreSetupScreenProps {
  setCurrentScreen: (screen: any) => void;
  setStoreConfig: (config: any) => void;
}

export function StoreSetupScreen({
  setCurrentScreen,
  setStoreConfig,
}: StoreSetupScreenProps) {
  const [businessType, setBusinessType] = useState<'cafe' | 'retail' | 'restaurant'>('cafe');
  const [locationsCount, setLocationsCount] = useState<'1' | '2-5' | '6-10' | '10+'>('1');
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiService.request('/store-setup', 'POST', {
        business_type: businessType,
        locations_count: locationsCount,
        is_migrating: isMigrating,
      });

      setStoreConfig(response.config);
      setCurrentScreen('hub');
    } catch (err: any) {
      setError(err.message || 'Failed to save store configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Build your Account</Text>
          <Text style={styles.subText}>
            Help us tailor POS to your specific business needs. It only takes a minute.
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Section 1: Business Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WHAT TYPE OF BUSINESS DO YOU RUN?</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity 
              style={[styles.optionCard, businessType === 'cafe' ? styles.activeOptionCard : null]}
              onPress={() => setBusinessType('cafe')}
            >
              <Text style={styles.optionEmoji}>☕</Text>
              <Text style={[styles.optionLabel, businessType === 'cafe' ? styles.activeOptionLabel : null]}>
                Cafe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionCard, businessType === 'retail' ? styles.activeOptionCard : null]}
              onPress={() => setBusinessType('retail')}
            >
              <Text style={styles.optionEmoji}>🛍️</Text>
              <Text style={[styles.optionLabel, businessType === 'retail' ? styles.activeOptionLabel : null]}>
                Retail
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionCard, businessType === 'restaurant' ? styles.activeOptionCard : null]}
              onPress={() => setBusinessType('restaurant')}
            >
              <Text style={styles.optionEmoji}>🍽️</Text>
              <Text style={[styles.optionLabel, businessType === 'restaurant' ? styles.activeOptionLabel : null]}>
                Restaurant
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Locations Count */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HOW MANY LOCATIONS DO YOU HAVE?</Text>
          <View style={styles.pillRow}>
            {['1', '2-5', '6-10', '10+'].map((count: any) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.pillOption, 
                  locationsCount === count ? styles.activePillOption : null
                ]}
                onPress={() => setLocationsCount(count)}
              >
                <Text style={[
                  styles.pillText,
                  locationsCount === count ? styles.activePillText : null
                ]}>
                  {count === '1' ? 'Just one' : count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section 3: Migrating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ARE YOU MIGRATING FROM ANOTHER POS?</Text>
          <View style={styles.verticalRow}>
            <TouchableOpacity 
              style={[styles.verticalCard, isMigrating === true ? styles.activeVerticalCard : null]}
              onPress={() => setIsMigrating(true)}
            >
              <View style={[styles.radio, isMigrating === true ? styles.activeRadio : null]}>
                {isMigrating === true ? <View style={styles.radioDot} /> : null}
              </View>
              <View style={styles.verticalCardTexts}>
                <Text style={styles.verticalCardTitle}>Yes, I'm switching systems</Text>
                <Text style={styles.verticalCardSub}>We'll help you import your existing catalog</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.verticalCard, isMigrating === false ? styles.activeVerticalCard : null]}
              onPress={() => setIsMigrating(false)}
            >
              <View style={[styles.radio, isMigrating === false ? styles.activeRadio : null]}>
                {isMigrating === false ? <View style={styles.radioDot} /> : null}
              </View>
              <View style={styles.verticalCardTexts}>
                <Text style={styles.verticalCardTitle}>No, this is my first POS</Text>
                <Text style={styles.verticalCardSub}>We'll guide you through your first setup</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={ElviraTheme.white} />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.saveButtonText}>Set Up My Store</Text>
              <Text style={styles.saveButtonArrow}>➔</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCurrentScreen('hub')} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: ElviraTheme.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 32,
  },
  card: {
    width: '100%',
    maxWidth: 480,
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C221F',
    marginBottom: 6,
  },
  subText: {
    fontSize: 12,
    color: ElviraTheme.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  errorText: {
    color: ElviraTheme.red,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    marginBottom: 20,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: ElviraTheme.textMuted,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: ElviraTheme.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeOptionCard: {
    backgroundColor: '#E8EFE9',
    borderColor: ElviraTheme.primary,
  },
  optionEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  optionLabel: {
    fontSize: 12,
    color: ElviraTheme.textMuted,
    fontWeight: '600',
  },
  activeOptionLabel: {
    color: ElviraTheme.primary,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillOption: {
    flex: 1,
    minWidth: 80,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePillOption: {
    backgroundColor: ElviraTheme.primary,
    borderColor: ElviraTheme.primary,
  },
  pillText: {
    fontSize: 11,
    color: ElviraTheme.textMuted,
    fontWeight: '600',
  },
  activePillText: {
    color: ElviraTheme.white,
  },
  verticalRow: {
    gap: 10,
  },
  verticalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ElviraTheme.border,
    padding: 12,
  },
  activeVerticalCard: {
    backgroundColor: '#E8EFE9',
    borderColor: ElviraTheme.primary,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  activeRadio: {
    borderColor: ElviraTheme.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ElviraTheme.primary,
  },
  verticalCardTexts: {
    flex: 1,
  },
  verticalCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C221F',
    marginBottom: 2,
  },
  verticalCardSub: {
    fontSize: 10,
    color: ElviraTheme.textMuted,
  },
  saveButton: {
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
    gap: 6,
  },
  saveButtonText: {
    color: ElviraTheme.white,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButtonArrow: {
    color: ElviraTheme.white,
    fontSize: 16,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 14,
  },
  skipText: {
    fontSize: 12,
    color: ElviraTheme.textMuted,
    fontWeight: '500',
  },
});
