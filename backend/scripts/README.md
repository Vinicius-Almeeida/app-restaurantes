# TabSync - Database Operations Scripts

Collection of scripts for database administration, monitoring, backup, and maintenance.

## Table of Contents

- [Migration Scripts](#migration-scripts)
- [Backup Scripts](#backup-scripts)
- [Monitoring Scripts](#monitoring-scripts)
- [Utility Scripts](#utility-scripts)
- [Automation](#automation)

---

## Migration Scripts

### migrate-enum-safe.js

Safely migrate UserRole enum values.

**Usage:**
```bash
node scripts/migrate-enum-safe.js
```

**What it does:**
- Adds new enum values (SUPER_ADMIN, CONSULTANT, WAITER, KITCHEN)
- Migrates existing ADMIN users to SUPER_ADMIN
- Verifies migration success

**Status:** ✅ Completed (2025-12-27)

### verify-migration.js

Verify enum migration was successful.

**Usage:**
```bash
node scripts/verify-migration.js
```

**Checks:**
- All required roles exist in enum
- No ADMIN users remain
- SUPER_ADMIN users exist
- All users have valid roles
- Prisma Client has correct types

---

## Backup Scripts

### backup-database.ps1 (Windows)

PowerShell script for Windows environments.

**Requirements:**
- PostgreSQL client tools (pg_dump, psql)
- DATABASE_URL environment variable

**Usage:**
```powershell
# Full backup
.\scripts\backup-database.ps1 -BackupType full

# Schema only
.\scripts\backup-database.ps1 -BackupType schema

# Data only
.\scripts\backup-database.ps1 -BackupType data

# Critical tables only
.\scripts\backup-database.ps1 -BackupType critical

# Custom retention
.\scripts\backup-database.ps1 -BackupType full -RetentionDays 30
```

**Output:**
- Backup files in `backend/backups/`
- Backup report with statistics
- Automatic cleanup of old backups

### backup-database.sh (Linux/macOS)

Bash script for Unix-like environments.

**Usage:**
```bash
# Make executable
chmod +x scripts/backup-database.sh

# Full backup
./scripts/backup-database.sh full

# Schema only
./scripts/backup-database.sh schema

# Data only
./scripts/backup-database.sh data

# Critical tables
./scripts/backup-database.sh critical
```

**Features:**
- Compressed backups (gzip level 9)
- Backup verification
- Retention policy enforcement
- Detailed reporting

---

## Monitoring Scripts

### database-health-check.js

Comprehensive database health monitoring.

**Usage:**
```bash
# Console output
node scripts/database-health-check.js

# JSON output
node scripts/database-health-check.js --json

# Check with alerts (exit code based on status)
node scripts/database-health-check.js --alerts
```

**Exit Codes (with --alerts):**
- 0: OK
- 1: WARNING
- 2: CRITICAL or ERROR

**Checks:**
- Database connectivity
- Active connections
- Long-running queries
- Database size
- Table sizes
- User role distribution
- Order metrics (24h)
- Payment metrics (1h)
- Dead tuples (needs VACUUM)
- Index usage
- Active table sessions

**Thresholds:**
```javascript
{
  activeConnections: { warning: 80, critical: 95 },
  longQuerySeconds: { warning: 30, critical: 60 },
  failedPaymentsPerHour: { warning: 5, critical: 20 },
  deadTuples: { warning: 10000, critical: 50000 }
}
```

**Example JSON Output:**
```json
{
  "timestamp": "2025-12-27T05:47:57.714Z",
  "status": "OK",
  "checks": {
    "connectivity": { "status": "OK", "message": "Database connection successful" },
    "connections": { "status": "OK", "value": 5, "max": 100, "percent": 5 },
    "database_size": { "status": "OK", "size": "128 MB" }
  }
}
```

### check-database-structure.js

Inspect database structure and contents.

**Usage:**
```bash
node scripts/check-database-structure.js
```

**Displays:**
- Table existence and columns
- Enum types and values
- User role distribution
- All users in database

---

## Utility Scripts

### create-super-admin.js

Create a new SUPER_ADMIN user.

**Create the script:**
```javascript
// scripts/create-super-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];
  const fullName = process.argv[4];

  if (!email || !password || !fullName) {
    console.error('Usage: node scripts/create-super-admin.js <email> <password> <fullName>');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: 'SUPER_ADMIN',
      emailVerified: true
    }
  });

  console.log('Super admin created:', user.email);
  await prisma.$disconnect();
}

createSuperAdmin();
```

**Usage:**
```bash
node scripts/create-super-admin.js admin@example.com securepass123 "Admin Name"
```

---

## Automation

### Cron Jobs (Linux/macOS)

Edit crontab:
```bash
crontab -e
```

Add schedules:
```cron
# Daily full backup at 2 AM
0 2 * * * cd /path/to/backend && ./scripts/backup-database.sh full >> /var/log/tabsync-backup.log 2>&1

# Hourly health check
0 * * * * cd /path/to/backend && node scripts/database-health-check.js --json >> /var/log/tabsync-health.log 2>&1

# Weekly critical tables backup (Sunday at 3 AM)
0 3 * * 0 cd /path/to/backend && ./scripts/backup-database.sh critical >> /var/log/tabsync-backup.log 2>&1
```

### Windows Task Scheduler

Create scheduled task:
```powershell
# Daily backup at 2 AM
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\path\to\backend\scripts\backup-database.ps1 -BackupType full"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "TabSync-DailyBackup" -Description "Daily database backup"

# Hourly health check
$action = New-ScheduledTaskAction -Execute "node.exe" -Argument "C:\path\to\backend\scripts\database-health-check.js --json"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1)
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "TabSync-HealthCheck" -Description "Hourly health check"
```

### Azure Container Jobs

For production deployment on Azure:

```yaml
# azure-container-jobs.yaml
jobs:
  - name: daily-backup
    schedule: "0 2 * * *"  # 2 AM daily
    container:
      image: tabsync-backend:latest
      command: ["/bin/bash", "-c"]
      args: ["./scripts/backup-database.sh full && az storage blob upload ..."]
      env:
        - name: DATABASE_URL
          secretRef: database-url

  - name: hourly-health-check
    schedule: "0 * * * *"  # Every hour
    container:
      image: tabsync-backend:latest
      command: ["node"]
      args: ["scripts/database-health-check.js", "--json", "--alerts"]
      env:
        - name: DATABASE_URL
          secretRef: database-url
```

---

## Best Practices

### Backup Strategy

**Daily:**
- Full backup to Azure Blob Storage
- Retention: 90 days

**Weekly:**
- Critical tables backup
- Schema-only backup

**Before Migrations:**
- Always take full backup
- Test restore on staging

**Testing:**
- Monthly restore test to staging
- Verify data integrity

### Monitoring

**Continuous:**
- Database connectivity
- Active connections
- Failed payments

**Hourly:**
- Full health check
- Log to centralized system

**Daily:**
- Review health check logs
- Check for warnings/errors

**Weekly:**
- Review slow queries
- Check index usage
- Review dead tuples

### Alerting

**Critical Alerts (PagerDuty/SMS):**
- Database connection failed
- Active connections > 95%
- Failed payments > 20/hour
- All checks CRITICAL

**Warning Alerts (Email/Slack):**
- Active connections > 80%
- Long queries > 30s
- Dead tuples > 10000
- Failed payments > 5/hour

---

## Troubleshooting

### Backup fails with "pg_dump: command not found"

**Solution:**
```bash
# Windows: Install PostgreSQL client
# Download from https://www.postgresql.org/download/windows/

# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql
```

### Health check shows many unused indexes

**Solution:**
- This is normal for new databases
- Indexes will be used as application grows
- Review after 30 days of production use

### "Cannot connect to database" error

**Solution:**
1. Check DATABASE_URL in .env
2. Verify Supabase is accessible
3. Check network/firewall
4. Verify credentials

### Backup files growing too large

**Solutions:**
- Use compression (already enabled)
- Reduce retention days
- Use Azure Blob Storage with lifecycle policies
- Consider incremental backups for very large databases

---

## Security Notes

### Backup Files

- Store in secure location (Azure Blob with encryption)
- Limit access (RBAC)
- Never commit to git
- Encrypt before external transfer

### Scripts

- Never hardcode credentials
- Use environment variables
- Restrict file permissions (chmod 600)
- Audit script execution

### Database Access

- Use read-only replica for backups (if available)
- Limit script permissions to minimum required
- Log all administrative actions

---

## File Inventory

| File | Purpose | Language | Status |
|------|---------|----------|--------|
| migrate-enum-safe.js | Enum migration | JavaScript | ✅ Tested |
| verify-migration.js | Migration verification | JavaScript | ✅ Tested |
| check-database-structure.js | Database inspection | JavaScript | ✅ Tested |
| database-health-check.js | Health monitoring | JavaScript | ✅ Tested |
| backup-database.ps1 | Backup (Windows) | PowerShell | ✅ Ready |
| backup-database.sh | Backup (Unix) | Bash | ✅ Ready |

---

## Support

For issues or questions:
- Check `docs/DATABASE_OPERATIONS.md`
- Review logs in `backups/` directory
- Contact: dba@tabsync.com

---

**Last Updated:** 2025-12-27
**Maintained By:** TabSync DevOps Team
