import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DashboardScreen from './src/screens/DashboardScreen';
import NewExpenseScreen from './src/screens/NewExpenseScreen';

export default function App() {
  const [screen, setScreen] = useState<'dashboard' | 'newExpense'>('dashboard');

  return (
    <SafeAreaProvider>
      {screen === 'dashboard' ? (
        <DashboardScreen onAddExpense={() => setScreen('newExpense')} />
      ) : (
        <NewExpenseScreen onCancel={() => setScreen('dashboard')} />
      )}
    </SafeAreaProvider>
  );
}
