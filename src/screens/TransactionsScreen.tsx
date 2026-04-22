import React, { useRef, useState } from 'react';
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

const C = {
  bg: '#0E1117',
  card: '#1A1D2B',
  teal: '#00C9A7',
  white: '#FFFFFF',
  gray: '#8A94A6',
  navBg: '#151820',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatAmount(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const centsStr = (cents % 100).toString().padStart(2, '0');
  return `$${dollars.toLocaleString()}.${centsStr}`;
}

function formatDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

function monthKey(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TxIcon({ bg, label }: { bg: string; label: string }) {
  return (
    <View style={[styles.txIcon, { backgroundColor: bg }]}>
      <Text style={{ fontSize: 18 }}>{label}</Text>
    </View>
  );
}

function DeleteAction({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.deleteAction} activeOpacity={0.85} onPress={onPress}>
      <Text style={styles.deleteActionIcon}>🗑</Text>
      <Text style={styles.deleteActionLabel}>Delete</Text>
    </TouchableOpacity>
  );
}

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
      <Text style={[styles.navLabel, { color: active ? C.teal : C.gray }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function TransactionsScreen({
  transactions,
  onDeleteTransaction,
  onEditTransaction,
  onNavigateToDashboard,
  onNavigateToBudgets,
  onNavigateToReports,
}: {
  transactions: Transaction[];
  onDeleteTransaction: (id: number) => void;
  onEditTransaction: (tx: Transaction) => void;
  onNavigateToDashboard: () => void;
  onNavigateToBudgets: () => void;
  onNavigateToReports: () => void;
}) {
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedIcon, setSelectedIcon] = useState<string>('All');

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

  const sorted = [...transactions].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const monthOptions = ['All', ...Array.from(new Set(sorted.map(tx => monthKey(tx.createdAt))))];
  const iconOptions  = ['All', ...Array.from(new Set(sorted.map(tx => tx.categoryIcon)))];

  const iconBgMap: Record<string, string> = {};
  transactions.forEach(tx => { iconBgMap[tx.categoryIcon] = tx.categoryBg; });

  const visible = sorted
    .filter(tx => selectedMonth === 'All' || monthKey(tx.createdAt) === selectedMonth)
    .filter(tx => selectedIcon === 'All' || tx.categoryIcon === selectedIcon);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} onPress={onNavigateToDashboard}>
          <Text style={styles.headerBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Transactions</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ── Month filter pills ──────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterRowContent}>
        {monthOptions.map(month => (
          <TouchableOpacity
            key={month}
            style={[styles.pill, selectedMonth === month && styles.pillActive]}
            activeOpacity={0.7}
            onPress={() => setSelectedMonth(month)}>
            <Text style={[styles.pillText, selectedMonth === month && styles.pillTextActive]}>
              {month}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Category icon filter ────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterRowContent}>
        {iconOptions.map(icon => {
          const isAll    = icon === 'All';
          const isActive = selectedIcon === icon;
          return (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconPill,
                { backgroundColor: isAll ? C.card : iconBgMap[icon] },
                isActive && styles.iconPillActive,
              ]}
              activeOpacity={0.75}
              onPress={() => setSelectedIcon(icon)}>
              <Text style={{ fontSize: isAll ? 12 : 18, color: isAll ? C.gray : C.white }}>
                {isAll ? 'All' : icon}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Count label ────────────────────────────────────────────────────── */}
      <Text style={styles.countLabel}>
        {visible.length} transaction{visible.length !== 1 ? 's' : ''}
      </Text>

      {/* ── Transaction list ────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {visible.length === 0 ? (
          <Text style={styles.emptyText}>No transactions found</Text>
        ) : (
          visible.map(tx => (
            <Swipeable
              key={tx.id}
              ref={ref => {
                if (ref) { swipeableRefs.current.set(tx.id, ref); }
                else { swipeableRefs.current.delete(tx.id); }
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
                  <Text style={styles.txNote}>{tx.note || 'No note'}</Text>
                </View>
                <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
              </TouchableOpacity>
            </Swipeable>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Bottom nav ──────────────────────────────────────────────────────── */}
      <View style={styles.bottomNav}>
        <NavTab icon="🏠"  label="Home"         onPress={onNavigateToDashboard} />
        <NavTab icon="💳"   label="Transactions" active />
        <NavTab icon="📊"  label="Budgets"       onPress={onNavigateToBudgets} />
        <NavTab icon="📈"  label="Reports"       onPress={onNavigateToReports} />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerBtnText: { color: C.white, fontSize: 28, lineHeight: 32 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: C.white,
    fontSize: 18,
    fontWeight: '700',
  },

  filterRow: { maxHeight: 52, flexGrow: 0 },
  filterRowContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.card,
    marginRight: 8,
  },
  pillActive: { backgroundColor: C.teal },
  pillText: { color: C.gray, fontSize: 13, fontWeight: '500' },
  pillTextActive: { color: C.white },

  iconPill: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconPillActive: { borderWidth: 2, borderColor: C.teal },

  countLabel: {
    color: C.gray,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10 },

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
  txAmount: { color: C.white, fontSize: 15, fontWeight: '600' },
  txNote: { color: C.gray, fontSize: 12, marginTop: 2 },
  txDate: { color: C.gray, fontSize: 13 },

  deleteAction: {
    backgroundColor: '#FF4B55',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginBottom: 18,
    marginLeft: 8,
  },
  deleteActionIcon: { fontSize: 18 },
  deleteActionLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },

  emptyText: {
    color: C.gray,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 32,
  },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: C.navBg,
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  navTab: { flex: 1, alignItems: 'center' },
  navLabel: { fontSize: 10, marginTop: 3 },
});
