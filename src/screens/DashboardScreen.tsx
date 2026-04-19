import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { Transaction } from '../types';

function formatAmount(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const centsStr = (cents % 100).toString().padStart(2, '0');
  return `$${dollars.toLocaleString()}.${centsStr}`;
}

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 || 12;
  return `${hour}:${m}${ampm}`;
}

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg: '#0E1117',
  card: '#1A1D2B',
  cardTeal: '#14594E',
  teal: '#00C9A7',
  white: '#FFFFFF',
  gray: '#8A94A6',
  red: '#FF4B55',
  orange: '#FF8C42',
  purple: '#7B5EA7',
  blue: '#4A80F5',
  navBg: '#151820',
};

// ─── Circular donut progress ─────────────────────────────────────────────────
function CircularProgress({ pct }: { pct: number }) {
  const size = 92;
  const half = size / 2;
  const bw = 8;
  const angle = (pct / 100) * 360;
  const rightDeg = Math.min(angle, 180);
  const leftDeg = Math.max(angle - 180, 0);

  return (
    <View style={{ width: size, height: size }}>
      {/* Arc ring, rotated so 0° starts at 12 o'clock */}
      <View style={{ width: size, height: size, transform: [{ rotate: '-90deg' }] }}>
        {/* Background ring */}
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: half,
            borderWidth: bw,
            borderColor: 'rgba(255,255,255,0.18)',
          }}
        />
        {/* Right half (0–50%) */}
        <View
          style={{
            position: 'absolute',
            width: half,
            height: size,
            left: half,
            overflow: 'hidden',
          }}>
          <View
            style={{
              width: size,
              height: size,
              borderRadius: half,
              borderWidth: bw,
              borderColor: C.teal,
              position: 'absolute',
              left: -half,
              transform: [{ rotate: `${rightDeg - 180}deg` }],
            }}
          />
        </View>
        {/* Left half (50–100%) */}
        {angle > 180 && (
          <View
            style={{
              position: 'absolute',
              width: half,
              height: size,
              overflow: 'hidden',
            }}>
            <View
              style={{
                width: size,
                height: size,
                borderRadius: half,
                borderWidth: bw,
                borderColor: C.teal,
                position: 'absolute',
                transform: [{ rotate: `${leftDeg - 180}deg` }],
              }}
            />
          </View>
        )}
      </View>
      {/* Center label (not rotated) */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{ color: C.white, fontSize: 18, fontWeight: '700' }}>
          {pct}%
        </Text>
      </View>
    </View>
  );
}

// ─── Transaction row icon ─────────────────────────────────────────────────────
function TxIcon({ bg, label }: { bg: string; label: string }) {
  return (
    <View
      style={[
        styles.txIcon,
        { backgroundColor: bg },
      ]}>
      <Text style={{ fontSize: 18 }}>{label}</Text>
    </View>
  );
}

