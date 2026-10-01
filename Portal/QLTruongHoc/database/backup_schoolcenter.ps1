param(
    [string]$MySqlDump = "mysqldump",
    [string]$User = "root",
    [string]$Database = "SchoolCenter"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $PSScriptRoot "..\backups"
$backupFile = Join-Path $backupDir "SchoolCenter_$timestamp.sql"

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

Write-Host "Dang backup database $Database..."
& $MySqlDump -u $User -p --routines --triggers --single-transaction $Database |
    Out-File -Encoding utf8 $backupFile

if ($LASTEXITCODE -ne 0) {
    throw "Backup that bai."
}

Write-Host "Backup thanh cong: $backupFile"
