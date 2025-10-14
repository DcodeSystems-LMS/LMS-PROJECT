# Simple PowerShell script to test backend audio extraction

Write-Host "Testing Backend Audio Extraction..." -ForegroundColor Green

# Test video URL
$testUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Create request body
$body = @{
    url = $testUrl
} | ConvertTo-Json

Write-Host "Sending request to backend..." -ForegroundColor Yellow

try {
    # Send request to backend
    $response = Invoke-RestMethod -Uri "http://localhost:5173/api/extract-video" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "✅ Backend extraction successful!" -ForegroundColor Green
    Write-Host "Title: $($response.title)" -ForegroundColor Cyan
    Write-Host "Duration: $($response.duration) seconds" -ForegroundColor Cyan
    Write-Host "Total Streams: $($response.streams.Count)" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "🔊 Audio Analysis by Quality:" -ForegroundColor Yellow
    Write-Host "=============================" -ForegroundColor Yellow
    
    foreach ($stream in $response.streams) {
        $hasAudio = $stream.acodec -and $stream.acodec -ne "none"
        $hasSeparateAudio = $stream.audioUrl -ne $null
        $audioStatus = if ($hasAudio) {
            if ($hasSeparateAudio) { "🔊 Separate Audio" } else { "🔊 Combined Audio" }
        } else {
            "🔇 No Audio"
        }
        
        Write-Host "$($stream.quality):" -ForegroundColor White
        Write-Host "  Type: $($stream.type)" -ForegroundColor Gray
        Write-Host "  Audio: $audioStatus" -ForegroundColor $(if ($hasAudio) { "Green" } else { "Red" })
        Write-Host "  Video Codec: $($stream.vcodec)" -ForegroundColor Gray
        Write-Host "  Audio Codec: $($stream.acodec)" -ForegroundColor Gray
        Write-Host "  Format: $($stream.format)" -ForegroundColor Gray
        if ($hasSeparateAudio) {
            Write-Host "  Audio URL: $($stream.audioUrl.Substring(0, [Math]::Min(50, $stream.audioUrl.Length)))..." -ForegroundColor Blue
        }
        Write-Host ""
    }
    
    # Check for 4K quality specifically
    $fourKStream = $response.streams | Where-Object { $_.quality -eq "2160p" }
    if ($fourKStream) {
        Write-Host "🎯 4K (2160p) Stream Analysis:" -ForegroundColor Magenta
        Write-Host "==============================" -ForegroundColor Magenta
        Write-Host "Quality: $($fourKStream.quality)" -ForegroundColor White
        Write-Host "Type: $($fourKStream.type)" -ForegroundColor White
        Write-Host "Has Audio: $($fourKStream.acodec -and $fourKStream.acodec -ne 'none')" -ForegroundColor White
        Write-Host "Audio Codec: $($fourKStream.acodec)" -ForegroundColor White
        Write-Host "Has Separate Audio URL: $($fourKStream.audioUrl -ne $null)" -ForegroundColor White
        if ($fourKStream.audioUrl) {
            Write-Host "Audio URL: $($fourKStream.audioUrl.Substring(0, [Math]::Min(100, $fourKStream.audioUrl.Length)))..." -ForegroundColor Blue
        }
    } else {
        Write-Host "❌ No 4K (2160p) stream found" -ForegroundColor Red
    }
    
    # Summary
    $streamsWithAudio = $response.streams | Where-Object { $_.acodec -and $_.acodec -ne "none" }
    $streamsWithSeparateAudio = $response.streams | Where-Object { $_.audioUrl -ne $null }
    
    Write-Host ""
    Write-Host "📈 Summary:" -ForegroundColor Yellow
    Write-Host "===========" -ForegroundColor Yellow
    Write-Host "Total streams: $($response.streams.Count)" -ForegroundColor White
    Write-Host "Streams with audio: $($streamsWithAudio.Count)" -ForegroundColor White
    Write-Host "Streams with separate audio: $($streamsWithSeparateAudio.Count)" -ForegroundColor White
    $audioCoverage = [Math]::Round(($streamsWithAudio.Count / $response.streams.Count) * 100)
    Write-Host "Audio coverage: $audioCoverage%" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the backend server is running on http://localhost:5173" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
