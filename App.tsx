import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DashboardScreen from './src/screens/DashboardScreen';
import NewExpenseScreen from './src/screens/NewExpenseScreen';
import { Transaction } from './src/types';
import { initDB, insertTransaction, loadTransactions, deleteTransaction } from './src/db';

export default function App() {
  const [screen, setScreen] = useState<'dashboard' | 'newExpense'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    initDB();
    setTransactions(loadTransactions());
  }, []);

  function handleSave(tx: Omit<Transaction, 'id' | 'createdAt'>) {
    const saved = insertTransaction(tx);
    setTransactions(prev => [saved, ...prev]);
    setScreen('dashboard');
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
          onAddExpense={() => setScreen('newExpense')}
          onDeleteTransaction={handleDelete}
        />
      ) : (
        <NewExpenseScreen
          onSave={handleSave}
          onCancel={() => setScreen('dashboard')}
        />
      )}
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
