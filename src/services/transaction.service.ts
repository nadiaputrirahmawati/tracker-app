import { prisma } from "@/src/lib/prisma";

export interface TransactionItemView {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  description: string;
  categoryName: string;
  walletName: string;
  date: Date;
  dateFormatted: string;
  timeFormatted: string;
}

export interface TransactionGroup {
  dateKey: string;      // "TODAY" | "YESTERDAY" | "DD MMM YYYY"
  label: string;        // "HARI INI", "KEMARIN", dll
  items: TransactionItemView[];
}

export async function getRecentTransactions(
  userId: bigint,
  limit = 20,
  typeFilter?: "ALL" | "INCOME" | "EXPENSE"
): Promise<TransactionGroup[]> {
  const whereClause: any = { userId };
  if (typeFilter && typeFilter !== "ALL") {
    whereClause.type = typeFilter;
  }

  // 1 Kueri efisien bebas N+1
  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    take: limit,
    orderBy: { transactionDate: "desc" },
    include: {
      wallet: { select: { name: true } },
      budget: { select: { name: true } },
    },
  });

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const groupMap = new Map<string, TransactionGroup>();

  for (const t of transactions) {
    const tDate = new Date(t.transactionDate);
    const dateStr = tDate.toISOString().slice(0, 10);

    let dateKey = dateStr;
    let label = tDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).toUpperCase();

    if (dateStr === todayStr) {
      dateKey = "TODAY";
      label = "HARI INI";
    } else if (dateStr === yesterdayStr) {
      dateKey = "YESTERDAY";
      label = "KEMARIN";
    }

    if (!groupMap.has(dateKey)) {
      groupMap.set(dateKey, {
        dateKey,
        label,
        items: [],
      });
    }

    groupMap.get(dateKey)!.items.push({
      id: t.id.toString(),
      amount: Number(t.amount),
      type: t.type as "INCOME" | "EXPENSE" | "TRANSFER",
      description: t.notes || (t.type === "INCOME" ? "Pemasukan Dana" : "Pengeluaran"),
      categoryName: t.budget?.name || (t.type === "INCOME" ? "Pemasukan" : "Perpindahan Dana"),
      walletName: t.wallet?.name || "Kantong Utama",
      date: tDate,
      dateFormatted: tDate.toLocaleDateString("id-ID", { month: "short", day: "numeric" }),
      timeFormatted: tDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    });
  }

  return Array.from(groupMap.values());
}