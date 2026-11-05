#!/usr/bin/env bash
# Run FIRST on a new/lab AWS account. Checks what your credentials may call.
# NOTE: these are list-level checks. They do not prove Lambda->StepFunctions StartExecution works; test that after deploying.
export AWS_PAGER=""
check() { local name="$1"; shift; if "$@" >/dev/null 2>&1; then echo "PASS  $name"; else echo "FAIL  $name"; fi; }
echo "Region: ${AWS_REGION:-${AWS_DEFAULT_REGION:-$(aws configure get region)}}"
check "identity (sts)"              aws sts get-caller-identity
check "IAM role LabRole exists"     aws iam get-role --role-name LabRole
check "Lambda list"                 aws lambda list-functions --max-items 1
check "DynamoDB list"               aws dynamodb list-tables
check "S3 list"                     aws s3api list-buckets
check "API Gateway v2 list"         aws apigatewayv2 get-apis
check "Step Functions list"         aws stepfunctions list-state-machines
check "SNS list"                    aws sns list-topics
check "CloudFormation list"         aws cloudformation list-stacks --max-items 1
check "Bedrock list models"         aws bedrock list-foundation-models
echo "Next: in the Bedrock playground/console, confirm you can actually invoke a model."
