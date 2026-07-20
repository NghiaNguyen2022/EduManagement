param(
    [string]$MySql = "mysql",
    [string]$User = "root"
)

$scriptPath = Join-Path $PSScriptRoot "007_fix_utf8_seed_data.sql"

if (-not (Test-Path $scriptPath)) {
    throw "Không tìm thấy file SQL: $scriptPath"
}

Write-Host "Đang sửa dữ liệu UTF-8..."

# Không dùng Get-Content | mysql vì PowerShell có thể đổi encoding.
# Dùng cmd redirection để mysql đọc trực tiếp bytes UTF-8 của file.
$command = "`"$MySql`" --default-character-set=utf8mb4 -u $User -p SchoolCenter < `"$scriptPath`""

cmd /d /s /c $command

if ($LASTEXITCODE -ne 0) {
    throw "Sửa dữ liệu UTF-8 thất bại."
}

Write-Host "Sửa dữ liệu UTF-8 thành công."
