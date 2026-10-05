import { prisma } from "@/src/lib/prisma";

export interface MonthlyFinanceItem {
  monthNum: number;
  monthName: string;
  income: number;
  expense: number;
}

export async function getWalletsDashboardData(userId: bigint, targetYear: number) {
  const [wallets, aggregateTotal, monthlyFlowRaw, availableYearsRaw] = await Promise.all([
    // 1. Ambil seluruh list dompet
    prisma.wallet.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        currentBalance: true,
      },
      orderBy: { createdAt: "asc" },
    }),

    // 2. Hitung TOTAL SALDO langsung dari PostgreSQL
    prisma.wallet.aggregate({
      where: { userId },
      _sum: {
        currentBalance: true,
      },
    }),

    // 3. Query 12 bulan untuk grafik
    prisma.$queryRaw<
      Array<{
        month_num: number;
        month_name: string;
        total_income: string | number;
        total_expense: string | number;
      }>
    >`
      WITH months AS (
        SELECT generate_series(1, 12) AS m
      )
      SELECT 
        m.m AS month_num,
        TO_CHAR(TO_DATE(m.m::text, 'MM'), 'Mon') AS month_name,
        COALESCE(SUM(CASE WHEN t.type::text = 'INCOME' THEN t.amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN t.type::text = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS total_expense
      FROM months m
      LEFT JOIN transactions t 
        ON EXTRACT(MONTH FROM t.transaction_date) = m.m 
        AND EXTRACT(YEAR FROM t.transaction_date) = ${targetYear}
        AND t.user_id = ${userId}
      GROUP BY m.m
      ORDER BY m.m ASC;
    `,

    // 4. Ambil HANYA TAHUN YANG ADA TRANSAKSINYA
    prisma.$queryRaw<Array<{ year: number }>>`
      SELECT DISTINCT EXTRACT(YEAR FROM transaction_date)::integer AS year
      FROM transactions
      WHERE user_id = ${userId} AND transaction_date IS NOT NULL
      ORDER BY year DESC;
    `,
  ]);

  const totalBalance = Number(aggregateTotal._sum.currentBalance || 0);

  const chartData: MonthlyFinanceItem[] = monthlyFlowRaw.map((d) => ({
    monthNum: Number(d.month_num),
    monthName: d.month_name,
    income: Number(d.total_income),
    expense: Number(d.total_expense),
  }));

  // Ekstrak daftar tahun, fallback ke [targetYear] jika database transaksi masih kosong
  const extractedYears = availableYearsRaw.map((y) => Number(y.year));
  const availableYears =
    extractedYears.length > 0
      ? extractedYears
      : [targetYear];

  return {
    totalBalance,
    wallets: wallets.map((w) => ({
      id: w.id.toString(),
      name: w.name,
      balance: Number(w.currentBalance),
    })),
    chartData,
    availableYears,
  };
}