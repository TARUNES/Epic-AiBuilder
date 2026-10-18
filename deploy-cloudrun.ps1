# ==============================================================================
# EPIC-Hour Google Cloud Run Deployment Script (PowerShell)
# ==============================================================================

param(
    [string]$ServiceName = "epic-hour",
    [string]$Region = "asia-south1",
    [string]$ProjectId = "epichour-512012",
    [string]$GeminiApiKey = ""
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  EPIC-Hour: Deploying to Google Cloud Run" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Project ID   : $ProjectId"
Write-Host "Service Name : $ServiceName"
Write-Host "Region       : $Region"

# If GeminiApiKey not passed via parameter, check backend/.env
if ([string]::IsNullOrWhiteSpace($GeminiApiKey)) {
    if (Test-Path "backend\.env") {
        $envLines = Get-Content "backend\.env"
        foreach ($line in $envLines) {
            if ($line -match "^\s*GEMINI_API_KEY\s*=\s*(.+)$") {
                $GeminiApiKey = $matches[1].Trim()
                break
            }
        }
    }
}

# Build env vars parameter
$envVars = "MOCK_MODE=false"
if (![string]::IsNullOrWhiteSpace($GeminiApiKey)) {
    Write-Host "Gemini API Key detected. Passing to Cloud Run container." -ForegroundColor Green
    $envVars = "GEMINI_API_KEY=$GeminiApiKey,MOCK_MODE=false"
} else {
    Write-Host "No GEMINI_API_KEY detected. Deploying with built-in dual-mode fallback." -ForegroundColor Yellow
}

Write-Host "`nSubmitting build to Google Cloud Build & deploying to Cloud Run..." -ForegroundColor Cyan

gcloud run deploy $ServiceName `
    --source . `
    --project $ProjectId `
    --region $Region `
    --platform managed `
    --allow-unauthenticated `
    --set-env-vars $envVars

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n Deployment Successful!" -ForegroundColor Green
    $serviceUrl = gcloud run services describe $ServiceName --project $ProjectId --region $Region --format="value(status.url)"
    Write-Host "Live Cloud Run URL: $serviceUrl" -ForegroundColor Cyan
} else {
    Write-Host "`n Deployment failed. Check the logs above." -ForegroundColor Red
}
