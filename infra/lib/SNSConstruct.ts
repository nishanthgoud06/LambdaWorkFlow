import { Construct } from 'constructs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import {
  EmailSubscription,
  SqsSubscription,
} from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue } from 'aws-cdk-lib/aws-sqs';

interface SNSConstructProps {
  emailAddress: string;
}

export class SNSConstruct extends Construct {
  readonly topic: Topic;
  readonly queue: Queue;

  constructor(scope: Construct, id: string, props: SNSConstructProps) {
    super(scope, id);

    // Create an SNS Topic
    this.topic = new Topic(this, 'S3FileAddedTopic', {
      displayName: 'Notification for new S3 objects',
    });

    // Create an SQS Queue
    this.queue = new Queue(this, 'S3EventsQueue');

    // Subscribe SQS Queue to the SNS Topic
    this.topic.addSubscription(new SqsSubscription(this.queue));

    // Subscribe an email address to the SNS Topic
    this.topic.addSubscription(new EmailSubscription(props.emailAddress));
  }
}
