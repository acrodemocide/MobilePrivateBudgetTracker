import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DashboardScreen from './src/screens/DashboardScreen';
import NewExpenseScreen from './src/screens/NewExpenseScreen';
import { Transaction } from './src/types';

export default function App() {
  const [screen, setScreen] = useState<'dashboard' | 'newExpense'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  function handleSave(tx: Omit<Transaction, 'id' | 'createdAt'>) {
    setTransactions(prev => [
      { ...tx, id: Date.now(), createdAt: new Date() },
      ...prev,
    ]);
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
