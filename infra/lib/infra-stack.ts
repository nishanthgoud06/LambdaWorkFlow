import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { LambdaBConstruct } from './LambdaBConstruct';
import { LambdaAConstruct } from './LambdaAConstruct';
import { SNSConstruct } from './SNSConstruct';
import { SnsDestination } from 'aws-cdk-lib/aws-s3-notifications';

export class InfraStack extends Stack {
  readonly bucket: Bucket;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
      this.bucket = new Bucket(this, 'DataBucket', {
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    const snsConstruct = new SNSConstruct(this, 'SNSConstruct', {
      emailAddress: 'gidovi2161@matmayer.com'
    });

    this.bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new SnsDestination(snsConstruct.topic),
      {
        suffix: '.json',
      }
    );

    const lambdaB = new LambdaBConstruct(this, 'LambdaB', {
      bucketName: this.bucket
    });

    const lambdaA = new LambdaAConstruct(this, 'LambdaA', {
      lambdaBArn: lambdaB.lambdaFunction.functionArn
    });

    lambdaB.lambdaFunction.grantInvoke(lambdaA.lambdaFunction.role!);
    
    new CfnOutput(this, 'ConfirmEmail', {
      value: 'Check your email and confirm the subscription to start receiving notifications.',
    });
  }
}
