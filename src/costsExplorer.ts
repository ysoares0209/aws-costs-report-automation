import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  GetCostAndUsageCommandInput,
} from "@aws-sdk/client-cost-explorer";

type Granularity = "DAILY" | "MONTHLY";

const client = new CostExplorerClient({});

export const fetchGroupedCosts = async (
  granularity: Granularity,
  startDate: string,
  endDate: string
): Promise<{ [key: string]: string[] }> => {
  const input: GetCostAndUsageCommandInput = {
    TimePeriod: { Start: startDate, End: endDate },
    Granularity: granularity,
    Metrics: ["AmortizedCost"],
    GroupBy: [{ Type: "DIMENSION", Key: "LINKED_ACCOUNT" }],
  };

  const command = new GetCostAndUsageCommand(input);
  const response = await client.send(command);

  if (!response.DimensionValueAttributes || !response.DimensionValueAttributes.length) {
    throw new Error(`Missing DimensionValueAttributes for granularity: ${granularity}`);
  }
  if (!response.ResultsByTime || !response.ResultsByTime.length) {
    throw new Error(`Missing ResultsByTime for granularity: ${granularity}`);
  }

  const accountNameMapping = response.DimensionValueAttributes.reduce(
    (acc: { [key: string]: string }, dimension) => {
      const { Attributes, Value } = dimension;
      const accountName = Attributes?.description ?? "default";
      const accountId = Value || "default";
      return {
        ...acc,
        [accountId]: accountName,
      };
    },
    {}
  );

  return response.ResultsByTime.reduce((acc: { [key: string]: string[] }, currentTimeFrame) => {
    (currentTimeFrame.Groups || []).forEach((group) => {
      const accountId = group.Keys ? group.Keys[0] : "default";
      const accountName = accountNameMapping[accountId];
      const amount = parseFloat(group.Metrics?.AmortizedCost.Amount || "0.00").toFixed(2);
      if (!acc[accountName]) {
        acc[accountName] = [];
      }
      acc[accountName].push(amount);
    });
    return acc;
  }, {});
};

export const fetchTotalMonthCost = async (startDate: string, endDate: string): Promise<string> => {
  const input: GetCostAndUsageCommandInput = {
    TimePeriod: { Start: startDate, End: endDate },
    Granularity: "MONTHLY",
    Metrics: ["AmortizedCost"],
  };

  const command = new GetCostAndUsageCommand(input);
  const response = await client.send(command);

  if (!response.ResultsByTime || !response.ResultsByTime.length) {
    throw new Error(`Missing ResultsByTime for total monthly cost`);
  }

  const totalAmount = response.ResultsByTime[0].Total?.AmortizedCost.Amount;
  return parseFloat(totalAmount || "0.00").toFixed(2);
};

export const fetchTotalWeeklyCosts = async (
  startDate: string,
  endDate: string
): Promise<string> => {
  const input: GetCostAndUsageCommandInput = {
    TimePeriod: { Start: startDate, End: endDate },
    Granularity: "DAILY",
    Metrics: ["AmortizedCost"],
  };

  const command = new GetCostAndUsageCommand(input);
  const response = await client.send(command);

  if (!response.ResultsByTime || !response.ResultsByTime.length) {
    throw new Error(`Missing ResultsByTime for total daily cost`);
  }

  const totalAmount = response.ResultsByTime.reduce((acc, value) => {
    const amount = parseFloat(value.Total?.AmortizedCost.Amount || "0.00");
    return acc + amount;
  }, 0);
  return totalAmount.toFixed(2);
};
