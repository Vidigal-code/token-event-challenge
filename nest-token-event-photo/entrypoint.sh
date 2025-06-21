#!/bin/bash
set -e

echo "[1/4] Waiting for LocalStack to be ready..."
until curl -s http://localstack:4566/health | grep -q '"s3": "available"'; do
  echo "Waiting for LocalStack S3 service..."
  sleep 2
done

echo "[2/4] Configuring AWS CLI to use LocalStack..."
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set region us-east-1

echo "[3/4] Creating S3 bucket 'image-bucket'..."
aws --endpoint-url=http://localstack:4566 s3 mb s3://image-bucket || echo "Bucket already exists or failed to create"

echo "[4/4] Creating SNS topic on LocalStack..."
aws --endpoint-url=http://localstack:4566 sns create-topic --name test-sns-topic || echo "SNS topic already exists or failed to create"
aws --endpoint-url=http://localstack:4566 sns list-topics

echo "LocalStack setup complete."