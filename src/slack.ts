import axios from "axios";
import { formatReadableDate } from "./dates";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface Totals {
  monthTotal: string;
  weekTotal: string;
}

interface AccountData {
  accountName: string;
  monthlyAmount: string;
  weeklyAmount: string;
}

export const notifySlack = async (
  accountData: AccountData[],
  dates: DateRange,
  totals: Totals
): Promise<void> => {
  const { startDate, endDate } = dates;
  const { monthTotal, weekTotal } = totals;

  const slackChannelId = process.env.SLACK_CHANNEL_ID || "";
  const slackUrl = `https://hooks.slack.com/services/${slackChannelId}`;
  const formattedStartDate = formatReadableDate(startDate);
  const formattedEndDate = formatReadableDate(endDate);

  const payload = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `AWS Spending Report (${formattedStartDate} - ${formattedEndDate})`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Total month costs:* $${monthTotal}\n*Total week costs:* $${weekTotal}`,
        },
      },
      ...accountData.map((data) => {
        const { accountName, monthlyAmount, weeklyAmount } = data;
        return {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `- *${accountName}:* $${monthlyAmount} this month / $${weeklyAmount} this week`,
          },
        };
      }),
    ],
  };

  await axios.request({
    url: slackUrl,
    method: "POST",
    data: JSON.stringify(payload),
    headers: {},
  });
};
