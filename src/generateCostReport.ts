import { EventBridgeHandler, EventBridgeEvent } from "aws-lambda";
import { getDateRanges } from "./dates";
import { fetchGroupedCosts, fetchTotalMonthCost, fetchTotalWeeklyCosts } from "./costsExplorer";
import { notifySlack } from "./slack";

interface AccountData {
  accountName: string;
  monthlyAmount: string;
  weeklyAmount: string;
}

export const handler: EventBridgeHandler<string, any, void> = async () => {
  try {
    const today = new Date();
    const {
      monthDates: { startDate: monthlyStartDate, endDate: monthlyEndDate },
      weekDates: { startDate: weeklyStartDate, endDate: weeklyEndDate },
    } = getDateRanges(today);

    const [monthTotalCosts, weekTotalCosts, monthlyData, weeklyData] = await Promise.all([
      fetchTotalMonthCost(monthlyStartDate, monthlyEndDate),
      fetchTotalWeeklyCosts(weeklyStartDate, weeklyEndDate),
      fetchGroupedCosts("MONTHLY", monthlyStartDate, monthlyEndDate),
      fetchGroupedCosts("DAILY", weeklyStartDate, weeklyEndDate),
    ]);

    // Assuming the structure of the data returned by fetchGroupedCosts matches the AccountData interface
    const combinedData: AccountData[] = Object.keys(monthlyData)
      .map((accountName) => {
        const monthlyAmount = monthlyData[accountName][0];
        const weeklyAmount = weeklyData[accountName]
          ? weeklyData[accountName].reduce((acc, amount) => acc + parseFloat(amount), 0).toFixed(2)
          : "0.00";
        return {
          accountName,
          monthlyAmount,
          weeklyAmount,
        };
      })
      .filter((account) => !(account.monthlyAmount === "0.00" && account.weeklyAmount === "0.00"))
      .sort((a, b) => parseFloat(b.monthlyAmount) - parseFloat(a.monthlyAmount));

    await notifySlack(
      combinedData,
      { startDate: weeklyStartDate, endDate: weeklyEndDate },
      { monthTotal: monthTotalCosts, weekTotal: weekTotalCosts }
    );
  } catch (error) {
    console.error(error);
  }
};
