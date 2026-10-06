import { getWalletsDashboardData } from "@/src/services/wallet.service";
import { AnnualFinanceChart } from "@/src/components/wallets/IncomeBarChart";
import { WalletList } from "@/src/components/wallets/WalletList";
import { WalletsDashboardClient } from "@/src/components/wallets/WalletViewTabs";

interface PageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function WalletsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  const currentYear = resolvedParams.year ? parseInt(resolvedParams.year, 10) : 2026;
  const currentUserId = BigInt(1);
  const data = await getWalletsDashboardData(currentUserId, currentYear);

  return (
    <WalletsDashboardClient
      totalBalance={data.totalBalance}
      walletListComponent={
        <WalletList
          initialWallets={data.wallets}
          walletTotalIncome={data.walletTotalIncome}
        />
      }
      analyticsComponent={
        <AnnualFinanceChart
          data={data.chartData}
          selectedYear={currentYear}
          availableYears={data.availableYears}
        />
      }
    />
  );
}