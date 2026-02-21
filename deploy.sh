#!/bin/bash
set -euo pipefail

# Usage:
# export PROJECT_ID=your-gcp-project
# export REGION=us-central1
# ./deploy.sh

PROJECT_ID=${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}
REGION=${REGION:-"us-central1"}
SERVICE_NAME=${SERVICE_NAME:-"yanc-bug-tracker"}

if [ -z "$PROJECT_ID" ]; then
  echo "Project ID not set. Set \$PROJECT_ID or run 'gcloud config set project PROJECT_ID'."
  exit 1
fi

echo "Building assets..."
npm ci
npm run build

IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:$(date +%s)"

echo "Building container image ${IMAGE}..."
docker build -t "${IMAGE}" .

echo "Pushing image..."
docker push "${IMAGE}"

echo "Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" --image "${IMAGE}" --region "${REGION}" --platform managed --allow-unauthenticated

echo "Deployment complete."

