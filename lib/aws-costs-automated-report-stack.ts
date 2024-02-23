import { Construct } from "constructs";
import { Stack, StackProps, Tags, Duration } from "aws-cdk-lib";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

export class AwsCostsAutomatedReportStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambda = new NodejsFunction(this, "generateCostReportLambda", {
      entry: "src/generateCostReport.ts",
      handler: "handler",
      functionName: "GenerateCostReportLambda",
      description: "Lambda for generating AWS spending report",
      runtime: Runtime.NODEJS_20_X,
      logRetention: RetentionDays.TWO_WEEKS,
      environment: {
        SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID || "",
      },
      timeout: Duration.seconds(5),
    });

    // Adding permissions to access Cost Explorer
    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["ce:GetCostAndUsage"],
        resources: ["*"],
      })
    );

    const rule = new Rule(this, "generateCostReportRule", {
      schedule: Schedule.cron({
        minute: "0",
        hour: "10",
        weekDay: "2",
      }),
    });

    rule.addTarget(new LambdaFunction(lambda));

    Tags.of(this).add("name", "costsReport");
    Tags.of(this).add("functionality", "automated-reports");
    Tags.of(lambda).add("name", "costsReport");
    Tags.of(lambda).add("functionality", "automated-reports");
    Tags.of(rule).add("name", "costsReport");
    Tags.of(rule).add("functionality", "automated-reports");
  }
}
