#!/usr/bin/env bash
# ==============================================================================
# EPIC-Hour Google Cloud Run Deployment Script (Bash)
# ==============================================================================

SERVICE_NAME="${1:-epic-hour}"
REGION="${2:-asia-south1}"
PROJECT_ID="${3:-epichour-512012}"
GEMINI_API_KEY="${4:-$GEMINI_API_KEY}"

echo "=========================================================="
echo "  EPIC-Hour: Deploying to Google Cloud Run"
echo "=========================================================="
echo "Project ID   : $PROJECT_ID"
echo "Service Name : $SERVICE_NAME"
echo "Region       : $REGION"

if [ -z "$GEMINI_API_KEY" ] && [ -f "backend/.env" ]; then
    GEMINI_API_KEY=$(grep -E '^GEMINI_API_KEY=' backend/.env | cut -d '=' -f2- | tr -d ' "')
fi

ENV_VARS="MOCK_MODE=false"
if [ -n "$GEMINI_API_KEY" ]; then
    echo "Gemini API Key detected. Passing to Cloud Run container."
    ENV_VARS="GEMINI_API_KEY=${GEMINI_API_KEY},MOCK_MODE=false"
else
    echo "No GEMINI_API_KEY detected. Deploying with built-in dual-mode fallback."
fi

echo "Submitting build to Google Cloud Build & deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --source . \
    --project "$PROJECT_ID" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars "$ENV_VARS"

if [ $? -eq 0 ]; then
    echo "Deployment Successful!"
    SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --project "$PROJECT_ID" --region "$REGION" --format="value(status.url)")
    echo "Live Cloud Run URL: $SERVICE_URL"
else
    echo "Deployment failed. Check the logs above."
fi
