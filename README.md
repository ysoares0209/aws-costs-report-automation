# Welcome to AWS-costs-automated-report
This is a simple CDK app with two AWS services: EventBridge and Lambda.
The goal is to make EventBridge trigger the lambda every week on Monday at 10 GMT.

The lambda uses SDK to access costs explorer, and creates a report with:
- Total month spend
- Total week spend
- Spend by linked account

The report is then sent to slack via HTTP request.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
