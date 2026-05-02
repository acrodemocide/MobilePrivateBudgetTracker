import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DashboardScreen from './src/screens/DashboardScreen';
import NewExpenseScreen from './src/screens/NewExpenseScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import BudgetsScreen from './src/screens/BudgetsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import { Transaction } from './src/types';
import { initDB, insertTransaction, loadTransactions, deleteTransaction, updateTransaction, loadSettings, saveSettings } from './src/db';

export default function App() {
  const [screen, setScreen] = useState<'dashboard' | 'transactions' | 'newExpense' | 'budgets' | 'reports'>('dashboard');
  const [returnScreen, setReturnScreen] = useState<'dashboard' | 'transactions'>('dashboard');
  const [incomeCents, setIncomeCents] = useState(124000);
  const [budgetCents, setBudgetCents] = useState(200000);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    initDB();
    setTransactions(loadTransactions());
    const settings = loadSettings();
    setIncomeCents(settings.incomeCents);
    setBudgetCents(settings.budgetCents);
  }, []);

  function handleSave(tx: Omit<Transaction, 'id'>) {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, tx);
      setTransactions(prev =>
        prev.map(t => t.id === editingTransaction.id ? { ...t, ...tx } : t),
      );
      setEditingTransaction(null);
    } else {
      const saved = insertTransaction(tx);
      setTransactions(prev => [saved, ...prev]);
    }
    setScreen(returnScreen);
  }

  function handleCancel() {
    setEditingTransaction(null);
    setScreen(returnScreen);
  }

  function handleEdit(tx: Transaction, from: 'dashboard' | 'transactions') {
    setEditingTransaction(tx);
    setReturnScreen(from);
    setScreen('newExpense');
  }

  function handleDelete(id: number) {
    deleteTransaction(id);
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      {screen === 'dashboard' ? (
        <DashboardScreen
          transactions={transactions}
          incomeCents={incomeCents}
          budgetCents={budgetCents}
          onAddExpense={() => { setReturnScreen('dashboard'); setScreen('newExpense'); }}
          onDeleteTransaction={handleDelete}
          onEditTransaction={tx => handleEdit(tx, 'dashboard')}
          onNavigateToTransactions={() => setScreen('transactions')}
          onNavigateToBudgets={() => setScreen('budgets')}
          onNavigateToReports={() => setScreen('reports')}
        />
      ) : screen === 'transactions' ? (
        <TransactionsScreen
          transactions={transactions}
          onDeleteTransaction={handleDelete}
          onEditTransaction={tx => handleEdit(tx, 'transactions')}
          onNavigateToDashboard={() => setScreen('dashboard')}
          onNavigateToBudgets={() => setScreen('budgets')}
          onNavigateToReports={() => setScreen('reports')}
        />
      ) : screen === 'budgets' ? (
        <BudgetsScreen
          incomeCents={incomeCents}
          budgetCents={budgetCents}
          onSave={(income, budget) => {
            saveSettings(income, budget);
            setIncomeCents(income);
            setBudgetCents(budget);
            setScreen('dashboard');
          }}
          onNavigateToDashboard={() => setScreen('dashboard')}
          onNavigateToTransactions={() => setScreen('transactions')}
          onNavigateToReports={() => setScreen('reports')}
        />
      ) : screen === 'reports' ? (
        <ReportsScreen
          transactions={transactions}
          incomeCents={incomeCents}
          budgetCents={budgetCents}
          onNavigateToDashboard={() => setScreen('dashboard')}
          onNavigateToTransactions={() => setScreen('transactions')}
          onNavigateToBudgets={() => setScreen('budgets')}
        />
      ) : (
        <NewExpenseScreen
          onSave={handleSave}
          onCancel={handleCancel}
          existingTransaction={editingTransaction ?? undefined}
        />
      )}
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
