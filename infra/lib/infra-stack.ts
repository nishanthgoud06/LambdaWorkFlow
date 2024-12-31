import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { LambdaBConstruct } from './LambdaBConstruct';
import { LambdaAConstruct } from './LambdaAConstruct';

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
      const bucket = new Bucket(this, 'DataBucket', {
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const lambdaB = new LambdaBConstruct(this, 'LambdaB', {
      bucketName: bucket
    });

    const lambdaA = new LambdaAConstruct(this, 'LambdaA', {
      lambdaBArn: lambdaB.lambdaFunction.functionArn
    });

    lambdaB.lambdaFunction.grantInvoke(lambdaA.lambdaFunction.role!);
  }
}
