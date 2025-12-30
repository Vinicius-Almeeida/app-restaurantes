# TabSync - Database Operations Manual

## Table of Contents

1. [Backup & Disaster Recovery](#backup--disaster-recovery)
2. [Enum Migration Procedures](#enum-migration-procedures)
3. [User Role Management](#user-role-management)
4. [Monitoring & Alerts](#monitoring--alerts)
5. [Emergency Procedures](#emergency-procedures)

---

## Backup & Disaster Recovery

### Automated Backup Strategy

**Supabase PostgreSQL** provides automated backups:

- **Point-in-Time Recovery (PITR)**: 7 days retention
- **Daily Snapshots**: 30 days retention
- **Region**: São Paulo (aws-1-sa-east-1)

### Manual Backup Procedures

#### 1. Full Database Backup

```bash
# Using pg_dump (requires PostgreSQL client)
pg_dump "postgresql://postgres.idhllxnfovognyowarbq:PASSWORD@aws-1-sa-east-1.pooler.supabase.com:5432/postgres" \
  --format=custom \
  --file=backup_$(date +%Y%m%d_%H%M%S).dump \
  --verbose

# Alternative: Plain SQL format
pg_dump "postgresql://..." \
  --format=plain \
  --file=backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 2. Schema-Only Backup

```bash
pg_dump "postgresql://..." \
  --schema-only \
  --file=schema_$(date +%Y%m%d).sql
```

#### 3. Data-Only Backup

```bash
pg_dump "postgresql://..." \
  --data-only \
  --file=data_$(date +%Y%m%d).sql
```

#### 4. Specific Table Backup

```bash
pg_dump "postgresql://..." \
  --table=users \
  --table=orders \
  --table=payments \
  --file=critical_tables_$(date +%Y%m%d).sql
```

### Restore Procedures

#### Full Database Restore

```bash
# From custom format
pg_restore \
  --dbname="postgresql://..." \
  --verbose \
  --clean \
  --if-exists \
  backup_20251227_120000.dump

# From SQL format
psql "postgresql://..." < backup_20251227_120000.sql
```

#### Partial Restore (Specific Tables)

```bash
pg_restore \
  --dbname="postgresql://..." \
  --table=users \
  backup.dump
```

### Backup Retention Policy

| Backup Type | Frequency | Retention | Storage |
|-------------|-----------|-----------|---------|
| PITR (Supabase) | Continuous | 7 days | Supabase Cloud |
| Daily Snapshot (Supabase) | Daily | 30 days | Supabase Cloud |
| Manual Full Backup | Weekly | 90 days | Azure Blob Storage |
| Pre-Migration Backup | Before each migration | 1 year | Azure Blob Storage |
| Critical Table Export | Daily | 30 days | Local + Azure |

### RTO/RPO Targets

- **Recovery Time Objective (RTO)**: < 1 hour
- **Recovery Point Objective (RPO)**: < 15 minutes (via PITR)

### Backup Testing Schedule

**Monthly**: Test restore to staging environment
**Quarterly**: Full disaster recovery drill
**Before Production Deployment**: Verify backup exists and is restorable

---

## Enum Migration Procedures

### UserRole Enum Migration (Completed)

**Date**: 2025-12-27
**Status**: ✅ SUCCESS

#### Migration Summary

- **Added**: SUPER_ADMIN, CONSULTANT, WAITER, KITCHEN
- **Migrated**: ADMIN → SUPER_ADMIN (1 user)
- **Retained**: ADMIN enum value (PostgreSQL limitation)

#### Scripts Location

```
backend/scripts/
├── migrate-enum-safe.js      # Main migration script
├── verify-migration.js        # Verification script
└── check-database-structure.js # Database inspection
```

#### Execution Steps

```bash
# 1. Check current state
cd backend
node scripts/check-database-structure.js

# 2. Run migration
node scripts/migrate-enum-safe.js

# 3. Verify success
node scripts/verify-migration.js

# 4. Regenerate Prisma Client
npx prisma generate
```

#### Rollback Procedure

**⚠️ WARNING**: Enum migrations cannot be rolled back automatically.

If rollback is needed:

1. **Restore from backup**:
   ```bash
   pg_restore --dbname="..." pre_migration_backup.dump
   ```

2. **Manual data rollback** (if backup not available):
   ```sql
   BEGIN;

   -- Revert SUPER_ADMIN back to ADMIN
   UPDATE users
   SET role = 'ADMIN'::"UserRole"
   WHERE role = 'SUPER_ADMIN'::"UserRole";

   -- Verify
   SELECT role, COUNT(*) FROM users GROUP BY role;

   -- If correct, commit:
   COMMIT;
   -- If wrong, rollback:
   ROLLBACK;
   ```

### Future Enum Migrations

#### Pre-Migration Checklist

- [ ] Create full database backup
- [ ] Test migration on staging environment
- [ ] Document rollback procedure
- [ ] Schedule maintenance window
- [ ] Notify stakeholders
- [ ] Prepare monitoring alerts

#### PostgreSQL Enum Limitations

- ❌ Cannot remove enum values
- ❌ Cannot rename enum values
- ✅ Can add new values
- ⚠️ Adding values requires exclusive lock (brief downtime)

#### Alternative: Recreate Enum Type

If you need to remove values, use this procedure:

```sql
BEGIN;

-- 1. Create new enum type
CREATE TYPE "UserRole_new" AS ENUM (
  'SUPER_ADMIN',
  'CONSULTANT',
  'RESTAURANT_OWNER',
  'WAITER',
  'KITCHEN',
  'CUSTOMER'
);

-- 2. Alter column to use new type
ALTER TABLE users
  ALTER COLUMN role TYPE "UserRole_new"
  USING (role::text::"UserRole_new");

-- 3. Drop old type
DROP TYPE "UserRole";

-- 4. Rename new type
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

COMMIT;
```

**⚠️ WARNING**: This requires exclusive lock and will cause downtime.

---

## User Role Management

### Current Role Hierarchy

```
SUPER_ADMIN           # Platform administrators (highest privilege)
  ├── CONSULTANT      # Onboarding consultants (manage restaurants)
  └── RESTAURANT_OWNER # Restaurant owners (manage their restaurants)
      ├── WAITER      # Wait staff (take orders, process payments)
      ├── KITCHEN     # Kitchen staff (view/update order status)
      └── CUSTOMER    # End customers (browse menu, place orders)
```

### Role Permissions Matrix

| Feature | SUPER_ADMIN | CONSULTANT | RESTAURANT_OWNER | WAITER | KITCHEN | CUSTOMER |
|---------|-------------|------------|------------------|--------|---------|----------|
| Platform Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Onboard Restaurants | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Own Restaurant | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Manage Menu | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| View All Orders | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Update Order Status | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Process Payments | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Inventory | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Place Orders | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### User Management Scripts

#### Create Super Admin

```javascript
// scripts/create-super-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin(email, password, fullName) {
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
}

// Usage: node scripts/create-super-admin.js
```

#### Promote User to Super Admin

```sql
-- Verify user exists
SELECT id, email, full_name, role FROM users WHERE email = 'user@example.com';

-- Promote to SUPER_ADMIN
UPDATE users
SET role = 'SUPER_ADMIN'::"UserRole"
WHERE email = 'user@example.com';

-- Audit log
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, created_at)
SELECT
  id,
  'ROLE_CHANGE',
  'User',
  id,
  jsonb_build_object('role', 'CUSTOMER'),
  jsonb_build_object('role', 'SUPER_ADMIN'),
  NOW()
FROM users WHERE email = 'user@example.com';
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

#### Database Performance

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Long-running queries (> 30s)
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '30 seconds'
AND state = 'active';

-- Database size
SELECT pg_size_pretty(pg_database_size('postgres'));

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

#### Application Metrics

```sql
-- User role distribution
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Active table sessions
SELECT status, COUNT(*) FROM table_sessions GROUP BY status;

-- Orders by status (last 24h)
SELECT status, COUNT(*) FROM orders
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;

-- Payment status distribution
SELECT payment_status, COUNT(*) FROM split_payments
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY payment_status;

-- Failed payments (last 24h)
SELECT COUNT(*) FROM payments
WHERE status = 'FAILED'
AND created_at > NOW() - INTERVAL '24 hours';
```

#### Database Health Checks

```sql
-- Dead tuples (need VACUUM?)
SELECT schemaname, tablename, n_dead_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- Index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE '%pkey';

-- Replication lag (if applicable)
SELECT
  client_addr,
  state,
  pg_wal_lsn_diff(pg_current_wal_lsn(), sent_lsn) AS send_lag,
  pg_wal_lsn_diff(pg_current_wal_lsn(), write_lsn) AS write_lag,
  pg_wal_lsn_diff(pg_current_wal_lsn(), flush_lsn) AS flush_lag,
  pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS replay_lag
FROM pg_stat_replication;
```

### Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Active Connections | > 80 | > 95 | Scale up / Investigate |
| Query Duration | > 30s | > 60s | Kill query / Optimize |
| Database Size | > 80% | > 90% | Clean up / Scale up |
| Failed Payments | > 5/hour | > 20/hour | Investigate gateway |
| Dead Tuples | > 10000 | > 50000 | Run VACUUM |
| Replication Lag | > 5s | > 30s | Check network / Failover |

### Monitoring Script

```javascript
// scripts/health-check.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function healthCheck() {
  const checks = {
    database: false,
    users: false,
    orders: false,
    payments: false
  };

  try {
    // Database connectivity
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;

    // Users table accessible
    await prisma.user.count();
    checks.users = true;

    // Orders table accessible
    await prisma.order.count();
    checks.orders = true;

    // Payments table accessible
    await prisma.payment.count();
    checks.payments = true;

    console.log('Health Check: ALL SYSTEMS OPERATIONAL');
    console.log(checks);

    return true;
  } catch (error) {
    console.error('Health Check: FAILURE');
    console.error(checks);
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

healthCheck()
  .then(success => process.exit(success ? 0 : 1));
```

---

## Emergency Procedures

### 3AM Emergency Runbook

#### Scenario 1: Database Connection Pool Exhausted

**Symptoms**: `Error: Can't reach database server`

**Actions**:
1. Check active connections:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

2. Kill idle connections:
   ```sql
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle'
   AND query_start < NOW() - INTERVAL '5 minutes';
   ```

3. Restart application:
   ```bash
   az containerapp restart --name tabsync-backend --resource-group tabsync-rg
   ```

#### Scenario 2: All Payments Failing

**Symptoms**: All payments returning FAILED status

**Actions**:
1. Check payment gateway status (Stripe/MercadoPago dashboard)

2. Query recent failed payments:
   ```sql
   SELECT
     id,
     method,
     gateway,
     status,
     metadata,
     created_at
   FROM payments
   WHERE status = 'FAILED'
   AND created_at > NOW() - INTERVAL '1 hour'
   ORDER BY created_at DESC
   LIMIT 20;
   ```

3. Check backend logs for gateway errors

4. If gateway is down, enable maintenance mode:
   ```sql
   UPDATE restaurants SET accepts_orders = false;
   ```

#### Scenario 3: Data Corruption Detected

**Symptoms**: Inconsistent data, foreign key violations

**Actions**:
1. **DO NOT** make changes immediately

2. Take immediate backup:
   ```bash
   pg_dump "postgresql://..." \
     --format=custom \
     --file=emergency_backup_$(date +%Y%m%d_%H%M%S).dump
   ```

3. Identify affected tables:
   ```sql
   -- Check for orphaned records
   SELECT COUNT(*) FROM order_items oi
   LEFT JOIN orders o ON oi.order_id = o.id
   WHERE o.id IS NULL;
   ```

4. Contact DBA team / Escalate to SUPER_ADMIN

5. If critical, restore from last known good backup

#### Scenario 4: Accidental Data Deletion

**Symptoms**: Important data missing

**Actions**:
1. Check audit logs:
   ```sql
   SELECT * FROM audit_logs
   WHERE action = 'DELETE'
   AND created_at > NOW() - INTERVAL '1 hour'
   ORDER BY created_at DESC;
   ```

2. If within PITR window (7 days), use Supabase recovery:
   - Login to Supabase dashboard
   - Navigate to Database → Backups
   - Select point-in-time before deletion
   - Restore to new database
   - Copy deleted data back

3. If outside PITR window, restore from daily snapshot

#### Scenario 5: Schema Migration Failed

**Symptoms**: Application errors after migration

**Actions**:
1. **DO NOT** run another migration

2. Check migration status:
   ```bash
   npx prisma migrate status
   ```

3. If safe, rollback:
   ```bash
   npx prisma migrate resolve --rolled-back <migration_name>
   ```

4. Restore from pre-migration backup

5. Investigate failure, fix migration, re-test on staging

### Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| Database Admin | dba@tabsync.com | 24/7 |
| DevOps Lead | devops@tabsync.com | 24/7 |
| CTO | cto@tabsync.com | On-call |
| Supabase Support | support@supabase.com | 24/7 (paid plan) |

### Post-Incident Checklist

- [ ] Document incident timeline
- [ ] Identify root cause
- [ ] Implement preventive measures
- [ ] Update monitoring/alerts
- [ ] Update runbook
- [ ] Conduct post-mortem meeting
- [ ] Test disaster recovery procedures

---

## Maintenance Schedule

### Daily
- Automated backups (Supabase)
- Health check monitoring
- Review error logs

### Weekly
- Manual full backup to Azure
- Review slow query log
- Check database size growth
- Update statistics

### Monthly
- Test backup restore
- Review and optimize indexes
- VACUUM ANALYZE
- Review user access logs
- Security audit

### Quarterly
- Full disaster recovery drill
- Review and update RTO/RPO
- Database performance tuning
- Capacity planning review

---

## Additional Resources

- **Prisma Docs**: https://www.prisma.io/docs/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Supabase Docs**: https://supabase.com/docs
- **Database Best Practices**: See `docs/DATABASE_BEST_PRACTICES.md`

---

**Document Version**: 1.0
**Last Updated**: 2025-12-27
**Next Review**: 2026-03-27
