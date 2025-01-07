#!/bin/bash

source .env

SECRET_NAME=$(aws cloudformation describe-stacks --stack-name ${BASE_STACK_NAME}-output --query 'Stacks[0].Outputs' --output json | jq -r '.[] | select(.OutputKey == "AuroraSecret") | .OutputValue')

HOST=$(aws secretsmanager get-secret-value --secret-id $SECRET_NAME --region ap-northeast-1 --output text --query SecretString | jq -r '.host')
PORT=$(aws secretsmanager get-secret-value --secret-id $SECRET_NAME --region ap-northeast-1 --output text --query SecretString | jq -r '.port')
USER=$(aws secretsmanager get-secret-value --secret-id $SECRET_NAME --region ap-northeast-1 --output text --query SecretString | jq -r '.username')
PASSWORD=$(aws secretsmanager get-secret-value --secret-id $SECRET_NAME --region ap-northeast-1 --output text --query SecretString | jq -r '.password')

echo "HOST: $HOST"
echo "PORT: $PORT"
echo "USER: $USER"
echo "PASSWORD: $PASSWORD"

mysql -h $HOST -P $PORT -u $USER --password="$PASSWORD"
