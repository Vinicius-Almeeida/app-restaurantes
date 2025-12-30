# TabSync - Database Maintenance Schedule

Comprehensive maintenance schedule for Supabase PostgreSQL database operations.

**Database:** PostgreSQL 15+ on Supabase
**Region:** aws-1-sa-east-1 (São Paulo)
**RTO:** < 1 hour | **RPO:** < 15 minutes

---

## Daily Operations

### 1. Automated Backups (2:00 AM)

**Task:** Full database backup

**Execution:**
```bash
# Automated via cron/Task Scheduler
node scripts/backup-database.ps1 -BackupType full
```

**Success Criteria:**
- Backup file created
- File size > 0
- Verification passed
- Upload to Azure Blob successful

**Alerts:**
- ❌ If backup fails
- ⚠️ If backup size differs >50% from previous

**Owner:** DevOps Team

---

### 2. Health Check (Every Hour)

**Task:** Database health monitoring

**Execution:**
```bash
node scripts/database-health-check.js --json --alerts
```

**Monitors:**
- Connection pool usage
- Active/long-running queries
- Database size growth
- Failed payment rate
- Dead tuples accumulation

**Thresholds:**
- WARNING: Any metric in yellow zone
- CRITICAL: Any metric in red zone

**Action on Alert:**
- WARNING: Log and review within 4 hours
- CRITICAL: Page on-call DBA immediately

**Owner:** DevOps Team

---

### 3. Error Log Review (9:00 AM)

**Task:** Review overnight errors and warnings

**Checklist:**
- [ ] Check backup logs
- [ ] Review health check alerts
- [ ] Identify failed queries
- [ ] Check failed payments
- [ ] Review slow query log

**Documentation:**
- Log findings in ops journal
- Create tickets for recurring issues

**Owner:** Database Administrator

---

### 4. Metrics Dashboard Review (5:00 PM)

**Task:** Daily metrics review

**Review:**
- Orders created today
- Payment success rate
- Active table sessions
- User registrations
- Database growth rate

**Action Items:**
- Flag anomalies
- Update capacity forecasts
- Schedule optimizations if needed

**Owner:** Database Administrator

---

## Weekly Operations

### Monday: Performance Review

**Time:** 10:00 AM

**Tasks:**
1. Review slow query log (past 7 days)
2. Identify top 10 slowest queries
3. Check index usage statistics
4. Review connection pool metrics

**Action:**
```bash
# Generate performance report
node scripts/weekly-performance-report.js
```

**Deliverable:** Performance report with optimization recommendations

**Owner:** Database Administrator

---

### Tuesday: Security Audit

**Time:** 10:00 AM

**Tasks:**
1. Review user role distribution
2. Check for unauthorized access attempts
3. Audit SUPER_ADMIN actions
4. Review failed login attempts
5. Verify backup encryption

**Checklist:**
- [ ] All SUPER_ADMINs are authorized
- [ ] No suspicious login patterns
- [ ] Backups are encrypted
- [ ] No SQL injection attempts detected

**Owner:** Security Team

---

### Wednesday: Data Integrity Check

**Time:** 10:00 AM

**Tasks:**
1. Check for orphaned records
2. Verify foreign key constraints
3. Validate enum values in use
4. Check for duplicate data

**Queries:**
```sql
-- Orphaned order items
SELECT COUNT(*) FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.id IS NULL;

-- Orphaned split payments
SELECT COUNT(*) FROM split_payments sp
LEFT JOIN orders o ON sp.order_id = o.id
WHERE o.id IS NULL;
```

**Owner:** Database Administrator

---

### Thursday: Capacity Planning

**Time:** 10:00 AM

**Tasks:**
1. Review database size growth
2. Forecast storage needs (30/60/90 days)
3. Check table size distribution
4. Estimate connection needs

**Metrics:**
- Current database size
- Growth rate (MB/day)
- Largest tables
- Connection pool utilization

**Action:**
- Update capacity forecast
- Plan scaling if needed

**Owner:** DevOps Lead

---

### Friday: Backup Testing

**Time:** 10:00 AM

