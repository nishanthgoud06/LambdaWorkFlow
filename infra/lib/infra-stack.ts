import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { SNSConstruct } from './SNSConstruct';
import { SnsDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { LambdaConstruct } from './LambdaConstruct';
import { StepFunctionConstruct } from './StepFunctionConstruct';

export class InfraStack extends Stack {
  readonly bucket: Bucket;
  readonly lambdaA: LambdaConstruct;
  readonly lambdaB: LambdaConstruct;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
      this.bucket = new Bucket(this, 'DataBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    const snsConstruct = new SNSConstruct(this, 'SNSConstruct', {
      emailAddress: 'xoxohok633@nongnue.com'
    });

    this.bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new SnsDestination(snsConstruct.topic),
      {
        suffix: '.json',
      }
    );
    
    this.lambdaB = new LambdaConstruct(this, 'LambdaBConstruct', {
      functionName: "LambdaB",
      functionPath: "../assets/function.jar",
      handler: "com.example.LambdaBHandler",
      environment: {
        S3_BUCKET_NAME: this.bucket.bucketName
      },
      memorySize: 1024,
      timeout: 900
    });

    this.lambdaA = new LambdaConstruct(this, 'LambdaAConstruct', {
      functionName: "LambdaA",
      functionPath: "../assets/function.jar",
      handler: "com.example.LambdaAHandler",
      environment: {
        LAMBDA_B_ARN : this.lambdaB.lambdaFunction.functionArn
      }
    });

    this.lambdaB.lambdaFunction.grantInvoke(this.lambdaA.lambdaFunction);
    this.bucket.grantRead(this.lambdaB.lambdaFunction);
    this.bucket.grantWrite(this.lambdaB.lambdaFunction);

    const orchestration = new StepFunctionConstruct(this, 'Orchestration', {
      lambdaA: this.lambdaA.lambdaFunction,
      lambdaB: this.lambdaB.lambdaFunction
    })

    new CfnOutput(this, 'ConfirmEmail', {
      value: 'Check your email and confirm the subscription to start receiving notifications.',
    });
  }
}
