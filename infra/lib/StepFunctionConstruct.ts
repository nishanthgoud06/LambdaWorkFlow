import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as sfnTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { IFunction } from 'aws-cdk-lib/aws-lambda';

interface StepFunctionConstructProps {
    lambdaA: IFunction;
    lambdaB: IFunction;
}

export class StepFunctionConstruct extends Construct {
readonly stateMachine: sfn.IStateMachine;

    constructor(scope: Construct, id: string, props: StepFunctionConstructProps) {
    super(scope, id);

    // DynamoDB Table for Execution Tracking
    const table = new dynamodb.Table(this, 'WorkflowExecutionTable', {
        partitionKey: { name: 'ExecutionId', type: dynamodb.AttributeType.STRING },
    });

    // Add Entry to DynamoDB
    const addEntryTask = new sfnTasks.DynamoPutItem(this, 'Add Entry to DynamoDB', {
        table,
        item: {
        ExecutionId: sfnTasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$$.Execution.Id')),
        Task: sfnTasks.DynamoAttributeValue.fromString('ProcessFile'),
        Status: sfnTasks.DynamoAttributeValue.fromString('In Progress'),
        Timestamp: sfnTasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$$.Execution.StartTime')),
        },
    });

    // LambdaA Task
    const lambdaATask = new sfnTasks.LambdaInvoke(this, 'LambdaA', {
        lambdaFunction: props.lambdaA,
        outputPath: '$.Payload',
    });

    // Update DynamoDB for LambdaA Completion
    const updateACompletedTask = new sfnTasks.DynamoUpdateItem(this, 'Update A to Completed', {
        table,
        key: {
        ExecutionId: sfnTasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$$.Execution.Id')),
        },
        updateExpression: 'SET #status = :status, #timestamp = :timestamp',
        expressionAttributeNames: {
        '#status': 'Status',
        '#timestamp': 'Timestamp',
        },
        expressionAttributeValues: {
        ':status': sfnTasks.DynamoAttributeValue.fromString('Completed'),
        ':timestamp': sfnTasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$$.Execution.StartTime')),
        },
    });

    // LambdaB Task
    const lambdaBTask = new sfnTasks.LambdaInvoke(this, 'LambdaB', {
        lambdaFunction: props.lambdaB,
        outputPath: '$.Payload',
    });

    // Update DynamoDB for LambdaB Completion
    const updateBCompletedTask = new sfnTasks.DynamoUpdateItem(this, 'Update B to Completed', {
        table,
        key: {
        ExecutionId: sfnTasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$$.Execution.Id')),
        },
        updateExpression: 'SET #status = :status, #timestamp = :timestamp',
        expressionAttributeNames: {
        '#status': 'Status',
        '#timestamp': 'Timestamp',
        },
        expressionAttributeValues: {
        ':status': sfnTasks.DynamoAttributeValue.fromString('Completed'),
        ':timestamp': sfnTasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$$.Execution.StartTime')),
        },
    });

    const dummyTask = new sfnTasks.LambdaInvoke(this, 'Dummy', {
        lambdaFunction: props.lambdaA,
        outputPath: '$.Payload',
    });

    // Update DynamoDB for Failures
    const updateFailedTask = new sfnTasks.DynamoUpdateItem(this, 'Update to Failed', {
        table,
        key: {
            ExecutionId: sfnTasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$$.Execution.Id')),
        },
        updateExpression: 'SET #status = :status, #timestamp = :timestamp',
        expressionAttributeNames: {
            '#status': 'Status',
            '#timestamp': 'Timestamp',
        },
        expressionAttributeValues: {
            ':status': sfnTasks.DynamoAttributeValue.fromString('Failed'),
            ':timestamp': sfnTasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$$.Execution.StartTime')),
        },
    });

    // Step Function Definition
    const definition = lambdaATask
    .next(
        new sfn.Choice(this, 'Is A Successful?')
        .when(
          sfn.Condition.numberEquals('$.statusCode', 200), // LambdaA success
            lambdaBTask.next(
            new sfn.Choice(this, 'Is B Successful?')
            .when(
                sfn.Condition.numberEquals('$.statusCode', 200), // LambdaB success
                new sfn.Pass(this, 'Success End') // Placeholder for success end
                )
              .otherwise(updateFailedTask) // LambdaB failure
        )
        )
        .otherwise(updateFailedTask) // LambdaA failure
    );

    // Step Function State Machine
    this.stateMachine = new sfn.StateMachine(this, 'WorkflowStateMachine', {
    definition,
        timeout: Duration.minutes(5),
    });
    }
}