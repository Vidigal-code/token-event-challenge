#!/bin/bash
set -e
echo "[1/6] Waiting for PostgreSQL service to be ready..."
for i in {1..20}; do
  if (echo > /dev/tcp/postgres/5432) >/dev/null 2>&1; then
    echo "PostgreSQL service is ready."
    break
  else
    echo "Attempt $i: PostgreSQL service not ready yet."
    if [ $i -eq 20 ]; then
      echo "Failed to connect to PostgreSQL after 20 attempts."
      exit 1
    fi
    sleep 3
  fi
done

echo "[2/6] Applying Prisma schema (db push for local docker)..."
PRISMA_HIDE_UPDATE_MESSAGE=true npx prisma db push --skip-generate

echo "[3/7] Generating Prisma client..."
PRISMA_HIDE_UPDATE_MESSAGE=true npx prisma generate

echo "[4/7] Ensuring admin user..."
npm run admin:ensure

echo "[5/7] Waiting for LocalStack S3 service to be ready..."
for i in {1..10}; do
  if aws --endpoint-url=http://localstack:4566 s3api list-buckets >/dev/null 2>&1; then
    echo "LocalStack S3 service is ready."
    break
  else
    echo "Attempt $i: S3 service not ready yet."
    if [ $i -eq 10 ]; then
      echo "Failed to connect to LocalStack S3 service after 10 attempts."
      exit 1
    fi
    sleep 3
  fi
done
echo "[6/7] Configuring AWS CLI to use LocalStack..."
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set region us-east-1
echo "[7/7] Creating S3 bucket 'image-bucket'..."
for i in {1..10}; do
  if aws --endpoint-url=http://localstack:4566 s3 mb s3://image-bucket 2>/dev/null; then
    echo "Bucket 'image-bucket' created successfully."
    break
  elif aws --endpoint-url=http://localstack:4566 s3 ls s3://image-bucket >/dev/null 2>&1; then
    echo "Bucket 'image-bucket' already exists."
    break
  else
    echo "Attempt $i: Bucket 'image-bucket' creation failed."
    if [ $i -eq 10 ]; then
      echo "Failed to create bucket 'image-bucket' after 10 attempts."
      exit 1
    fi
    sleep 3
  fi
done
echo "Verifying bucket accessibility..."
if aws --endpoint-url=http://localstack:4566 s3 ls s3://image-bucket; then
  echo "Bucket 'image-bucket' is accessible."
else
  echo "Failed to access bucket 'image-bucket'."
  exit 1
fi
echo "LocalStack setup complete."
echo "Starting NestJS application..."
exec npm run start:dev