#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/stacks/pipeline-stack';

const app = new cdk.App();

new PipelineStack(app, 'PipelineStack', {
  accountId: process.env.ACCOUNT_ID,
  region: process.env.ACCOUNT_REGION,
  name: 'TrialApp'    // Add name of the app here
});