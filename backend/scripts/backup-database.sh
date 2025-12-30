#!/bin/bash

###############################################################################
# TabSync - Database Backup Script
#
# Purpose: Automated database backup with retention policy
# Usage: ./scripts/backup-database.sh [full|schema|data|critical]
# Schedule: Run via cron or Azure Container Jobs
#
# Environment Variables Required:
# - DATABASE_URL: PostgreSQL connection string
# - BACKUP_STORAGE_PATH: Local or Azure Blob path
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_STORAGE_PATH:-${SCRIPT_DIR}/../backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_SHORT=$(date +%Y%m%d)
RETENTION_DAYS=90

# Database connection
DB_URL="${DATABASE_URL}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than ${RETENTION_DAYS} days..."

    find "${BACKUP_DIR}" -name "*.dump" -type f -mtime +${RETENTION_DAYS} -delete
    find "${BACKUP_DIR}" -name "*.sql" -type f -mtime +${RETENTION_DAYS} -delete

    log_info "Cleanup completed"
}

# Full database backup
backup_full() {
    local backup_file="${BACKUP_DIR}/full_backup_${TIMESTAMP}.dump"

    log_info "Starting full database backup..."
    log_info "Output: ${backup_file}"

    pg_dump "${DB_URL}" \
        --format=custom \
        --compress=9 \
        --verbose \
        --file="${backup_file}" \
        2>&1 | grep -v "^pg_dump:"

    if [ -f "${backup_file}" ]; then
        local size=$(du -h "${backup_file}" | cut -f1)
        log_info "Full backup completed successfully (${size})"

        # Create latest symlink
        ln -sf "$(basename ${backup_file})" "${BACKUP_DIR}/latest_full.dump"

        return 0
    else
        log_error "Backup failed - file not created"
        return 1
    fi
}

# Schema-only backup
backup_schema() {
    local backup_file="${BACKUP_DIR}/schema_${DATE_SHORT}.sql"

    log_info "Starting schema backup..."

    pg_dump "${DB_URL}" \
        --schema-only \
        --no-owner \
        --no-acl \
        --file="${backup_file}"

    if [ -f "${backup_file}" ]; then
        log_info "Schema backup completed successfully"
        return 0
    else
        log_error "Schema backup failed"
        return 1
    fi
}

# Data-only backup
backup_data() {
    local backup_file="${BACKUP_DIR}/data_${TIMESTAMP}.sql"

    log_info "Starting data backup..."

    pg_dump "${DB_URL}" \
        --data-only \
        --no-owner \
        --no-acl \
        --file="${backup_file}"

    if [ -f "${backup_file}" ]; then
        log_info "Data backup completed successfully"
        return 0
    else
        log_error "Data backup failed"
        return 1
    fi
}

# Critical tables backup (users, orders, payments)
backup_critical() {
    local backup_file="${BACKUP_DIR}/critical_${TIMESTAMP}.dump"

    log_info "Starting critical tables backup..."

    pg_dump "${DB_URL}" \
        --format=custom \
        --compress=9 \
        --table=users \
        --table=restaurants \
        --table=orders \
        --table=order_items \
        --table=payments \
        --table=split_payments \
        --table=table_sessions \
        --file="${backup_file}"

    if [ -f "${backup_file}" ]; then
        log_info "Critical tables backup completed successfully"
        return 0
    else
        log_error "Critical tables backup failed"
        return 1
    fi
}

# Verify backup integrity
verify_backup() {
    local backup_file=$1

    log_info "Verifying backup integrity..."

    if [ "${backup_file##*.}" == "dump" ]; then
        # Custom format - verify with pg_restore
        pg_restore --list "${backup_file}" > /dev/null 2>&1
    else
        # SQL format - check if it's valid SQL
        head -n 10 "${backup_file}" | grep -q "PostgreSQL database dump"
    fi

    if [ $? -eq 0 ]; then
        log_info "Backup verification successful"
        return 0
    else
        log_error "Backup verification failed"
        return 1
    fi
}

# Generate backup report
generate_report() {
    local backup_type=$1
    local backup_file=$2

    log_info "Generating backup report..."

    cat > "${BACKUP_DIR}/backup_report_${TIMESTAMP}.txt" <<EOF
TabSync - Database Backup Report
=================================

Backup Type: ${backup_type}
Timestamp: $(date)
Backup File: ${backup_file}
File Size: $(du -h "${backup_file}" 2>/dev/null | cut -f1)

Database Info:
- Host: $(echo ${DB_URL} | sed 's/.*@\(.*\):.*/\1/')
- Database: postgres

Statistics:
$(psql "${DB_URL}" -t -c "
SELECT
    'Tables: ' || COUNT(DISTINCT tablename)::text
FROM pg_tables
WHERE schemaname = 'public';
")

$(psql "${DB_URL}" -t -c "
SELECT
    'Total Rows: ' || SUM(n_live_tup)::text
FROM pg_stat_user_tables;
")

$(psql "${DB_URL}" -t -c "
SELECT
    'Database Size: ' || pg_size_pretty(pg_database_size('postgres'));
")

Backup Files in ${BACKUP_DIR}:
$(ls -lh "${BACKUP_DIR}" | tail -n +2)

EOF

    log_info "Report generated: backup_report_${TIMESTAMP}.txt"
}

# Main execution
main() {
    local backup_type="${1:-full}"

    log_info "==================================="
    log_info "TabSync Database Backup"
    log_info "Type: ${backup_type}"
    log_info "==================================="

    # Check if pg_dump is available
    if ! command -v pg_dump &> /dev/null; then
        log_error "pg_dump is not installed or not in PATH"
        exit 1
    fi

    # Validate database connection
    if ! psql "${DB_URL}" -c "SELECT 1" > /dev/null 2>&1; then
        log_error "Cannot connect to database"
        exit 1
    fi

    # Perform backup based on type
    case "${backup_type}" in
        full)
            backup_full
            BACKUP_FILE="${BACKUP_DIR}/full_backup_${TIMESTAMP}.dump"
            ;;
        schema)
            backup_schema
            BACKUP_FILE="${BACKUP_DIR}/schema_${DATE_SHORT}.sql"
            ;;
        data)
            backup_data
            BACKUP_FILE="${BACKUP_DIR}/data_${TIMESTAMP}.sql"
            ;;
        critical)
            backup_critical
            BACKUP_FILE="${BACKUP_DIR}/critical_${TIMESTAMP}.dump"
            ;;
        *)
            log_error "Invalid backup type: ${backup_type}"
            log_info "Valid types: full, schema, data, critical"
            exit 1
            ;;
    esac

    # Verify backup
    if verify_backup "${BACKUP_FILE}"; then
        # Generate report
        generate_report "${backup_type}" "${BACKUP_FILE}"

        # Cleanup old backups
        cleanup_old_backups

        log_info "==================================="
        log_info "Backup completed successfully!"
        log_info "==================================="
        exit 0
    else
        log_error "Backup verification failed!"
        exit 1
    fi
}

# Run main function
main "$@"