**Tasks:**
1. Restore latest backup to staging
2. Verify data integrity
3. Test point-in-time recovery
4. Document restore time

**Process:**
```bash
# Restore to staging
pg_restore \
  --dbname="postgresql://staging..." \
  --clean \
  --if-exists \
  backups/latest_full.dump

# Verify row counts
node scripts/verify-backup-integrity.js
```

**Success Criteria:**
- Restore completes without errors
- Row counts match production
- Sample data queries return expected results
- Restore time < RTO (1 hour)

**Owner:** DevOps Team

---

### Sunday: Critical Tables Backup

**Time:** 3:00 AM

**Task:** Backup critical tables separately

**Execution:**
```bash
./scripts/backup-database.sh critical
```

**Tables:**
- users
- restaurants
- orders
- order_items
- payments
- split_payments
- table_sessions

**Owner:** Automated (DevOps monitors)

---

## Monthly Operations

### 1st of Month: Full Database Maintenance

**Time:** Sunday 2:00 AM (low traffic)

**Tasks:**

#### A. VACUUM ANALYZE
```sql
-- Reclaim space and update statistics
VACUUM ANALYZE;

-- Check results
SELECT
  schemaname,
  tablename,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
ORDER BY last_vacuum DESC NULLS LAST;
```

#### B. Reindex Heavy Tables
```sql
-- Only if index bloat detected
REINDEX TABLE orders;
REINDEX TABLE order_items;
REINDEX TABLE payments;
```

#### C. Update Table Statistics
```sql
ANALYZE users;
ANALYZE orders;
ANALYZE payments;
ANALYZE split_payments;
```

**Expected Duration:** 10-30 minutes

**Owner:** Database Administrator

---

### 2nd Week: Index Review

**Task:** Review and optimize indexes

**Process:**
1. Identify unused indexes
2. Identify missing indexes (seq scans on large tables)
3. Check index bloat
4. Plan index changes

**Queries:**
```sql
-- Unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE '%_pkey';

-- Missing indexes (high seq scans)
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / seq_scan as avg_seq_tup
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 10;
```

**Owner:** Database Administrator

---

### 3rd Week: Security Review

**Task:** Comprehensive security audit

**Checklist:**
- [ ] Review all database users and roles
- [ ] Check SSL connections enforcement
- [ ] Audit recent schema changes
- [ ] Review audit log retention
- [ ] Verify encryption at rest
- [ ] Check connection limits
- [ ] Review rate limiting effectiveness

**Owner:** Security Team + DBA

---

### 4th Week: Disaster Recovery Drill

**Task:** Full DR test

**Scenario:** Complete database loss

**Steps:**
1. Simulate production database failure
2. Restore from backup to new instance
3. Verify data integrity
4. Measure recovery time
5. Document learnings

**Success Criteria:**
- Recovery completed within RTO (1 hour)
- Data loss within RPO (15 minutes)
- All applications reconnect successfully
- No data corruption

**Owner:** DevOps Lead + DBA

---

## Quarterly Operations

### Quarter End: Full Database Audit

**Duration:** 1 week

**Tasks:**

#### Day 1: Performance Audit
- Comprehensive slow query analysis
- Index effectiveness review
- Query plan optimization
- Connection pool tuning

#### Day 2: Security Audit
- Penetration testing
- Access control review
- Encryption verification
- Compliance check (LGPD, PCI-DSS)

#### Day 3: Data Quality Audit
- Referential integrity check
- Data consistency validation
- Duplicate detection
- Orphaned records cleanup

#### Day 4: Capacity Review
- Storage forecast (12 months)
- Scaling plan update
- Cost optimization review
- Archive strategy evaluation

#### Day 5: Documentation Update
- Update runbooks
- Review procedures
- Update contact list
- Archive old documentation

**Deliverable:** Quarterly Database Health Report

**Owner:** Database Administrator + DevOps Lead

---

## Annual Operations

### January: Year Planning

**Tasks:**
- Review previous year metrics
- Set performance targets
- Plan capacity upgrades
- Budget for tools/infrastructure

