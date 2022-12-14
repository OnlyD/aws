import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from "aws-cdk-lib/pipelines";

import { Construct } from 'constructs';
import { WorkshopPipelineStage } from './pipeline-stage';

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Creates a CodeCommit repository called 'WorkshopRepo'
        /* const repo = new codecommit.Repository(this, 'WorkshopRepo', {
            repositoryName: "WorkshopRepo"
        }); */

        // The basic pipeline declaration. This sets the initial structure
        // of our pipeline
        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'WorkshopPipeline',
            synth: new CodeBuildStep('SynthStep', {
                input: CodePipelineSource.gitHub("OnlyD/aws", "main", {

                    authentication: cdk.SecretValue.secretsManager('github-access-token-secret'),
                }),
                installCommands: [
                    'npm install -g aws-cdk'
                ],
                commands: [
                    'cd cdk-workshop',
                    'npm ci',
                    'npm run build',
                    'npx cdk synth'
                ],
                primaryOutputDirectory: 'cdk-workshop/cdk.out'
            }
            )
        });
        const deploy = new WorkshopPipelineStage(this, 'Deploy');
        const deployStage = pipeline.addStage(deploy);
    }
}