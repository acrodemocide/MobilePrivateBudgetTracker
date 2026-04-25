import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Transaction } from '../types';

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg: '#0E1117',
  keyBg: '#1E2130',
  teal: '#00C9A7',
  white: '#FFFFFF',
  gray: '#8A94A6',
  grayLight: '#4A4F60',
  inputBg: '#1A1D2B',
  lockGray: '#2E3245',
};

// ─── Category definitions ─────────────────────────────────────────────────────
const CATEGORIES = [
  { icon: '🏠', bg: '#3DAA6E', locked: false, star: false, label: 'Housing'   },
  { icon: '🚗', bg: '#4A90D9', locked: false, star: false, label: 'Transport' },
  { icon: '🍽️', bg: '#7B5EA7', locked: false, star: false, label: 'Food'      },
  { icon: '📥', bg: '#E05C3A', locked: false, star: false, label: 'Utilities' },
  { icon: '❤️', bg: '#2BB5A0', locked: false, star: false, label: 'Health'    },
  { icon: '🎉', bg: '#C9A84C', locked: false, star: false, label: 'Fun'       },
  { icon: '📦', bg: '#4A4F60', locked: false, star: false, label: 'Other'     },
  { icon: '⭐', bg: '#2E3245', locked: true,  star: true,  label: 'Premium'   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCents(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const centsStr = (cents % 100).toString().padStart(2, '0');
  return `$${dollars.toLocaleString()}.${centsStr}`;
}

// ─── Category icon button ─────────────────────────────────────────────────────
function CategoryBtn({
  bg,
  icon,
  label,
  locked,
  star,
  selected,
  onPress,
}: {
  bg: string;
  icon: string;
  label: string;
  locked?: boolean;
  star?: boolean;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <View style={styles.catBtnWrapper}>
      <TouchableOpacity
        style={[
          styles.catBtn,
          { backgroundColor: bg },
          selected && styles.catBtnSelected,
        ]}
        activeOpacity={locked ? 1 : 0.75}
        onPress={locked ? undefined : onPress}>
        <Text style={styles.catIcon}>{icon}</Text>
        {locked && (
          <View style={styles.lockBadge}>
            <Text style={{ fontSize: 8, color: C.white }}>🔒</Text>
          </View>
        )}
        {star && (
          <View style={styles.starBadge}>
            <Text style={{ fontSize: 8, color: '#FFD700' }}>★</Text>
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.catLabel}>{label}</Text>
    </View>
  );
}

// ─── Numpad key ───────────────────────────────────────────────────────────────
function NumKey({
  label,
  sub,
  onPress,
}: {
  label: string;
  sub?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.numKey} activeOpacity={0.7} onPress={onPress}>
      <Text style={styles.numKeyLabel}>{label}</Text>
      {sub ? <Text style={styles.numKeySub}>{sub}</Text> : null}
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function NewExpenseScreen({
  onSave,
  onCancel,
  existingTransaction,
}: {
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  existingTransaction?: Transaction;
}) {
  const initCatIdx = existingTransaction
    ? CATEGORIES.findIndex(c => c.icon === existingTransaction.categoryIcon)
    : -1;

  const [cents, setCents] = useState(existingTransaction?.amountCents ?? 0);
  const [selectedCat, setSelectedCat] = useState<number | null>(initCatIdx >= 0 ? initCatIdx : null);
  const [note, setNote] = useState(existingTransaction?.note ?? '');

  function handleDigit(d: string) {
    setCents(prev => {
      const next = prev * 10 + parseInt(d, 10);
      return next > 9999999 ? prev : next;
    });
  }

  function handleBackspace() {
    setCents(prev => Math.floor(prev / 10));
  }

  function handleSave() {
    if (cents === 0) {
      Alert.alert('Missing amount', 'Please enter an amount.');
      return;
    }
    if (selectedCat === null) {
      Alert.alert('Missing category', 'Please select a category.');
      return;
    }
    const cat = CATEGORIES[selectedCat];
    onSave({
      amountCents: cents,
      categoryIcon: cat.icon,
      categoryBg: cat.bg,
      note,
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{existingTransaction ? 'Edit Expense' : 'New Expense'}</Text>
      </View>

      {/* ── Amount display ───────────────────────────────────────────────────── */}
      <View style={styles.amountRow}>
        <View>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountSub}>Enter</Text>
        </View>
        <Text style={styles.amountValue}>{formatCents(cents)}</Text>
      </View>

      {/* ── Numpad ───────────────────────────────────────────────────────────── */}
      <View style={styles.numpad}>
        <View style={styles.numRow}>
          <NumKey label="1" onPress={() => handleDigit('1')} />
          <NumKey label="2" sub="43L" onPress={() => handleDigit('2')} />
          <NumKey label="3" sub="746" onPress={() => handleDigit('3')} />
        </View>
        <View style={styles.numRow}>
          <NumKey label="4" sub="145" onPress={() => handleDigit('4')} />
          <NumKey label="5" sub="34C" onPress={() => handleDigit('5')} />
          <NumKey label="6" sub="596" onPress={() => handleDigit('6')} />
        </View>
        <View style={styles.numRow}>
          <NumKey label="7" sub="71C" onPress={() => handleDigit('7')} />
          <NumKey label="8" sub="586" onPress={() => handleDigit('8')} />
          <NumKey label="9" sub="909" onPress={() => handleDigit('9')} />
        </View>
        <View style={styles.numRow}>
          <View style={{ flex: 1, margin: 3 }} />
          <NumKey label="0" onPress={() => handleDigit('0')} />
          <TouchableOpacity style={styles.numKey} activeOpacity={0.7} onPress={handleBackspace}>
            <Text style={[styles.numKeyLabel, { fontSize: 20 }]}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Upsell banner ────────────────────────────────────────────────────── */}
      <View style={styles.upsellRow}>
        <Text style={styles.upsellText}>Unlock unlimited categories </Text>
        <Text style={styles.upsellFree}>Free</Text>
      </View>

      {/* ── Category grid ────────────────────────────────────────────────────── */}
      <View style={styles.catGrid}>
        <View style={styles.catRow}>
          {CATEGORIES.slice(0, 4).map((cat, i) => (
            <CategoryBtn
              key={i}
              bg={cat.bg}
              icon={cat.icon}
              label={cat.label}
              locked={cat.locked}
              star={cat.star}
              selected={selectedCat === i}
              onPress={() => setSelectedCat(i)}
            />
          ))}
        </View>
        <View style={styles.catRow}>
          {CATEGORIES.slice(4).map((cat, i) => (
            <CategoryBtn
              key={i + 4}
              bg={cat.bg}
              icon={cat.icon}
              label={cat.label}
              locked={cat.locked}
              star={cat.star}
              selected={selectedCat === i + 4}
              onPress={() => setSelectedCat(i + 4)}
            />
          ))}
        </View>
      </View>

      {/* ── Date picker ──────────────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.datePicker} activeOpacity={0.7}>
        <Text style={styles.dateText}>12/10/2023</Text>
        <Text style={styles.dateChevron}> ˅</Text>
      </TouchableOpacity>

      {/* ── Notes field ──────────────────────────────────────────────────────── */}
      <View style={styles.notesRow}>
        <TextInput
          style={styles.notesInput}
          placeholder="Notes"
          placeholderTextColor={C.gray}
          value={note}
          onChangeText={setNote}
        />
        <TouchableOpacity activeOpacity={0.7} style={styles.cameraBtn}>
          <Text style={{ fontSize: 18, color: C.gray }}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* ── Action buttons ───────────────────────────────────────────────────── */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelBtn}
          activeOpacity={0.85}
          onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: C.white,
    fontSize: 17,
    fontWeight: '700',
  },
  starIcon: {
    color: C.white,
    fontSize: 20,
    paddingLeft: 8,
  },

  // Amount
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  amountLabel: {
    color: C.white,
    fontSize: 14,
    fontWeight: '600',
  },
  amountSub: {
    color: C.gray,
    fontSize: 12,
    marginTop: 2,
  },
  amountValue: {
    color: C.white,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },

  // Numpad
  numpad: {
    marginBottom: 4,
  },
  numRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  numKey: {
    flex: 1,
    height: 54,
    margin: 3,
    borderRadius: 10,
    backgroundColor: C.keyBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numKeyLabel: {
    color: C.white,
    fontSize: 22,
    fontWeight: '500',
  },
  numKeySub: {
    color: C.grayLight,
    fontSize: 9,
    marginTop: 1,
  },

  // Upsell
  upsellRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  upsellText: {
    color: C.gray,
    fontSize: 12,
  },
  upsellFree: {
    color: C.teal,
    fontSize: 12,
    fontWeight: '600',
  },

  // Categories
  catGrid: {
    marginBottom: 10,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catBtnWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  catBtn: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catLabel: {
    color: C.gray,
    fontSize: 11,
    fontWeight: '500',
  },
  catBtnSelected: {
    borderWidth: 2,
    borderColor: C.teal,
  },
  catIcon: {
    fontSize: 22,
  },
  lockBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  starBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },

  // Date picker
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  dateText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '500',
  },
  dateChevron: {
    color: C.gray,
    fontSize: 14,
  },

  // Notes
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 14,
  },
  notesInput: {
    flex: 1,
    color: C.white,
    fontSize: 14,
    height: 40,
  },
  cameraBtn: {
    paddingLeft: 8,
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: C.teal,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: C.inputBg,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
