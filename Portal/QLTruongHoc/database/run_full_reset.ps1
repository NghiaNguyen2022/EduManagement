param(
    [string]$MySql = "mysql",
    [string]$User = "root"
)

$scriptPath = Join-Path $PSScriptRoot "006_full_reset_schoolcenter.sql"

if (-not (Test-Path $scriptPath)) {
    throw "Không tìm thấy file SQL: $scriptPath"
}

Write-Host "CẢNH BÁO: Sẽ xóa toàn bộ database SchoolCenter."
$confirmation = Read-Host "Nhập RESET-SCHOOLCENTER để tiếp tục"

if ($confirmation -ne "RESET-SCHOOLCENTER") {
    Write-Host "Đã hủy."
    exit 1
}

# Không truyền SQL bằng PowerShell pipeline.
# mysql phải đọc trực tiếp file UTF-8 để giữ nguyên tiếng Việt.
$command = "`"$MySql`" --default-character-set=utf8mb4 -u $User -p < `"$scriptPath`""

cmd /d /s /c $command

if ($LASTEXITCODE -ne 0) {
    throw "Reset database thất bại."
}

Write-Host "Reset database thành công."
Write-Host "Tiếp theo chạy: pnpm db:seed:auth"
