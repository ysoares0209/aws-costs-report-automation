import { add, sub, startOfWeek, startOfMonth, format } from "date-fns";

interface DateRanges {
  monthDates: {
    startDate: string;
    endDate: string;
  };
  weekDates: {
    startDate: string;
    endDate: string;
  };
}

const formatCostsExplorerDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

export const getDateRanges = (date: Date): DateRanges => {
  // adds one day to end dates as Cost Explorer API is end date exclusive
  const weeklyEndDate = add(startOfWeek(date), { days: 1 });
  const weeklyStartDate = sub(weeklyEndDate, { weeks: 1 });

  const monthlyStartDate = startOfMonth(date);
  const monthlyEndDate = add(date, { days: 1 });

  return {
    monthDates: {
      startDate: formatCostsExplorerDate(monthlyStartDate),
      endDate: formatCostsExplorerDate(monthlyEndDate),
    },
    weekDates: {
      startDate: formatCostsExplorerDate(weeklyStartDate),
      endDate: formatCostsExplorerDate(weeklyEndDate),
    },
  };
};

export const formatReadableDate = (date: string): string => {
  return format(date, "do MMM");
};
