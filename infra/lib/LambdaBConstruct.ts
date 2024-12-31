import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Duration } from "aws-cdk-lib";
import * as path from 'path';

interface LambdaBProps {
    bucketName: Bucket;
}

export class LambdaBConstruct extends Construct {
    lambdaFunction: lambda.Function;
    constructor(scope: Construct, id: string, props: LambdaBProps) {
        super(scope, id);

        this.lambdaFunction = new lambda.Function(this, 'LambdaB', {
            functionName: 'LambdaB',
            runtime: lambda.Runtime.JAVA_11,
            code: lambda.Code.fromAsset('../assets/function.jar'), // Using the resolved path
            handler: 'com.example.LambdaBHandler',
            environment: {
                S3_BUCKET_NAME: props.bucketName.bucketName,
            },
            memorySize: 1024,
            timeout: Duration.seconds(900),
        });

        // Grant permissions for LambdaB to write to the bucket
        props.bucketName.grantWrite(this.lambdaFunction);
    }
}