# PowerShell script to format SQL for Supabase execution
# This will display the SQL content in a formatted way for easy copy-paste

Write-Host "🚀 Formatting SQL for Supabase Dashboard execution..." -ForegroundColor Green
Write-Host ""

# Read the urgent-database-fix.sql file
$sqlContent = Get-Content "urgent-database-fix.sql" -Raw

Write-Host "📄 SQL Content for Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host ""

# Display the SQL content
Write-Host $sqlContent -ForegroundColor White

Write-Host ""
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "📋 Instructions:" -ForegroundColor Cyan
Write-Host "1. Copy the SQL content above" -ForegroundColor White
Write-Host "2. Go to your Supabase Dashboard" -ForegroundColor White
Write-Host "3. Navigate to SQL Editor" -ForegroundColor White
Write-Host "4. Paste the SQL content" -ForegroundColor White
Write-Host "5. Click 'Run' to execute" -ForegroundColor White
Write-Host "6. Verify the success message appears" -ForegroundColor White
Write-Host ""

Write-Host "✅ SQL formatted successfully!" -ForegroundColor Green
