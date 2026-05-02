import { open } from '@op-engineering/op-sqlite';
import { Transaction } from './types';

const DB_NAME = 'budget.db';

const db = open({ name: DB_NAME });

export function initDB(): void {
  db.executeSync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id            INTEGER PRIMARY KEY,
      amount_cents  INTEGER NOT NULL,
      category_icon TEXT    NOT NULL,
      category_bg   TEXT    NOT NULL,
      note          TEXT,
      created_at    INTEGER NOT NULL
    );
  `);
  db.executeSync(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value INTEGER NOT NULL
    );
  `);
}

export function loadSettings(): { incomeCents: number; budgetCents: number } {
  const result = db.executeSync('SELECT key, value FROM settings;');
  const map: Record<string, number> = {};
  for (const row of result.rows) {
    map[row.key as string] = row.value as number;
  }
  return {
    incomeCents: map.income_cents ?? 124000,
    budgetCents: map.budget_cents ?? 200000,
  };
}

export function saveSettings(incomeCents: number, budgetCents: number): void {
  db.executeSync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);',
    ['income_cents', incomeCents],
  );
  db.executeSync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);',
    ['budget_cents', budgetCents],
  );
}

export function loadTransactions(): Transaction[] {
  const result = db.executeSync(
    'SELECT * FROM transactions ORDER BY created_at DESC;',
  );
  return result.rows.map(row => ({
    id: row.id as number,
    amountCents: row.amount_cents as number,
    categoryIcon: row.category_icon as string,
    categoryBg: row.category_bg as string,
    note: (row.note ?? '') as string,
    createdAt: new Date(row.created_at as number),
  }));
}

export function insertTransaction(
  tx: Omit<Transaction, 'id'>,
): Transaction {
  const createdAt = tx.createdAt.getTime();
  const result = db.executeSync(
    'INSERT INTO transactions (amount_cents, category_icon, category_bg, note, created_at) VALUES (?, ?, ?, ?, ?);',
    [tx.amountCents, tx.categoryIcon, tx.categoryBg, tx.note, createdAt],
  );
  return {
    ...tx,
    id: result.insertId as number,
  };
}

export function updateTransaction(
  id: number,
  tx: Omit<Transaction, 'id'>,
): void {
  db.executeSync(
    'UPDATE transactions SET amount_cents = ?, category_icon = ?, category_bg = ?, note = ?, created_at = ? WHERE id = ?;',
    [tx.amountCents, tx.categoryIcon, tx.categoryBg, tx.note, tx.createdAt.getTime(), id],
  );
}

export function deleteTransaction(id: number): void {
  db.executeSync('DELETE FROM transactions WHERE id = ?;', [id]);
}
