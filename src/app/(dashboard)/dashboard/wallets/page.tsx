import { getWalletsDashboardData } from "@/src/services/wallet.service";
import { AnnualFinanceChart } from "@/src/components/wallets/IncomeBarChart";
import { WalletList } from "@/src/components/wallets/WalletList";
import { WalletCard } from "@/src/components/wallets/WalletCard";
import { Nunito } from "next/font/google";

const roboto = Nunito({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

interface PageProps {
  searchParams: Promise<{ year?: string }>;
  totalBalance: number;
  walletTotalIncome: number
  
}

export default async function WalletsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  const currentYear = resolvedParams.year ? parseInt(resolvedParams.year, 10) : 2026;
  const currentUserId = BigInt(1);
  const data = await getWalletsDashboardData(currentUserId, currentYear);

  return (
    <div className={`flex-1 flex flex-col bg-[#062828] ${roboto.className}`}>
      <WalletCard totalBalance={data.totalBalance} />

      <div className="flex-1 bg-white rounded-t-[36px] pt-9 px-4 pb-32 space-y-5 shadow-2xl relative z-10 mt-2">
        <AnnualFinanceChart
          data={data.chartData}
          selectedYear={currentYear}
          availableYears={data.availableYears}
        />

        <WalletList 
          initialWallets={data.wallets} 
          walletTotalIncome={data.walletTotalIncome} 
        />
      </div>
    </div>
  );
}