// ─── Bottom nav tab ───────────────────────────────────────────────────────────
function NavTab({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.navTab} activeOpacity={0.7} onPress={onPress}>
      <Text style={{ fontSize: 20, color: active ? C.teal : C.gray }}>{icon}</Text>
      <Text
        style={[
          styles.navLabel,
          { color: active ? C.teal : C.gray },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Swipeable delete action ──────────────────────────────────────────────────
function DeleteAction({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.deleteAction} activeOpacity={0.85} onPress={onPress}>
      <Text style={styles.deleteActionIcon}>🗑</Text>
      <Text style={styles.deleteActionLabel}>Delete</Text>
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function DashboardScreen({
  transactions,
  onAddExpense,
  onDeleteTransaction,
  onEditTransaction,
  onNavigateToTransactions,
}: {
  transactions: Transaction[];
  onAddExpense: () => void;
  onDeleteTransaction: (id: number) => void;
  onEditTransaction: (tx: Transaction) => void;
  onNavigateToTransactions: () => void;
}) {

  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());

  function confirmDelete(tx: Transaction) {
    Alert.alert(
      'Delete transaction?',
      `${formatAmount(tx.amountCents)}${tx.note ? ` · ${tx.note}` : ''} will be permanently removed.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => swipeableRefs.current.get(tx.id)?.close(),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteTransaction(tx.id),
        },
      ],
    );
  }

  const now = new Date();
  const spentThisMonthCents = transactions
    .filter(
      tx =>
        tx.createdAt.getFullYear() === now.getFullYear() &&
        tx.createdAt.getMonth() === now.getMonth(),
    )
    .reduce((sum, tx) => sum + tx.amountCents, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
          <Text style={styles.headerBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TrackPrivate</Text>
        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.7}>
          <Text style={{ color: C.white, fontSize: 16 }}>🔍</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.monthLabel}>March 2026</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Spent card ───────────────────────────────────────────────────── */}
        <View style={styles.spentCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.spentLabel}>Spent this month</Text>
            <Text style={styles.spentAmount}>{formatAmount(spentThisMonthCents)}</Text>
            <Text style={styles.spentSub}>$2,000</Text>
            <Text style={styles.spentSubLabel}>Quick Summary</Text>
          </View>
          <CircularProgress pct={62} />
        </View>

        {/* ── Income / Savings cards ───────────────────────────────────────── */}
        <View style={styles.row}>
          {/* Income */}
          <View style={[styles.miniCard, { marginRight: 8 }]}>
            <View style={styles.miniCardHeader}>
              <View style={styles.avatarCircle}>
                <Text style={{ fontSize: 14 }}>👤</Text>
              </View>
              <Text style={styles.miniCardTitle}>Income</Text>
            </View>
            <View style={styles.miniCardFooter}>
              <Text style={styles.miniCardIcon}>⏱</Text>
              <Text style={styles.miniCardAmount}>$1,240</Text>
            </View>
          </View>
          {/* Savings */}
          <View style={[styles.miniCard, { marginLeft: 8 }]}>
            <View style={styles.miniCardHeader}>
              <View style={styles.avatarCircle}>
                <Text style={{ fontSize: 14 }}>👤</Text>
              </View>
              <Text style={styles.miniCardTitle}>Savings</Text>
            </View>
            <View style={styles.miniCardFooter}>
              <Text style={styles.miniCardIcon}>🐷</Text>
              <Text style={styles.miniCardAmount}>$1,340</Text>
            </View>
          </View>
        </View>

        {/* ── Recent Transactions ──────────────────────────────────────────── */}
        <View style={styles.txHeader}>
          <Text style={styles.txTitle}>Recent Transactions</Text>
          <Text style={styles.txFilter} onPress={onNavigateToTransactions}>See all</Text>
        </View>

        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet</Text>
        ) : (
          [...transactions]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 6)
            .map(tx => (
            <Swipeable
              key={tx.id}
              ref={ref => {
                if (ref) {swipeableRefs.current.set(tx.id, ref);}
                else {swipeableRefs.current.delete(tx.id);}
              }}
              renderRightActions={() => (
                <DeleteAction onPress={() => confirmDelete(tx)} />
              )}
              rightThreshold={40}
              overshootRight={false}>
              <TouchableOpacity
                style={styles.txRow}
                activeOpacity={0.7}
                onPress={() => onEditTransaction(tx)}>
                <TxIcon bg={tx.categoryBg} label={tx.categoryIcon} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.txAmount}>{formatAmount(tx.amountCents)}</Text>
                  <Text style={styles.txAge}>{tx.note || 'No note'}</Text>
                </View>
                <Text style={styles.txTime}>{formatTime(tx.createdAt)}</Text>
              </TouchableOpacity>
            </Swipeable>
          ))
        )}

        {/* bottom padding so FAB doesn't overlap last row */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={onAddExpense}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* ── Bottom Nav ───────────────────────────────────────────────────────── */}
      <View style={styles.bottomNav}>
        <NavTab icon="🏠" label="Home"         active />
        <NavTab icon="⊞"  label="Transactions" onPress={onNavigateToTransactions} />
        <NavTab icon="📊" label="Budgets"               />
        <NavTab icon="📈" label="Reports"               />
        <NavTab icon="···" label="More"                  />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  headerBtnText: {
    color: C.white,
    fontSize: 28,
    lineHeight: 32,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: C.white,
    fontSize: 18,
    fontWeight: '700',
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthLabel: {
    textAlign: 'center',
    color: C.gray,
    fontSize: 13,
    marginBottom: 16,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },

  // Spent card
  spentCard: {
    backgroundColor: C.cardTeal,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  spentLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginBottom: 4,
  },
  spentAmount: {
    color: C.white,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 4,
  },
  spentSub: {
    color: C.white,
    fontSize: 15,
    fontWeight: '600',
  },
  spentSubLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },

  // Mini cards
  row: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  miniCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
  },
  miniCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,201,167,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  miniCardTitle: {
    color: C.white,
    fontSize: 14,
    fontWeight: '600',
  },
  miniCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniCardIcon: {
    fontSize: 14,
    marginRight: 6,
    color: C.gray,
  },
  miniCardAmount: {
    color: C.white,
    fontSize: 15,
    fontWeight: '700',
  },

  // Swipe-to-delete
  deleteAction: {
    backgroundColor: '#FF4B55',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginBottom: 18,
    marginLeft: 8,
  },
  deleteActionIcon: {
    fontSize: 18,
  },
  deleteActionLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },

  // Transactions
  emptyText: {
    color: C.gray,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  txTitle: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
  txFilter: {
    color: C.teal,
    fontSize: 13,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  txIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txAmount: {
    color: C.white,
    fontSize: 15,
    fontWeight: '600',
  },
  txAge: {
    color: C.gray,
    fontSize: 12,
    marginTop: 2,
  },
  txTime: {
    color: C.gray,
    fontSize: 13,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.teal,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.teal,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabIcon: {
    color: C.white,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: C.navBg,
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 10,
    marginTop: 3,
  },
});
