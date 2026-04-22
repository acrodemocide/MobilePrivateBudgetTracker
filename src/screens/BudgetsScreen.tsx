import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  bg: '#0E1117',
  card: '#1A1D2B',
  cardTeal: '#14594E',
  teal: '#00C9A7',
  white: '#FFFFFF',
  gray: '#8A94A6',
  navBg: '#151820',
};

function dollarsFromCents(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const c = (cents % 100).toString().padStart(2, '0');
  return `${dollars}.${c}`;
}

function centsFromDollars(raw: string): number | null {
  const n = parseFloat(raw.replace(/[^0-9.]/g, ''));
  if (isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
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

function AmountField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <Text style={styles.dollarSign}>$</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholderTextColor={C.gray}
          placeholder="0.00"
          selectionColor={C.teal}
        />
      </View>
    </View>
  );
}

export default function BudgetsScreen({
  incomeCents,
  budgetCents,
  onSave,
  onNavigateToDashboard,
  onNavigateToTransactions,
  onNavigateToReports,
}: {
  incomeCents: number;
  budgetCents: number;
  onSave: (incomeCents: number, budgetCents: number) => void;
  onNavigateToDashboard: () => void;
  onNavigateToTransactions: () => void;
  onNavigateToReports: () => void;
}) {
  const [incomeRaw, setIncomeRaw] = useState(dollarsFromCents(incomeCents));
  const [budgetRaw, setBudgetRaw] = useState(dollarsFromCents(budgetCents));

  const parsedIncome = centsFromDollars(incomeRaw);
  const parsedBudget = centsFromDollars(budgetRaw);
  const canSave = parsedIncome !== null && parsedBudget !== null;

  function handleSave() {
    if (parsedIncome !== null && parsedBudget !== null) {
      onSave(parsedIncome, parsedBudget);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Budgets</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Settings</Text>
            <Text style={styles.sectionSubtitle}>
              Set your monthly income and spending budget. Savings will be calculated automatically.
            </Text>
          </View>

          <View style={styles.card}>
            <AmountField
              label="Monthly Income"
              value={incomeRaw}
              onChange={setIncomeRaw}
            />
            <View style={styles.divider} />
            <AmountField
              label="Monthly Budget"
              value={budgetRaw}
              onChange={setBudgetRaw}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            activeOpacity={0.85}
            disabled={!canSave}
            onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomNav}>
        <NavTab icon="🏠" label="Home"         onPress={onNavigateToDashboard} />
        <NavTab icon="💳"  label="Transactions" onPress={onNavigateToTransactions} />
        <NavTab icon="📊" label="Budgets"       active />
        <NavTab icon="📈" label="Reports"       onPress={onNavigateToReports} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: C.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  field: {
    paddingVertical: 16,
  },
  fieldLabel: {
    color: C.gray,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dollarSign: {
    color: C.teal,
    fontSize: 22,
    fontWeight: '700',
    marginRight: 6,
  },
  input: {
    flex: 1,
    color: C.white,
    fontSize: 28,
    fontWeight: '700',
    padding: 0,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  saveBtn: {
    backgroundColor: C.teal,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
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
