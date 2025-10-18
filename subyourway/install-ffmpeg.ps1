# FFmpeg Installation Script for Windows (No Admin Required)
# This script downloads FFmpeg and adds it to the project

$ffmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
$downloadPath = "$PSScriptRoot\ffmpeg.zip"
$extractPath = "$PSScriptRoot\ffmpeg"

Write-Host "Downloading FFmpeg..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $ffmpegUrl -OutFile $downloadPath

Write-Host "Extracting FFmpeg..." -ForegroundColor Cyan
Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force

# Find the ffmpeg.exe path
$ffmpegExe = Get-ChildItem -Path $extractPath -Recurse -Filter "ffmpeg.exe" | Select-Object -First 1
$ffmpegDir = Split-Path $ffmpegExe.FullName

Write-Host "`nFFmpeg installed successfully!" -ForegroundColor Green
Write-Host "Location: $ffmpegDir" -ForegroundColor Yellow

# Add to PATH for current session
$env:Path += ";$ffmpegDir"

Write-Host "`nTo add FFmpeg to your PATH permanently:" -ForegroundColor Cyan
Write-Host "1. Press Win + X, select 'System'" -ForegroundColor White
Write-Host "2. Click 'Advanced system settings'" -ForegroundColor White
Write-Host "3. Click 'Environment Variables'" -ForegroundColor White
Write-Host "4. Under 'User variables', select 'Path' and click 'Edit'" -ForegroundColor White
Write-Host "5. Click 'New' and add: $ffmpegDir" -ForegroundColor Yellow
Write-Host "`nOr just use it from this session!" -ForegroundColor Green

# Clean up
Remove-Item $downloadPath

# Test FFmpeg
Write-Host "`nTesting FFmpeg..." -ForegroundColor Cyan
& "$ffmpegDir\ffmpeg.exe" -version | Select-Object -First 1

