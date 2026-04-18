import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DashboardScreen from './src/screens/DashboardScreen';
import NewExpenseScreen from './src/screens/NewExpenseScreen';
import { Transaction } from './src/types';
import { initDB, insertTransaction, loadTransactions } from './src/db';

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

  return (
    <SafeAreaProvider>
      {screen === 'dashboard' ? (
        <DashboardScreen
          transactions={transactions}
          onAddExpense={() => setScreen('newExpense')}
        />
      ) : (
        <NewExpenseScreen
          onSave={handleSave}
          onCancel={() => setScreen('dashboard')}
        />
      )}
    </SafeAreaProvider>
  );
}
