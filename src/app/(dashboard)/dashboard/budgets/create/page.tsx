import { CreateBudgetForm } from "@/src/components/budget/CreateBudgetForm";

export default function CreateBudgetPage() {
  const currentUserId = BigInt(1);

  return (
    <div className="min-h-screen bg-spoket-cream p-4 pb-28">
      <CreateBudgetForm userId={currentUserId.toString()} />
    </div>
  );
}