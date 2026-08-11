param(
  [string]$BasePath = "/app-portal/edu-management/"
)

$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $projectRoot

$previousNodeEnv = $env:NODE_ENV
$previousBasePath = $env:VITE_APP_BASE_PATH

try {
  $env:NODE_ENV = "production"
  $env:VITE_APP_BASE_PATH = $BasePath

  pnpm typecheck
  if ($LASTEXITCODE -ne 0) { throw "Typecheck không đạt." }

  pnpm test
  if ($LASTEXITCODE -ne 0) { throw "Automated test không đạt." }

  pnpm build
  if ($LASTEXITCODE -ne 0) { throw "Build production không đạt." }
}
finally {
  $env:NODE_ENV = $previousNodeEnv
  $env:VITE_APP_BASE_PATH = $previousBasePath
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$releaseRoot = Join-Path $projectRoot "releases"
$packageName = "qltruonghoc-cpanel-vireon-$timestamp"
$packageRoot = Join-Path $releaseRoot $packageName
$zipPath = Join-Path $releaseRoot "$packageName.zip"

New-Item -ItemType Directory -Path $packageRoot -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $packageRoot "deploy") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $packageRoot "database") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $packageRoot "uploads") -Force | Out-Null

Copy-Item "dist-client" $packageRoot -Recurse
Copy-Item "dist-server" $packageRoot -Recurse
Copy-Item "deploy\cpanel\app_wrapper.cjs" $packageRoot
Copy-Item "deploy\cpanel\package.json" $packageRoot
Copy-Item "deploy\cpanel\package-lock.json" $packageRoot
Copy-Item "deploy\cpanel\README_CPANEL.md" (Join-Path $packageRoot "deploy")
Copy-Item "deploy\cpanel\fix-linux-table-case.sql" (Join-Path $packageRoot "deploy")
Copy-Item "deploy\env.production.example" (Join-Path $packageRoot "deploy")
Copy-Item "database\*.sql" (Join-Path $packageRoot "database")

"Thư mục chứa file người dùng tải lên. Giữ nguyên thư mục này khi cập nhật." |
  Set-Content (Join-Path $packageRoot "uploads\README.txt") -Encoding UTF8

Compress-Archive -Path (Join-Path $packageRoot "*") -DestinationPath $zipPath

Write-Host ""
Write-Host "Đã tạo deploy package CloudLinux/cPanel:"
Write-Host $zipPath
Write-Host ""
Write-Host "Thư mục đã đóng gói:"
Write-Host $packageRoot
