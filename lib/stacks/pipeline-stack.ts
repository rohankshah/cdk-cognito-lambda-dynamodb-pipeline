import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { ManualApprovalStep } from "aws-cdk-lib/pipelines";
import { DevStage } from "../stages/stage-dev";
import { ProdStage } from "../stages/stage-prod";
import * as sm from "aws-cdk-lib/aws-secretsmanager";

interface PipelineStackProps extends StackProps {
  accountId: string | undefined;
  region: string | undefined;
  name: string
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const secret = sm.Secret.fromSecretAttributes(this, "GITHUB_TOKEN", {
      secretCompleteArn:
        process.env.GITHUB_PIPELINE_ARN
    });

    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "Pipeline",
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub("REPO_NAME_HERE", "main", {
          authentication: secret?.secretValue,
        }),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });

    // Dev Stage
    pipeline.addStage(
      new DevStage(this, "Dev", {
        env: { account: process.env.ACCOUNT_ID, region: process.env.ACCOUNT_REGION },
        name: 'appName'
      })
    );

    // Prod Stage
    pipeline.addStage(
      new ProdStage(this, "Prod", {
        env: { account: process.env.ACCOUNT_ID, region: process.env.ACCOUNT_REGION },
        name: 'appName'
      }),
      {
        pre: [new ManualApprovalStep("PromoteToProd")],
      }
    );
  }
}
