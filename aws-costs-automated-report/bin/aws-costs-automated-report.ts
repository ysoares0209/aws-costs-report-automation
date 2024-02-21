#!/usr/bin/env node
import "source-map-support/register";
import { config } from "dotenv";
import * as cdk from "aws-cdk-lib";
import { AwsCostsAutomatedReportStack } from "../lib/aws-costs-automated-report-stack";

config();

const app = new cdk.App();
new AwsCostsAutomatedReportStack(app, "AwsCostsAutomatedReportStack", {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
