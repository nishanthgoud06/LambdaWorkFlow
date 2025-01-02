import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Duration } from "aws-cdk-lib";

interface LambdaConstructProps {
    functionName: string;
    functionPath: string;
    handler: string;
    environment?: { [key: string]: string };
    memorySize?: number;
    timeout?: number;
}

export const defaultLambdaValues={
    memorySize: 512,
    timeout: 120
}
export class LambdaConstruct extends Construct{
    readonly lambdaFunction: lambda.Function;
    constructor(scope: Construct, id: string, props: LambdaConstructProps) {
        super(scope, id);
    
    
        this.lambdaFunction = new lambda.Function(this, props.functionName, {
            functionName: props.functionName,
            runtime: lambda.Runtime.JAVA_11,
            code: lambda.Code.fromAsset(props.functionPath),
            handler: props.handler,
            environment: props.environment,
            memorySize: props.memorySize?? defaultLambdaValues.memorySize,
            timeout: props.timeout ? Duration.seconds(props.timeout) : Duration.seconds(defaultLambdaValues.timeout)
        })
    
    }
}