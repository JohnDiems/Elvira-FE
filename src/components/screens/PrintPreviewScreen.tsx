import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ElviraTheme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

interface PrintPreviewScreenProps {
  setCurrentScreen: (screen: any) => void;
  currentOrder: any;
}

export function PrintPreviewScreen({
  setCurrentScreen,
  currentOrder,
}: PrintPreviewScreenProps) {
  const [printer, setPrinter] = useState('Star Micronics mPOP');
  const [copies, setCopies] = useState(1);
  const [paperSize, setPaperSize] = useState<'80mm' | '58mm'>('80mm');
  const [isPrinting, setIsPrinting] = useState(false);

  if (!currentOrder) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      Alert.alert('Print Command Sent', `Receipt printed on ${printer} (${copies} copy, size: ${paperSize}).`);
      setCurrentScreen('success');
    }, 1500);
  };

  const formatPrice = (price: number) => {
    return 'Php' + Number(price).toLocaleString('en-US', { minimumFractionDigits: 3 });
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return dateStr;
    }
  };

  const subtotal = currentOrder.subtotal || 33.000;
  const tax = currentOrder.tax_amount || 3.300;
  const serviceCharge = 1.995;
  const total = subtotal + tax + serviceCharge;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('success')}>
          <Text style={{ fontSize: 16, color: '#1C221F', marginRight: 6 }}>➔</Text>
          <Text style={styles.backText}>Print Preview</Text>
        </TouchableOpacity>
        <Text style={styles.headerSubtitle}>Review receipt before printing</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Receipt preview box (white styling as standard physical receipt) */}
        <View style={[styles.receiptContainer, paperSize === '58mm' ? styles.receiptNarrow : null]}>
          {/* EC monogram logo box */}
          <View style={styles.receiptLogoBox}>
            <Text style={styles.receiptLogoText}>EC</Text>
          </View>

          <View style={styles.receiptHeaderInfo}>
            <Text style={styles.receiptBrand}>Elvira Cafe</Text>
            <Text style={styles.receiptInfo}>Jalan Senopati No. 12, Jakarta</Text>
            <Text style={styles.receiptInfo}>Tel: +62 21 5555 0123</Text>
          </View>

          <View style={styles.receiptDivider} />

          <View style={styles.receiptMeta}>
            <Text style={styles.metaText}>Order #{currentOrder.id ? String(currentOrder.id).substring(0, 8) : '2938'}</Text>
            <Text style={styles.metaText}>{formatDate(currentOrder.created_at)}</Text>
          </View>

          <View style={styles.receiptDivider} />

          {/* Receipt items list */}
          <View style={styles.receiptItems}>
            {currentOrder.items?.map((item: any) => (
              <View key={item.id} style={styles.receiptItemRow}>
                <Text style={styles.receiptItemName}>
                  {item.quantity}x {item.product?.name || 'Product'}
                </Text>
                <Text style={styles.receiptItemSub}>{formatPrice(item.subtotal)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.receiptDivider} />

          {/* Receipt calculations */}
          <View style={styles.receiptCalc}>
            <View style={styles.receiptCalcRow}>
              <Text style={styles.calcLabel}>Subtotal</Text>
              <Text style={styles.calcVal}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.receiptCalcRow}>
              <Text style={styles.calcLabel}>Tax (10%)</Text>
              <Text style={styles.calcVal}>{formatPrice(tax)}</Text>
            </View>
            <View style={styles.receiptCalcRow}>
              <Text style={styles.calcLabel}>Service Charge</Text>
              <Text style={styles.calcVal}>{formatPrice(serviceCharge)}</Text>
            </View>

            <View style={[styles.receiptCalcRow, styles.receiptTotalRow]}>
              <Text style={styles.receiptTotalLabel}>TOTAL</Text>
              <Text style={styles.receiptTotalVal}>{formatPrice(total)}</Text>
            </View>
          </View>

          <View style={styles.receiptDivider} />

          {/* Barcode representation */}
          <View style={styles.barcodeContainer}>
            <View style={styles.barcodeLines}>
              {[2, 1, 3, 1, 4, 1, 2, 2, 1, 3, 2, 1, 2, 4, 1, 2, 3].map((w, idx) => (
                <View 
                  key={idx} 
                  style={{
                    width: w,
                    height: 36,
                    backgroundColor: '#000000',
                    marginRight: 2,
                  }} 
                />
              ))}
            </View>
            <Text style={styles.barcodeText}>*ELV-{currentOrder.id ? String(currentOrder.id).substring(0, 8) : '2938'}*</Text>
            <Text style={styles.receiptFooter}>Thank you for visiting Elvira Cafe!</Text>
          </View>
        </View>

        {/* Printer settings block */}
        <View style={styles.settingsCard}>
          {/* Printer dropdown */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Select Printer</Text>
            <View style={styles.dropdown}>
              <Text style={styles.dropdownText}>🖨️ {printer}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </View>
          </View>

          {/* Copies count */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Copies</Text>
            <View style={styles.copiesSelector}>
              <TouchableOpacity 
                style={styles.copiesBtn} 
                onPress={() => setCopies(Math.max(1, copies - 1))}
              >
                <Text style={styles.copiesBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.copiesValue}>{copies}</Text>
              <TouchableOpacity 
                style={styles.copiesBtn} 
                onPress={() => setCopies(copies + 1)}
              >
                <Text style={styles.copiesBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Paper Size selector */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Paper Size</Text>
            <View style={styles.sizeOptions}>
              <TouchableOpacity
                style={[styles.sizeBtn, paperSize === '80mm' ? styles.activeSizeBtn : null]}
                onPress={() => setPaperSize('80mm')}
              >
                <Text style={[styles.sizeBtnText, paperSize === '80mm' ? styles.activeSizeBtnText : null]}>
                  80mm
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sizeBtn, paperSize === '58mm' ? styles.activeSizeBtn : null]}
                onPress={() => setPaperSize('58mm')}
              >
                <Text style={[styles.sizeBtnText, paperSize === '58mm' ? styles.activeSizeBtnText : null]}>
                  58mm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Print Button */}
        <TouchableOpacity 
          style={styles.printButton} 
          onPress={handlePrint}
          disabled={isPrinting}
        >
          <Text style={styles.printButtonText}>
            {isPrinting ? 'Printing Receipt...' : '🖨️ Print Receipt'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => setCurrentScreen('success')}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        currentScreen="orders_list"
        setCurrentScreen={setCurrentScreen}
        isDarkMode={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ElviraTheme.bgDark,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: ElviraTheme.border,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  headerSubtitle: {
    fontSize: 11,
    color: ElviraTheme.textMuted,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    gap: 16,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 80,
  },
  receiptContainer: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    shadowColor: 'rgba(28, 34, 33, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  receiptNarrow: {
    width: 220,
    padding: 14,
  },
  receiptLogoBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#3A5340',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  receiptLogoText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  receiptHeaderInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptBrand: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1C221F',
    marginBottom: 4,
  },
  receiptInfo: {
    fontSize: 9,
    color: ElviraTheme.textMuted,
  },
  receiptDivider: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: ElviraTheme.border,
    marginVertical: 10,
    width: '100%',
  },
  receiptMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  metaText: {
    fontSize: 9,
    color: '#1C221F',
    fontWeight: 'bold',
  },
  receiptItems: {
    gap: 6,
    width: '100%',
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptItemName: {
    fontSize: 10,
    color: '#1C221F',
    fontWeight: '500',
  },
  receiptItemSub: {
    fontSize: 10,
    color: '#1C221F',
    fontWeight: 'bold',
  },
  receiptCalc: {
    gap: 4,
    width: '100%',
  },
  receiptCalcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calcLabel: {
    fontSize: 10,
    color: ElviraTheme.textMuted,
  },
  calcVal: {
    fontSize: 10,
    color: '#1C221F',
  },
  receiptTotalRow: {
    marginTop: 6,
    borderTopWidth: 1,
    borderColor: '#F4F6F5',
    paddingTop: 6,
  },
  receiptTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  receiptTotalVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C221F',
  },
  barcodeContainer: {
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  barcodeLines: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  barcodeText: {
    fontSize: 8,
    color: '#1C221F',
    letterSpacing: 1,
    marginBottom: 10,
  },
  receiptFooter: {
    fontSize: 9,
    color: ElviraTheme.textMuted,
    textAlign: 'center',
  },
  settingsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    padding: 16,
    gap: 12,
  },
  settingGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 12,
    color: '#1C221F',
    fontWeight: 'bold',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    width: 160,
  },
  dropdownText: {
    fontSize: 11,
    color: '#1C221F',
    fontWeight: 'bold',
  },
  dropdownArrow: {
    fontSize: 8,
    color: ElviraTheme.textMuted,
  },
  copiesSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    borderRadius: 8,
    padding: 2,
  },
  copiesBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: ElviraTheme.border,
  },
  copiesBtnText: {
    fontSize: 14,
    color: ElviraTheme.primary,
    fontWeight: 'bold',
  },
  copiesValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C221F',
    width: 14,
    textAlign: 'center',
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeBtn: {
    height: 30,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSizeBtn: {
    backgroundColor: ElviraTheme.primary,
    borderColor: ElviraTheme.primary,
  },
  sizeBtnText: {
    fontSize: 11,
    color: ElviraTheme.textMuted,
    fontWeight: 'bold',
  },
  activeSizeBtnText: {
    color: '#FFFFFF',
  },
  printButton: {
    backgroundColor: ElviraTheme.primary,
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  printButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: ElviraTheme.border,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  cancelButtonText: {
    color: '#1C221F',
    fontSize: 13,
    fontWeight: 'bold',
  },

});
