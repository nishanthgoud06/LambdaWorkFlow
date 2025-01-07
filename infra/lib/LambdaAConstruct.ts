import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';

interface LambdaAProps {
  lambdaBArn: string;
}

export class LambdaAConstruct extends Construct {
  readonly lambdaFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaAProps) {
    super(scope, id);

    this.lambdaFunction = new lambda.Function(this, 'LambdaA', {
      functionName: 'LambdaA',
      runtime: lambda.Runtime.JAVA_11,
      handler: 'com.example.LambdaAHandler', // Java handler class
      environment: {
        LAMBDA_B_ARN: props.lambdaBArn, // ARN of Lambda B
      },
      code: lambda.Code.fromAsset('../assets/function.jar'),
      memorySize: 1024, // Allocate memory
      timeout: Duration.seconds(10), // Set timeout
    });
  }
}
