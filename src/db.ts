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
  tx: Omit<Transaction, 'id' | 'createdAt'>,
): Transaction {
  const createdAt = Date.now();
  const result = db.executeSync(
    'INSERT INTO transactions (amount_cents, category_icon, category_bg, note, created_at) VALUES (?, ?, ?, ?, ?);',
    [tx.amountCents, tx.categoryIcon, tx.categoryBg, tx.note, createdAt],
  );
  return {
    ...tx,
    id: result.insertId as number,
    createdAt: new Date(createdAt),
  };
}
