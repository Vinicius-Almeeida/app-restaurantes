# TabSync - Database Backup Script (PowerShell)
#
# Purpose: Automated database backup for Windows environments
# Usage: .\scripts\backup-database.ps1 -BackupType [full|schema|data|critical]
#
# Requirements:
# - PostgreSQL client tools (pg_dump, psql)
# - DATABASE_URL environment variable or .env file

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('full','schema','data','critical')]
    [string]$BackupType = 'full',

    [Parameter(Mandatory=$false)]
    [string]$BackupDir = "$PSScriptRoot\..\backups",

    [Parameter(Mandatory=$false)]
    [int]$RetentionDays = 90
)

# Load environment variables from .env
function Load-EnvFile {
    $envFile = Join-Path $PSScriptRoot "..\.env"

    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim().Trim('"')
                [Environment]::SetEnvironmentVariable($key, $value, 'Process')
            }
        }
    }
}

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Main script
Write-Info "==================================="
Write-Info "TabSync Database Backup"
Write-Info "Type: $BackupType"
Write-Info "==================================="

# Load environment
Load-EnvFile

# Get database URL
$dbUrl = $env:DATABASE_URL
if (-not $dbUrl) {
    Write-Error-Custom "DATABASE_URL not found in environment"
    exit 1
}

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Info "Created backup directory: $BackupDir"
}

# Generate timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$dateShort = Get-Date -Format "yyyyMMdd"

# Check if pg_dump is available
if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
    Write-Error-Custom "pg_dump not found. Please install PostgreSQL client tools."
    Write-Info "Download from: https://www.postgresql.org/download/windows/"
    exit 1
}

# Perform backup based on type
$backupSuccess = $false

switch ($BackupType) {
    'full' {
        $backupFile = Join-Path $BackupDir "full_backup_$timestamp.dump"
        Write-Info "Starting full database backup..."
        Write-Info "Output: $backupFile"

        & pg_dump $dbUrl `
            --format=custom `
            --compress=9 `
            --verbose `
            --file=$backupFile

        if ($LASTEXITCODE -eq 0 -and (Test-Path $backupFile)) {
            $size = (Get-Item $backupFile).Length / 1MB
            Write-Info "Full backup completed successfully ($([math]::Round($size, 2)) MB)"
            $backupSuccess = $true

            # Create latest symlink (Windows: copy instead)
            $latestFile = Join-Path $BackupDir "latest_full.dump"
            Copy-Item $backupFile $latestFile -Force
        }
    }

    'schema' {
        $backupFile = Join-Path $BackupDir "schema_$dateShort.sql"
        Write-Info "Starting schema backup..."

        & pg_dump $dbUrl `
            --schema-only `
            --no-owner `
            --no-acl `
            --file=$backupFile

        if ($LASTEXITCODE -eq 0 -and (Test-Path $backupFile)) {
            Write-Info "Schema backup completed successfully"
            $backupSuccess = $true
        }
    }

    'data' {
        $backupFile = Join-Path $BackupDir "data_$timestamp.sql"
        Write-Info "Starting data backup..."

        & pg_dump $dbUrl `
            --data-only `
            --no-owner `
            --no-acl `
            --file=$backupFile

        if ($LASTEXITCODE -eq 0 -and (Test-Path $backupFile)) {
            Write-Info "Data backup completed successfully"
            $backupSuccess = $true
        }
    }

    'critical' {
        $backupFile = Join-Path $BackupDir "critical_$timestamp.dump"
        Write-Info "Starting critical tables backup..."

        & pg_dump $dbUrl `
            --format=custom `
            --compress=9 `
            --table=users `
            --table=restaurants `
            --table=orders `
            --table=order_items `
            --table=payments `
            --table=split_payments `
            --table=table_sessions `
            --file=$backupFile

        if ($LASTEXITCODE -eq 0 -and (Test-Path $backupFile)) {
            Write-Info "Critical tables backup completed successfully"
            $backupSuccess = $true
        }
    }
}

if (-not $backupSuccess) {
    Write-Error-Custom "Backup failed!"
    exit 1
}

# Verify backup
Write-Info "Verifying backup integrity..."
if ($backupFile -like "*.dump") {
    & pg_restore --list $backupFile | Out-Null
} else {
    $content = Get-Content $backupFile -First 10
    if ($content -match "PostgreSQL database dump") {
        Write-Info "Backup verification successful"
    } else {
        Write-Error-Custom "Backup verification failed"
        exit 1
    }
}

# Cleanup old backups
Write-Info "Cleaning up backups older than $RetentionDays days..."
$cutoffDate = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem $BackupDir -Filter "*.dump" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item -Force
Get-ChildItem $BackupDir -Filter "*.sql" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item -Force
Write-Info "Cleanup completed"

# Generate report
$reportFile = Join-Path $BackupDir "backup_report_$timestamp.txt"

$report = @"
TabSync - Database Backup Report
=================================

Backup Type: $BackupType
Timestamp: $(Get-Date)
Backup File: $backupFile
File Size: $([math]::Round((Get-Item $backupFile).Length / 1MB, 2)) MB

Backup Files in ${BackupDir}:
$(Get-ChildItem $BackupDir | Format-Table Name, Length, LastWriteTime | Out-String)

"@

Set-Content -Path $reportFile -Value $report
Write-Info "Report generated: $reportFile"

Write-Info "==================================="
Write-Info "Backup completed successfully!"
Write-Info "==================================="

exit 0
