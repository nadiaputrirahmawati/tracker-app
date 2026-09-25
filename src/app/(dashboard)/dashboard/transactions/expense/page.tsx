import { getExpenseFormData } from "@/src/actions/expense";
import { ExpenseForm } from "@/src/components/expense-form";

export default async function ExpensePage() {
  const data = await getExpenseFormData();

  return <ExpenseForm wallets={data.wallets} budgets={data.budgets} />;
}