export function calculateDailyAllowance(flexibleBudgetRemaining: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Total hari dalam bulan ini
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = now.getDate();
  
  // Hari tersisa termasuk hari ini
  const daysRemaining = totalDaysInMonth - todayDate + 1;
  
  if (flexibleBudgetRemaining <= 0) return { dailySafe: 0, daysRemaining };
  
  const dailySafe = Math.floor(flexibleBudgetRemaining / daysRemaining);
  return { dailySafe, daysRemaining };
}