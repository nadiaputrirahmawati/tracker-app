import { getUserWallets } from "@/src/actions/income";
import { IncomeForm } from "@/src/components/income-form";

export default async function IncomePage() {
  const wallets = await getUserWallets();

  return <IncomeForm wallets={wallets} />;
}