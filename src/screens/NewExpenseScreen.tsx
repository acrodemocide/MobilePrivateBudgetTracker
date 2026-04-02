import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

// ─── Category icon button ─────────────────────────────────────────────────────
function CategoryBtn({
  bg,
  icon,
  locked,
  star,
}: {
  bg: string;
  icon: string;
  locked?: boolean;
  star?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.catBtn, { backgroundColor: bg }]}
      activeOpacity={0.75}>
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
  );
}

// ─── Numpad key ───────────────────────────────────────────────────────────────
function NumKey({ label, sub }: { label: string; sub?: string }) {
  return (
    <TouchableOpacity style={styles.numKey} activeOpacity={0.7}>
      <Text style={styles.numKeyLabel}>{label}</Text>
      {sub ? <Text style={styles.numKeySub}>{sub}</Text> : null}
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function NewExpenseScreen({ onCancel }: { onCancel: () => void }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Expense</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.starIcon}>☆</Text>
        </TouchableOpacity>
      </View>

      {/* ── Amount display ───────────────────────────────────────────────────── */}
      <View style={styles.amountRow}>
        <View>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountSub}>Enit</Text>
        </View>
        <Text style={styles.amountValue}>$45.50</Text>
      </View>

      {/* ── Numpad ───────────────────────────────────────────────────────────── */}
      <View style={styles.numpad}>
        <View style={styles.numRow}>
          <NumKey label="1" />
          <NumKey label="2" sub="43L" />
          <NumKey label="3" sub="746" />
        </View>
        <View style={styles.numRow}>
          <NumKey label="4" sub="145" />
          <NumKey label="5" sub="34C" />
          <NumKey label="6" sub="596" />
        </View>
        <View style={styles.numRow}>
          <NumKey label="7" sub="71C" />
          <NumKey label="8" sub="586" />
          <NumKey label="9" sub="909" />
        </View>
        <View style={styles.numRow}>
          <NumKey label="0" />
          {/* empty placeholder */}
          <View style={styles.numKey} />
          <TouchableOpacity style={styles.numKey} activeOpacity={0.7}>
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
          <CategoryBtn bg="#3DAA6E" icon="💼" />
          <CategoryBtn bg="#4A90D9" icon="🚗" />
          <CategoryBtn bg="#7B5EA7" icon="⊞" />
          <CategoryBtn bg="#E05C3A" icon="📥" />
        </View>
        <View style={styles.catRow}>
          <CategoryBtn bg="#2BB5A0" icon="💾" />
          <CategoryBtn bg="#C9A84C" icon="👑" />
          <CategoryBtn bg="#4A4F60" icon="📊" locked />
          <CategoryBtn bg="#2E3245" icon="⭐" locked star />
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
          editable={false}
        />
        <TouchableOpacity activeOpacity={0.7} style={styles.cameraBtn}>
          <Text style={{ fontSize: 18, color: C.gray }}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* ── Action buttons ───────────────────────────────────────────────────── */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85}>
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
  catBtn: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
