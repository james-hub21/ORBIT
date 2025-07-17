# PowerShell script for Vercel deployment
Write-Host "Deploying ORBIT to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "Vercel CLI version: $vercelVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Build the project
Write-Host "Building project..." -ForegroundColor Yellow
npm run build

# Deploy to Vercel
Write-Host "Deploying to Vercel..." -ForegroundColor Green
vercel --prod

Write-Host "Deployment completed! Check your Vercel dashboard for the live URL." -ForegroundColor Green