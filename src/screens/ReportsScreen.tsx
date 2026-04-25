import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Transaction } from '../types';

const C = {
  bg: '#0E1117',
  card: '#1A1D2B',
  cardTeal: '#14594E',
  teal: '#00C9A7',
  tealDim: 'rgba(0,201,167,0.15)',
  white: '#FFFFFF',
  gray: '#8A94A6',
  red: '#FF4B55',
  navBg: '#151820',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CAT_LABELS: Record<string, string> = {
  '🏠': 'Housing',
  '🚗': 'Transport',
  '🍽️': 'Food',
  '📥': 'Utilities',
  '❤️': 'Health',
  '🎉': 'Fun',
  '📦': 'Other',
};

function formatAmount(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const c = (cents % 100).toString().padStart(2, '0');
  return `$${dollars.toLocaleString()}.${c}`;
}

function spentInMonth(transactions: Transaction[], year: number, month: number): number {
  return transactions
    .filter(tx => tx.createdAt.getFullYear() === year && tx.createdAt.getMonth() === month)
    .reduce((sum, tx) => sum + tx.amountCents, 0);
}

function NavTab({
  icon, label, active, onPress,
}: {
  icon: string; label: string; active?: boolean; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.navTab} activeOpacity={0.7} onPress={onPress}>
      <Text style={{ fontSize: 20, color: active ? C.teal : C.gray }}>{icon}</Text>
      <Text style={[styles.navLabel, { color: active ? C.teal : C.gray }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Monthly Summary ──────────────────────────────────────────────────────────
function MonthlySummary({
  transactions, budgetCents, incomeCents,
}: {
  transactions: Transaction[]; budgetCents: number; incomeCents: number;
}) {
  const now = new Date();
  const thisMonth = spentInMonth(transactions, now.getFullYear(), now.getMonth());
  const lastDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = spentInMonth(transactions, lastDate.getFullYear(), lastDate.getMonth());
  const diff = thisMonth - lastMonth;
  const diffLabel = lastMonth === 0
    ? null
    : `${diff >= 0 ? '+' : ''}${formatAmount(Math.abs(diff))} vs last month`;
  const diffColor = diff <= 0 ? C.teal : C.red;
  const budgetPct = Math.min((thisMonth / budgetCents) * 100, 100);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Monthly Summary</Text>
      <View style={styles.card}>
        <View style={styles.summaryRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={styles.summaryAmount}>{formatAmount(thisMonth)}</Text>
            {diffLabel && (
              <Text style={[styles.summaryDiff, { color: diffColor }]}>{diffLabel}</Text>
            )}
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.summaryLabel}>Budget</Text>
            <Text style={styles.summaryAmount}>{formatAmount(budgetCents)}</Text>
            <Text style={[styles.summaryDiff, { color: C.gray }]}>
              {formatAmount(Math.max(budgetCents - thisMonth, 0))} remaining
            </Text>
          </View>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${budgetPct}%` as any, backgroundColor: budgetPct >= 90 ? C.red : C.teal }]} />
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryLabel, { color: C.teal }]}>{formatAmount(incomeCents)}</Text>
        </View>
        <View style={[styles.summaryRow, { marginTop: 4 }]}>
          <Text style={styles.summaryLabel}>Savings</Text>
          <Text style={[styles.summaryLabel, { color: C.teal }]}>
            {formatAmount(Math.max(incomeCents - thisMonth, 0))}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Spending by Category ─────────────────────────────────────────────────────
function SpendingByCategory({ transactions }: { transactions: Transaction[] }) {
  const now = new Date();
  const thisMonthTxs = transactions.filter(
    tx => tx.createdAt.getFullYear() === now.getFullYear() &&
          tx.createdAt.getMonth() === now.getMonth(),
  );

  const categoryMap = new Map<string, { icon: string; bg: string; total: number }>();
  for (const tx of thisMonthTxs) {
    const existing = categoryMap.get(tx.categoryIcon);
    if (existing) {
      existing.total += tx.amountCents;
    } else {
      categoryMap.set(tx.categoryIcon, { icon: tx.categoryIcon, bg: tx.categoryBg, total: tx.amountCents });
    }
  }

  const categories = [...categoryMap.values()].sort((a, b) => b.total - a.total);
  const maxTotal = categories[0]?.total ?? 1;

  if (categories.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        <View style={styles.card}>
          <Text style={styles.emptyText}>No transactions this month</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Spending by Category</Text>
      <View style={styles.card}>
        {categories.map((cat, i) => (
          <View key={cat.icon} style={[styles.catRow, i < categories.length - 1 && styles.catDivider]}>
            <View style={[styles.catIcon, { backgroundColor: cat.bg }]}>
              <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.catName}>{CAT_LABELS[cat.icon] ?? cat.icon}</Text>
              <View style={styles.catBarRow}>
                <View style={styles.catBarBg}>
                  <View
                    style={[
                      styles.catBarFill,
                      { width: `${(cat.total / maxTotal) * 100}%` as any },
                    ]}
                  />
                </View>
                <Text style={styles.catAmount}>{formatAmount(cat.total)}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Category breakdown for a specific month (used inside Monthly Trend) ──────
function MonthCategoryBreakdown({
  transactions, year, month, total,
}: {
  transactions: Transaction[]; year: number; month: number; total: number;
}) {
  const monthTxs = transactions.filter(
    tx => tx.createdAt.getFullYear() === year && tx.createdAt.getMonth() === month,
  );

  const categoryMap = new Map<string, { icon: string; bg: string; total: number }>();
  for (const tx of monthTxs) {
    const existing = categoryMap.get(tx.categoryIcon);
    if (existing) {
      existing.total += tx.amountCents;
    } else {
      categoryMap.set(tx.categoryIcon, { icon: tx.categoryIcon, bg: tx.categoryBg, total: tx.amountCents });
    }
  }

  const categories = [...categoryMap.values()].sort((a, b) => b.total - a.total);
  const maxTotal = categories[0]?.total ?? 1;

  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailMonth}>{MONTHS[month]} {year}</Text>
        <Text style={styles.detailTotal}>{formatAmount(total)}</Text>
      </View>
      {categories.length === 0 ? (
        <Text style={styles.emptyText}>No transactions</Text>
      ) : (
        categories.map(cat => (
          <View key={cat.icon} style={styles.detailRow}>
            <View style={[styles.detailCatIcon, { backgroundColor: cat.bg }]}>
              <Text style={{ fontSize: 13 }}>{cat.icon}</Text>
            </View>
            <Text style={styles.detailCatLabel}>{CAT_LABELS[cat.icon] ?? cat.icon}</Text>
            <View style={styles.detailBarBg}>
              <View
                style={[
                  styles.detailBarFill,
                  { width: `${(cat.total / maxTotal) * 100}%` as any },
                ]}
              />
            </View>
            <Text style={styles.detailCatAmount}>{formatAmount(cat.total)}</Text>
          </View>
        ))
      )}
    </View>
  );
}

// ─── Monthly Trend ────────────────────────────────────────────────────────────
function MonthlyTrend({ transactions, budgetCents }: { transactions: Transaction[]; budgetCents: number }) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: MONTHS[d.getMonth()], year: d.getFullYear(), month: d.getMonth() };
  });

  const data = months.map(m => ({
    ...m,
    total: spentInMonth(transactions, m.year, m.month),
  }));

  const maxVal = Math.max(...data.map(d => d.total), budgetCents, 1);
  const BAR_HEIGHT = 100;
  const [selectedIdx, setSelectedIdx] = useState(5);
  const sel = data[selectedIdx];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Monthly Trend</Text>
      <View style={styles.card}>
        <Text style={styles.trendBudgetLabel}>Budget: {formatAmount(budgetCents)}</Text>
        <View style={styles.trendChart}>
          <View
            style={[
              styles.trendRefLine,
              { bottom: (budgetCents / maxVal) * BAR_HEIGHT },
            ]}
          />
          {data.map((d, i) => {
            const barH = Math.max((d.total / maxVal) * BAR_HEIGHT, d.total > 0 ? 4 : 0);
            const overBudget = d.total > budgetCents;
            const isSelected = i === selectedIdx;
            return (
              <TouchableOpacity
                key={`${d.year}-${d.month}`}
                style={styles.trendCol}
                activeOpacity={0.7}
                onPress={() => setSelectedIdx(i)}>
                <View style={[styles.trendBarContainer, { height: BAR_HEIGHT }]}>
                  <View
                    style={[
                      styles.trendBar,
                      {
                        height: barH,
                        backgroundColor: overBudget ? C.red : C.teal,
                        opacity: isSelected ? 1 : 0.4,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.trendLabel, { color: isSelected ? C.white : C.gray }]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.trendDivider} />
        <MonthCategoryBreakdown
          transactions={transactions}
          year={sel.year}
          month={sel.month}
          total={sel.total}
        />
      </View>
    </View>
  );
}

// ─── Export Section ───────────────────────────────────────────────────────────
function ExportSection({ transactions }: { transactions: Transaction[] }) {
  async function handleExport() {
    const sorted = [...transactions].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    const header = 'Date,Amount,Category,Note';
    const rows = sorted.map(tx => {
      const date = tx.createdAt.toISOString().split('T')[0];
      const amount = (tx.amountCents / 100).toFixed(2);
      const label = CAT_LABELS[tx.categoryIcon] ?? tx.categoryIcon;
      const note = `"${tx.note.replace(/"/g, '""')}"`;
      return `${date},${amount},${label},${note}`;
    });
    const csv = [header, ...rows].join('\n');
    try {
      await Share.share({ message: csv, title: 'Budget Export' });
    } catch {
      // share dismissed, nothing to do
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Export</Text>
      <TouchableOpacity style={styles.exportBtn} activeOpacity={0.85} onPress={handleExport}>
        <Text style={styles.exportBtnIcon}>📤</Text>
        <View>
          <Text style={styles.exportBtnTitle}>Export as CSV</Text>
          <Text style={styles.exportBtnSub}>
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ReportsScreen({
  transactions,
  incomeCents,
  budgetCents,
  onNavigateToDashboard,
  onNavigateToTransactions,
  onNavigateToBudgets,
}: {
  transactions: Transaction[];
  incomeCents: number;
  budgetCents: number;
  onNavigateToDashboard: () => void;
  onNavigateToTransactions: () => void;
  onNavigateToBudgets: () => void;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <MonthlySummary
          transactions={transactions}
          budgetCents={budgetCents}
          incomeCents={incomeCents}
        />
        <SpendingByCategory transactions={transactions} />
        <MonthlyTrend transactions={transactions} budgetCents={budgetCents} />
        <ExportSection transactions={transactions} />
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavTab icon="🏠"  label="Home"         onPress={onNavigateToDashboard} />
        <NavTab icon="💳"  label="Transactions" onPress={onNavigateToTransactions} />
        <NavTab icon="📊"  label="Budgets"      onPress={onNavigateToBudgets} />
        <NavTab icon="📈"  label="Reports"      active />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingVertical: 16, alignItems: 'center' },
  headerTitle: { color: C.white, fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  section: { marginBottom: 24 },
  sectionTitle: { color: C.white, fontSize: 16, fontWeight: '700', marginBottom: 10 },

  card: { backgroundColor: C.card, borderRadius: 16, padding: 16 },
  emptyText: { color: C.gray, fontSize: 14, textAlign: 'center', paddingVertical: 8 },

  // Monthly Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryLabel: { color: C.gray, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  summaryAmount: { color: C.white, fontSize: 22, fontWeight: '800', marginTop: 2 },
  summaryDiff: { fontSize: 12, marginTop: 2 },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3 },

  // Spending by Category
  catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  catDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catName: { color: C.white, fontSize: 13, fontWeight: '500', marginBottom: 5 },
  catBarRow: { flexDirection: 'row', alignItems: 'center' },
  catBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  catBarFill: { height: 8, backgroundColor: C.teal, borderRadius: 4 },
  catAmount: { color: C.white, fontSize: 13, fontWeight: '600', minWidth: 72, textAlign: 'right' },

  // Monthly Trend chart
  trendBudgetLabel: { color: C.gray, fontSize: 11, marginBottom: 8 },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    position: 'relative',
  },
  trendRefLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,201,167,0.35)',
    borderStyle: 'dashed',
  },
  trendCol: { flex: 1, alignItems: 'center' },
  trendBarContainer: { justifyContent: 'flex-end', width: '60%' },
  trendBar: { width: '100%', borderRadius: 4 },
  trendLabel: { fontSize: 11, marginTop: 6 },
  trendDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 16,
    marginBottom: 12,
  },

  // Month category detail (inside trend card)
  detailContainer: { paddingTop: 4 },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailMonth: { color: C.white, fontSize: 13, fontWeight: '600' },
  detailTotal: { color: C.teal, fontSize: 13, fontWeight: '700' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailCatIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  detailCatLabel: { color: C.gray, fontSize: 12, width: 72 },
  detailBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  detailBarFill: { height: 6, backgroundColor: C.teal, borderRadius: 3 },
  detailCatAmount: { color: C.white, fontSize: 12, fontWeight: '600', minWidth: 64, textAlign: 'right' },

  // Export
  exportBtn: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,201,167,0.2)',
  },
  exportBtnIcon: { fontSize: 22, marginRight: 14 },
  exportBtnTitle: { color: C.white, fontSize: 15, fontWeight: '600' },
  exportBtnSub: { color: C.gray, fontSize: 12, marginTop: 2 },

  // Nav
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
