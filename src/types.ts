export interface Transaction {
  id: number;
  amountCents: number;
  categoryIcon: string;
  categoryBg: string;
  note: string;
  createdAt: Date;
}
