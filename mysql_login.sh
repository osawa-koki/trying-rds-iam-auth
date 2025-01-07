#!/bin/bash

source .env

OUTPUTS=$(aws cloudformation describe-stacks --stack-name ${BASE_STACK_NAME}-output --query 'Stacks[0].Outputs' --output json)
AURORA_ENDPOINT=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey == "AuroraEndpoint") | .OutputValue')
AURORA_PORT=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey == "AuroraPort") | .OutputValue')

echo "AURORA_ENDPOINT: $AURORA_ENDPOINT"
echo "AURORA_PORT: $AURORA_PORT"

IAM_USER_NAME="aurora-db-user"
echo "IAM_USER_NAME: $IAM_USER_NAME"

TOKEN=$(aws rds generate-db-auth-token \
  --hostname $AURORA_ENDPOINT \
  --port $AURORA_PORT \
  --region ap-northeast-1 \
  --username $IAM_USER_NAME)
echo "TOKEN: $TOKEN"

wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -O ./rds-ca-2019-root.pem

mysql -h $AURORA_ENDPOINT -P $AURORA_PORT -u $IAM_USER_NAME --password="$TOKEN" --ssl-ca=./rds-ca-2019-root.pem
