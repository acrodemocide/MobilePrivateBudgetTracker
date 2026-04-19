import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DashboardScreen from './src/screens/DashboardScreen';
import NewExpenseScreen from './src/screens/NewExpenseScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import { Transaction } from './src/types';
import { initDB, insertTransaction, loadTransactions, deleteTransaction, updateTransaction } from './src/db';

export default function App() {
  const [screen, setScreen] = useState<'dashboard' | 'transactions' | 'newExpense'>('dashboard');
  const [returnScreen, setReturnScreen] = useState<'dashboard' | 'transactions'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    initDB();
    setTransactions(loadTransactions());
  }, []);

  function handleSave(tx: Omit<Transaction, 'id' | 'createdAt'>) {
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
          onAddExpense={() => { setReturnScreen('dashboard'); setScreen('newExpense'); }}
          onDeleteTransaction={handleDelete}
          onEditTransaction={tx => handleEdit(tx, 'dashboard')}
          onNavigateToTransactions={() => setScreen('transactions')}
        />
      ) : screen === 'transactions' ? (
        <TransactionsScreen
          transactions={transactions}
          onDeleteTransaction={handleDelete}
          onEditTransaction={tx => handleEdit(tx, 'transactions')}
          onNavigateToDashboard={() => setScreen('dashboard')}
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
