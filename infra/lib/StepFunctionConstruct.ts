import { IFunction } from "aws-cdk-lib/aws-lambda";
import { ITopic } from "aws-cdk-lib/aws-sns";
import { IStateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as sfnTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Duration } from "aws-cdk-lib";

interface StepFunctionConstructProps{
    lambdaA: IFunction,
    lambdaB: IFunction,
    snsTopic: ITopic,
}

export class StepFunctionConstruct extends Construct{
    readonly stateMachine : IStateMachine;
constructor(scope: Construct, id: string, props: StepFunctionConstructProps){
    super(scope, id)

    const lambdaATask = new sfnTasks.LambdaInvoke(this, 'LambdaA', {
        lambdaFunction: props.lambdaA,
        outputPath: '$.Payload'
    })

    const lambdaBTask = new sfnTasks.LambdaInvoke(this, 'LambdaB', {
        lambdaFunction: props.lambdaB,
        outputPath: '$.Payload'
    })

    const snsTask = new sfnTasks.SnsPublish(this, 'SNSTask', {
        topic: props.snsTopic,
        message: sfn.TaskInput.fromJsonPathAt('$')
    })

    const definition = lambdaATask.next(lambdaBTask).next(snsTask);

    this.stateMachine = new sfn.StateMachine(this, 'WorkflowStateMachine', {
        definition,
        timeout: Duration.minutes(5),
    });
}
}