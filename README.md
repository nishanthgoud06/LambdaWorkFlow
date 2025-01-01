# LambdaWorkFlow

`LambdaWorkFlow` is a serverless application designed to demonstrate a seamless workflow involving **AWS Lambda**, **AWS S3**, and **AWS CDK**. This project integrates Java-based Lambda functions with infrastructure-as-code (IaC) to enable scalable and automated workflows for modern data engineering tasks.

---

## Features

### Serverless Architecture

- Uses **AWS Lambda** for executing functions with low latency and high scalability.
- Supports event-driven workflows for efficient data processing.

### Infrastructure Automation

- Built using **AWS Cloud Development Kit (CDK)** in **TypeScript**.
- Manages resources programmatically, including Lambda functions, S3 buckets, and IAM roles.

### Java Lambda Handlers

- Custom Java-based Lambda handlers implementing business logic.
  - **LambdaA**: Initiates workflows and triggers downstream Lambda functions.
  - **LambdaB**: Processes data and stores results in an S3 bucket.

### S3 Integration

- Stores data outputs and artifacts in a secure S3 bucket.
- Dynamically retrieves bucket configuration from environment variables.

---

## Tech Stack

### Programming Languages

- **Java**: Lambda function handlers.
- **TypeScript**: AWS CDK infrastructure.

### AWS Services

- **AWS Lambda**: Serverless compute.
- **Amazon S3**: Secure data storage.
- **AWS IAM**: Role-based access control for resources.

### Build Tools

- **Maven**: For building Java Lambda functions.
- **Node.js**: For managing CDK dependencies.

---

## How It Works

1. **Lambda Workflow**:

   - **LambdaA** is triggered with input parameters.
   - It invokes **LambdaB**, passing the necessary context.
   - **LambdaB** processes the data and uploads results to the S3 bucket.

2. **Infrastructure Deployment**:

   - Infrastructure is defined in **TypeScript** using AWS CDK.
   - Deploys S3 buckets, Lambda functions, and IAM roles in a single step.

3. **Build and Deployment**:
   - Java Lambda functions are packaged into JAR files using Maven.
   - AWS CDK synthesizes and deploys the infrastructure.

---

## Installation

### Prerequisites

- **AWS CLI**: Installed and configured with appropriate credentials.
- **Node.js**: Version 14 or higher.
- **Maven**: Installed for Java builds.
- **AWS CDK**: Installed globally via NPM:
  ```bash
  npm install -g aws-cdk
  ```
### Setup

**Step 1**: Clone the Repository 
    
```bash
    git clone https://github.com/nishanthgoud06/LambdaWorkFlow.git
    cd LambdaWorkFlow
  ```
**Step 2**: Build Java Lambda Functions

Navigate to the functions/ directory and package the Lambda functions:
```bash
cd functions
mvn clean package
```
**Step 3**: Deploy Infrastructure

Navigate to the infra/ directory and deploy the CDK stack:
```bash
cd ../infra
npm install
cdk deploy
```

**Step 4**: Destroy Infrastructure (Important)
```bash
cd infra
cdk destroy
```
