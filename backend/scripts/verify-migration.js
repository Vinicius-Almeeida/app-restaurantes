/**
 * TabSync - Verify Migration Script
 * Final verification of UserRole migration
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('='.repeat(60));
  console.log('TabSync - Migration Verification');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Check 1: Enum values
    console.log('Check 1: UserRole enum values in database');
    const enumValues = await prisma.$queryRaw`
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
      ORDER BY enumlabel
    `;
    console.log('Available values:', enumValues.map(e => e.enumlabel).join(', '));
    console.log('');

    // Check 2: Required roles exist
    const requiredRoles = ['SUPER_ADMIN', 'CONSULTANT', 'WAITER', 'KITCHEN', 'CUSTOMER', 'RESTAURANT_OWNER'];
    const missingRoles = requiredRoles.filter(
      role => !enumValues.some(e => e.enumlabel === role)
    );

    if (missingRoles.length > 0) {
      console.error(`ERROR: Missing required roles: ${missingRoles.join(', ')}`);
      process.exit(1);
    }
    console.log('✓ All required roles exist');
    console.log('');

    // Check 3: No ADMIN users
    console.log('Check 2: Verify no ADMIN users remain');
    const adminUsers = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count
      FROM users
      WHERE role::text = 'ADMIN'
    `;

    if (adminUsers[0].count > 0) {
      console.error(`ERROR: Found ${adminUsers[0].count} ADMIN user(s)!`);
      process.exit(1);
    }
    console.log('✓ No ADMIN users found');
    console.log('');

    // Check 4: SUPER_ADMIN users exist
    console.log('Check 3: Verify SUPER_ADMIN users exist');
    const superAdminUsers = await prisma.$queryRaw`
      SELECT id, email, full_name as "fullName", role, created_at as "createdAt"
      FROM users
      WHERE role::text = 'SUPER_ADMIN'
    `;

    if (superAdminUsers.length === 0) {
      console.error('WARNING: No SUPER_ADMIN users found!');
    } else {
      console.log(`✓ Found ${superAdminUsers.length} SUPER_ADMIN user(s):`);
      superAdminUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.fullName})`);
      });
    }
    console.log('');

    // Check 5: All users have valid roles
    console.log('Check 4: Verify all users have valid roles');
    const userRoles = await prisma.$queryRaw`
      SELECT role::text, COUNT(*)::int as count
      FROM users
      GROUP BY role
      ORDER BY role
    `;

    console.table(userRoles);

    const totalUsers = userRoles.reduce((sum, r) => sum + r.count, 0);
    console.log(`✓ Total users: ${totalUsers}`);
    console.log('');

    // Check 6: Prisma client has correct types
    console.log('Check 5: Verify Prisma Client types');
    try {
      // Try to use the new enum values with Prisma
      const testQuery = await prisma.user.findMany({
        where: {
          role: {
            in: ['SUPER_ADMIN', 'CONSULTANT', 'WAITER', 'KITCHEN', 'CUSTOMER', 'RESTAURANT_OWNER']
          }
        },
        select: { id: true }
      });
      console.log(`✓ Prisma Client can query all new role types (${testQuery.length} users total)`);
    } catch (err) {
      console.error('ERROR: Prisma Client type check failed:', err.message);
      process.exit(1);
    }
    console.log('');

    // Summary
    console.log('='.repeat(60));
    console.log('VERIFICATION SUCCESSFUL');
    console.log('='.repeat(60));
    console.log('');
    console.log('Migration Status: COMPLETE');
    console.log('');
    console.log('Role Distribution:');
    userRoles.forEach(r => {
      console.log(`  ${r.role}: ${r.count} user(s)`);
    });
    console.log('');
    console.log('Available Roles:');
    enumValues.forEach(e => {
      const inUse = userRoles.some(r => r.role === e.enumlabel);
      console.log(`  ${e.enumlabel}${inUse ? '' : ' (not in use)'}`);
    });
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('VERIFICATION FAILED');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration()
  .then(() => {
    console.log('Verification complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Verification failed:', error.message);
    process.exit(1);
  });