---

### June: Mid-Year Review

**Tasks:**
- Review YTD metrics vs targets
- Adjust capacity plan
- Update disaster recovery procedures
- Refresh team training

---

### December: Year-End Audit

**Tasks:**
- Complete data retention compliance
- Archive old data (>1 year)
- Generate annual report
- Plan next year improvements

---

## Ad-Hoc Maintenance

### Before Deployment

**Always:**
- [ ] Full backup
- [ ] Test on staging
- [ ] Prepare rollback plan
- [ ] Document changes
- [ ] Notify stakeholders

### After Incidents

**Within 24 hours:**
- [ ] Document incident
- [ ] Identify root cause
- [ ] Implement fixes
- [ ] Update monitoring
- [ ] Conduct post-mortem

### Before Major Changes

**Checklist:**
- [ ] Change request approved
- [ ] Backup verified
- [ ] Rollback tested
- [ ] Team briefed
- [ ] Maintenance window scheduled

---

## Monitoring Dashboard

### Key Metrics (Real-time)

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Connection Pool Usage | < 50% | 80% | 95% |
| Query Response Time (p95) | < 100ms | 200ms | 500ms |
| Failed Payments/Hour | 0 | 5 | 20 |
| Database Size Growth | Steady | +20%/week | +50%/week |
| Dead Tuples | < 1000 | 10000 | 50000 |
| Replication Lag | 0s | 5s | 30s |

### Application Metrics

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Orders/Day | Growing | Flat | Declining |
| Payment Success Rate | > 98% | 95% | < 90% |
| Active Sessions | Stable | Unusual spike | No sessions |
| User Signups/Day | Growing | Flat | Zero |

---

## Maintenance Windows

### Scheduled Downtime

**Monthly:** 1st Sunday, 2:00-3:00 AM (for VACUUM/REINDEX)

**Quarterly:** Last Sunday, 1:00-4:00 AM (for major updates)

**Notification:**
- Email: 7 days before
- In-app notice: 3 days before
- Final reminder: 1 day before

### Emergency Maintenance

**Process:**
1. Assess urgency
2. Notify CTO/DevOps Lead
3. Page on-call team if critical
4. Communicate to users ASAP
5. Document timeline
6. Post-incident review

---

## Tools & Automation

### Required Tools

- **PostgreSQL Client:** psql, pg_dump, pg_restore
- **Monitoring:** Supabase Dashboard, custom scripts
- **Backup Storage:** Azure Blob Storage
- **Alerting:** Email, Slack, PagerDuty
- **Logs:** Azure Log Analytics

### Automation Scripts

| Script | Frequency | Purpose |
|--------|-----------|---------|
| backup-database.ps1 | Daily | Full backup |
| database-health-check.js | Hourly | Health monitoring |
| weekly-performance-report.js | Weekly | Performance analysis |
| monthly-maintenance.sql | Monthly | VACUUM/ANALYZE |

---

## Contacts & Escalation

### Primary Contacts

| Role | Contact | Hours |
|------|---------|-------|
| DBA (Primary) | dba@tabsync.com | 24/7 |
| DevOps Lead | devops@tabsync.com | 24/7 |
| Security Lead | security@tabsync.com | Business hours |
| CTO | cto@tabsync.com | On-call |

### Escalation Path

1. **P3 (Low):** Email DBA → Response in 24h
2. **P2 (Medium):** Email DBA + DevOps → Response in 4h
3. **P1 (High):** Page DBA → Response in 1h
4. **P0 (Critical):** Page DBA + DevOps Lead + CTO → Response in 15min

### External Support

- **Supabase Support:** support@supabase.com (24/7)
- **Azure Support:** https://portal.azure.com (24/7)

---

## Review Schedule

This document is reviewed and updated:
- **Monthly:** By Database Administrator
- **Quarterly:** By DevOps Team
- **Annually:** By Executive Team

**Last Review:** 2025-12-27
**Next Review:** 2026-01-27
**Document Owner:** Database Administrator

---

**Version:** 1.0
**Effective Date:** 2025-12-27
