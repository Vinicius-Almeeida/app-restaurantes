/**
 * TabSync - Database Health Check & Monitoring Script
 *
 * Purpose: Monitor database health, performance metrics, and alert thresholds
 * Usage: node scripts/database-health-check.js [--json] [--alerts]
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuration
const THRESHOLDS = {
  activeConnections: { warning: 80, critical: 95 },
  longQuerySeconds: { warning: 30, critical: 60 },
  databaseSizePercent: { warning: 80, critical: 90 },
  failedPaymentsPerHour: { warning: 5, critical: 20 },
  deadTuples: { warning: 10000, critical: 50000 },
  replicationLagSeconds: { warning: 5, critical: 30 }
};

// Parse command line arguments
const args = process.argv.slice(2);
const outputJson = args.includes('--json');
const checkAlerts = args.includes('--alerts');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  if (!outputJson) {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }
}

function logSection(title) {
  if (!outputJson) {
    console.log('');
    console.log('='.repeat(60));
    console.log(title);
    console.log('='.repeat(60));
  }
}

async function checkDatabaseConnectivity() {
  try {
    await prisma.$queryRaw`SELECT 1 as alive`;
    return { status: 'OK', message: 'Database connection successful' };
  } catch (error) {
    return { status: 'CRITICAL', message: `Connection failed: ${error.message}` };
  }
}

async function checkActiveConnections() {
  try {
    const result = await prisma.$queryRaw`
      SELECT count(*)::int as active_connections
      FROM pg_stat_activity
      WHERE state = 'active'
    `;

    const count = result[0].active_connections;
    const maxConnections = 100; // Default for Supabase
    const percent = (count / maxConnections) * 100;

    let status = 'OK';
    if (percent > THRESHOLDS.activeConnections.critical) {
      status = 'CRITICAL';
    } else if (percent > THRESHOLDS.activeConnections.warning) {
      status = 'WARNING';
    }

    return {
      status,
      metric: 'active_connections',
      value: count,
      max: maxConnections,
      percent: Math.round(percent),
      threshold_warning: THRESHOLDS.activeConnections.warning,
      threshold_critical: THRESHOLDS.activeConnections.critical
    };
  } catch (error) {
    return { status: 'ERROR', metric: 'active_connections', error: error.message };
  }
}

async function checkLongRunningQueries() {
  try {
    const queries = await prisma.$queryRaw`
      SELECT
        pid,
        usename,
        EXTRACT(EPOCH FROM (now() - query_start))::int as duration_seconds,
        state,
        LEFT(query, 100) as query_preview
      FROM pg_stat_activity
      WHERE (now() - pg_stat_activity.query_start) > interval '30 seconds'
      AND state = 'active'
      AND query NOT LIKE '%pg_stat_activity%'
      ORDER BY duration_seconds DESC
    `;

    const critical = queries.filter(q => q.duration_seconds > THRESHOLDS.longQuerySeconds.critical);
    const warning = queries.filter(
      q => q.duration_seconds > THRESHOLDS.longQuerySeconds.warning &&
           q.duration_seconds <= THRESHOLDS.longQuerySeconds.critical
    );

    let status = 'OK';
    if (critical.length > 0) status = 'CRITICAL';
    else if (warning.length > 0) status = 'WARNING';

    return {
      status,
      metric: 'long_running_queries',
      total: queries.length,
      critical: critical.length,
      warning: warning.length,
      queries: queries.map(q => ({
        pid: q.pid,
        user: q.usename,
        duration: q.duration_seconds,
        state: q.state,
        query: q.query_preview
      }))
    };
  } catch (error) {
    return { status: 'ERROR', metric: 'long_running_queries', error: error.message };
  }
}

async function checkDatabaseSize() {
  try {
    const result = await prisma.$queryRaw`
      SELECT pg_size_pretty(pg_database_size('postgres')) as size_pretty
    `;

    return {
      status: 'OK',
      metric: 'database_size',
      size: result[0].size_pretty
    };
  } catch (error) {
    return { status: 'ERROR', metric: 'database_size', error: error.message };
  }
}

async function checkTableSizes() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT
        t.tablename,
        pg_size_pretty(pg_total_relation_size(quote_ident(t.schemaname)||'.'||quote_ident(t.tablename))) as total_size
      FROM pg_tables t
      WHERE t.schemaname = 'public'
      ORDER BY pg_total_relation_size(quote_ident(t.schemaname)||'.'||quote_ident(t.tablename)) DESC
      LIMIT 10
    `;

    return {
      status: 'OK',
      metric: 'table_sizes',
      tables: tables.map(t => ({
        name: t.tablename,
        size: t.total_size
      }))
    };
  } catch (error) {
    return { status: 'ERROR', metric: 'table_sizes', error: error.message };
  }
}

async function checkUserRoleDistribution() {
  try {
    const roles = await prisma.$queryRaw`
      SELECT role::text, COUNT(*)::int as count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `;

    return {
      status: 'OK',
      metric: 'user_roles',
      distribution: roles.reduce((acc, r) => {
        acc[r.role] = r.count;
        return acc;
      }, {})
    };
  } catch (error) {
    return { status: 'ERROR', metric: 'user_roles', error: error.message };
  }
}

async function checkOrderMetrics() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT
        status::text,
        COUNT(*)::int as count
      FROM orders
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY status
    `;

    const total = stats.reduce((sum, s) => sum + s.count, 0);

    return {
      status: 'OK',
      metric: 'orders_24h',
      total,
      by_status: stats.reduce((acc, s) => {
        acc[s.status] = s.count;
        return acc;
      }, {})
    };
  } catch (error) {
    return { status: 'ERROR', metric: 'orders_24h', error: error.message };
  }
}

async function checkPaymentMetrics() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT
        status::text,
        COUNT(*)::int as count
      FROM payments
      WHERE created_at > NOW() - INTERVAL '1 hour'
      GROUP BY status
    `;

    const failed = stats.find(s => s.status === 'FAILED')?.count || 0;

    let status = 'OK';
    if (failed > THRESHOLDS.failedPaymentsPerHour.critical) {
      status = 'CRITICAL';
    } else if (failed > THRESHOLDS.failedPaymentsPerHour.warning) {
      status = 'WARNING';
    }

    return {
      status,
      metric: 'payments_1h',
      failed_count: failed,
      threshold_warning: THRESHOLDS.failedPaymentsPerHour.warning,
      threshold_critical: THRESHOLDS.failedPaymentsPerHour.critical,
      by_status: stats.reduce((acc, s) => {
        acc[s.status] = s.count;
        return acc;
      }, {})
    };
  } catch (error) {
    return { status: 'ERROR', metric: 'payments_1h', error: error.message };
  }
}

async function checkDeadTuples() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT
        s.schemaname,
        s.relname as tablename,
        s.n_dead_tup::int as dead_tuples,
        s.n_live_tup::int as live_tuples
      FROM pg_stat_user_tables s
      WHERE s.n_dead_tup > 0
      ORDER BY s.n_dead_tup DESC
      LIMIT 10
    `;

    const maxDeadTuples = Math.max(...tables.map(t => t.dead_tuples), 0);

    let status = 'OK';
    if (maxDeadTuples > THRESHOLDS.deadTuples.critical) {
      status = 'CRITICAL';
    } else if (maxDeadTuples > THRESHOLDS.deadTuples.warning) {
      status = 'WARNING';
    }

    return {
      status,
      metric: 'dead_tuples',
      max_dead_tuples: maxDeadTuples,
      threshold_warning: THRESHOLDS.deadTuples.warning,
      threshold_critical: THRESHOLDS.deadTuples.critical,
      tables: tables.map(t => ({
        table: t.tablename,
        dead: t.dead_tuples,
        live: t.live_tuples,
        ratio: ((t.dead_tuples / (t.live_tuples || 1)) * 100).toFixed(2)
      }))
    };
  } catch (error) {
    return { status: 'ERROR', metric: 'dead_tuples', error: error.message };
  }
}

async function checkIndexUsage() {
  try {
    const unusedIndexes = await prisma.$queryRaw`
      SELECT
        s.schemaname,
        s.relname as tablename,
        s.indexrelname as indexname,
        s.idx_scan::int as scans
      FROM pg_stat_user_indexes s
      WHERE s.idx_scan = 0
      AND s.indexrelname NOT LIKE '%_pkey'
      ORDER BY pg_relation_size(s.indexrelid) DESC
      LIMIT 10
    `;

    return {
      status: unusedIndexes.length > 5 ? 'WARNING' : 'OK',
      metric: 'unused_indexes',
      count: unusedIndexes.length,
      indexes: unusedIndexes.map(i => ({
        table: i.tablename,
        index: i.indexname,
        scans: i.scans
      }))
    };
  } catch (error) {
    return { status: 'ERROR', metric: 'unused_indexes', error: error.message };
  }
}

async function checkActiveTableSessions() {
  try {
    // Check if table exists first
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'table_sessions'
      ) as exists
    `;

    if (!tableExists[0].exists) {
      return {
        status: 'OK',
        metric: 'active_table_sessions',
        message: 'table_sessions table not found (feature not deployed)',
        total: 0
      };
    }

    const sessions = await prisma.$queryRaw`
      SELECT
        status::text,
        COUNT(*)::int as count
      FROM table_sessions
      WHERE status IN ('ACTIVE', 'PAYMENT')
      GROUP BY status
    `;

    const total = sessions.reduce((sum, s) => sum + s.count, 0);

    return {
      status: 'OK',
      metric: 'active_table_sessions',
      total,
      by_status: sessions.reduce((acc, s) => {
        acc[s.status] = s.count;
        return acc;
      }, {})
    };
  } catch (error) {
    return { status: 'ERROR', metric: 'active_table_sessions', error: error.message };
  }
}

async function runHealthCheck() {
  const results = {
    timestamp: new Date().toISOString(),
    status: 'OK',
    checks: {}
  };

  logSection('TabSync - Database Health Check');

  // Run all checks
  const checks = [
    { name: 'connectivity', fn: checkDatabaseConnectivity },
    { name: 'connections', fn: checkActiveConnections },
    { name: 'long_queries', fn: checkLongRunningQueries },
    { name: 'database_size', fn: checkDatabaseSize },
    { name: 'table_sizes', fn: checkTableSizes },
    { name: 'user_roles', fn: checkUserRoleDistribution },
    { name: 'orders', fn: checkOrderMetrics },
    { name: 'payments', fn: checkPaymentMetrics },
    { name: 'dead_tuples', fn: checkDeadTuples },
    { name: 'index_usage', fn: checkIndexUsage },
    { name: 'table_sessions', fn: checkActiveTableSessions }
  ];

  for (const check of checks) {
    log(`Running check: ${check.name}...`, 'cyan');
    const result = await check.fn();
    results.checks[check.name] = result;

    // Update overall status
    if (result.status === 'CRITICAL') {
      results.status = 'CRITICAL';
    } else if (result.status === 'WARNING' && results.status !== 'CRITICAL') {
      results.status = 'WARNING';
    } else if (result.status === 'ERROR' && results.status === 'OK') {
      results.status = 'WARNING';
    }

    // Log result
    if (!outputJson) {
      const statusColor = result.status === 'OK' ? 'green' :
                         result.status === 'WARNING' ? 'yellow' : 'red';
      log(`  Status: ${result.status}`, statusColor);

      if (result.error) {
        log(`  Error: ${result.error}`, 'red');
      }
    }
  }

  return results;
}

async function main() {
  try {
    const results = await runHealthCheck();

    if (outputJson) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      logSection('Summary');

      const statusColor = results.status === 'OK' ? 'green' :
                         results.status === 'WARNING' ? 'yellow' : 'red';
      log(`Overall Status: ${results.status}`, statusColor);
      log(`Timestamp: ${results.timestamp}`);

      // Show critical/warning checks
      const criticalChecks = Object.entries(results.checks)
        .filter(([_, check]) => check.status === 'CRITICAL');

      const warningChecks = Object.entries(results.checks)
        .filter(([_, check]) => check.status === 'WARNING');

      if (criticalChecks.length > 0) {
        log('', 'reset');
        log('CRITICAL ISSUES:', 'red');
        criticalChecks.forEach(([name, check]) => {
          log(`  - ${name}: ${check.message || JSON.stringify(check)}`, 'red');
        });
      }

      if (warningChecks.length > 0) {
        log('', 'reset');
        log('WARNINGS:', 'yellow');
        warningChecks.forEach(([name, check]) => {
          log(`  - ${name}: ${check.message || JSON.stringify(check)}`, 'yellow');
        });
      }

      log('', 'reset');
      log('Run with --json for full output', 'cyan');
    }

    // Exit with appropriate code
    if (checkAlerts) {
      if (results.status === 'CRITICAL') {
        process.exit(2);
      } else if (results.status === 'WARNING') {
        process.exit(1);
      }
    }

    process.exit(0);

  } catch (error) {
    if (outputJson) {
      console.log(JSON.stringify({
        status: 'ERROR',
        error: error.message,
        stack: error.stack
      }));
    } else {
      log('Health check failed:', 'red');
      log(error.message, 'red');
    }
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
}

main();
