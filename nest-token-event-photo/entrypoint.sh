#!/bin/bash
set -e

echo "[2/4] Configuring AWS CLI to use LocalStack..."
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set region us-east-1

echo "[3/4] Creating S3 bucket 'image-bucket'..."
for i in {1..5}; do
  if aws --endpoint-url=http://localhost:4566 s3 mb s3://image-bucket; then
    echo "Bucket 'image-bucket' created successfully."
    break
  else
    echo "Attempt $i: Bucket 'image-bucket' creation failed or already exists."
    sleep 2
  fi
done

echo "[4/4] Verifying bucket accessibility..."
if aws --endpoint-url=http://localhost:4566 s3 ls s3://image-bucket; then
  echo "Bucket 'image-bucket' is accessible."
else
  echo "Failed to access bucket 'image-bucket'."
  exit 1
fi

echo "LocalStack setup complete."
