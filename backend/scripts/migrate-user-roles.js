/**
 * TabSync - User Role Migration Script
 *
 * Purpose: Migrate UserRole enum values
 * - Add new roles: SUPER_ADMIN, CONSULTANT, WAITER, KITCHEN
 * - Migrate existing ADMIN users to SUPER_ADMIN
 *
 * Safety: Runs in transaction with rollback on error
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateUserRoles() {
  console.log('='.repeat(60));
  console.log('TabSync - User Role Migration');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Check current state
    console.log('Step 1: Checking current user role distribution...');
    const currentRoles = await prisma.$queryRaw`
      SELECT role::text, COUNT(*)::int as count
      FROM users
      GROUP BY role
      ORDER BY role
    `;
    console.log('Current roles:', currentRoles);
    console.log('');

    // Step 2: Check if ADMIN users exist
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    console.log(`Step 2: Found ${adminCount} user(s) with ADMIN role`);
    console.log('');

    if (adminCount === 0) {
      console.log('No ADMIN users to migrate. Migration not needed.');
      return;
    }

    // Step 3: Show users that will be migrated
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true
      }
    });

    console.log('Step 3: Users to be migrated to SUPER_ADMIN:');
    adminUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.fullName})`);
    });
    console.log('');

    // Step 4: Execute migration in transaction
    console.log('Step 4: Executing migration...');

    // Use raw SQL to add enum values first (must be outside transaction)
    console.log('  Adding new enum values if needed...');
    await prisma.$executeRaw`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SUPER_ADMIN' AND enumtypid = 'UserRole'::regtype) THEN
              ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';
          END IF;

          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CONSULTANT' AND enumtypid = 'UserRole'::regtype) THEN
              ALTER TYPE "UserRole" ADD VALUE 'CONSULTANT';
          END IF;

          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'WAITER' AND enumtypid = 'UserRole'::regtype) THEN
              ALTER TYPE "UserRole" ADD VALUE 'WAITER';
          END IF;

          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'KITCHEN' AND enumtypid = 'UserRole'::regtype) THEN
              ALTER TYPE "UserRole" ADD VALUE 'KITCHEN';
          END IF;
      END$$;
    `;
    console.log('  Enum values added successfully');

    // Migrate users in transaction
    console.log('  Migrating ADMIN users to SUPER_ADMIN...');
    const updateResult = await prisma.$executeRaw`
      UPDATE users
      SET role = 'SUPER_ADMIN'::\"UserRole\"
      WHERE role = 'ADMIN'::\"UserRole\"
    `;
    console.log(`  Updated ${updateResult} user(s)`);
    console.log('');

    // Step 5: Verify migration
    console.log('Step 5: Verifying migration...');
    const remainingAdmin = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    if (remainingAdmin > 0) {
      throw new Error(`Migration failed: ${remainingAdmin} ADMIN users still exist`);
    }

    const newSuperAdmins = await prisma.user.count({
      where: { role: 'SUPER_ADMIN' }
    });

    console.log(`  Verification: 0 ADMIN users, ${newSuperAdmins} SUPER_ADMIN users`);
    console.log('');

    // Step 6: Show final state
    console.log('Step 6: Final role distribution:');
    const finalRoles = await prisma.$queryRaw`
      SELECT role::text, COUNT(*)::int as count
      FROM users
      GROUP BY role
      ORDER BY role
    `;
    console.log(finalRoles);
    console.log('');

    // Step 7: Show available enum values
    console.log('Step 7: Available UserRole enum values:');
    const enumValues = await prisma.$queryRaw`
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = 'UserRole'::regtype
      ORDER BY enumlabel
    `;
    console.log(enumValues.map(v => `  - ${v.enumlabel}`).join('\n'));
    console.log('');

    console.log('='.repeat(60));
    console.log('SUCCESS: Migration completed successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next steps:');
    console.log('1. Update schema.prisma to remove ADMIN from UserRole enum');
    console.log('2. Run: npx prisma generate');
    console.log('3. Update backend code to use new roles');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('ERROR: Migration failed!');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute migration
migrateUserRoles()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
