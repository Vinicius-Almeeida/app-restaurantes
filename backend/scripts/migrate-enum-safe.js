/**
 * TabSync - Safe Enum Migration Script
 * Adds new UserRole values and migrates ADMIN to SUPER_ADMIN
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateEnum() {
  console.log('='.repeat(60));
  console.log('TabSync - UserRole Enum Migration');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Check current enum values
    console.log('Step 1: Checking current UserRole enum values...');
    const currentEnum = await prisma.$queryRaw`
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
      ORDER BY enumlabel
    `;
    console.log('Current enum values:', currentEnum.map(e => e.enumlabel).join(', '));
    console.log('');

    // Step 2: Check current user distribution
    console.log('Step 2: Current user role distribution:');
    const currentRoles = await prisma.$queryRaw`
      SELECT role::text, COUNT(*)::int as count
      FROM users
      GROUP BY role
      ORDER BY role
    `;
    console.table(currentRoles);

    const adminCount = currentRoles.find(r => r.role === 'ADMIN')?.count || 0;
    console.log(`Found ${adminCount} ADMIN user(s) to migrate`);
    console.log('');

    if (adminCount === 0) {
      console.log('No ADMIN users found. Skipping data migration.');
      console.log('Adding new enum values only...');
      console.log('');
    }

    // Step 3: Add new enum values
    console.log('Step 3: Adding new enum values...');

    const newRoles = ['SUPER_ADMIN', 'CONSULTANT', 'WAITER', 'KITCHEN'];

    for (const role of newRoles) {
      const exists = currentEnum.some(e => e.enumlabel === role);

      if (exists) {
        console.log(`  - ${role}: Already exists, skipping`);
      } else {
        try {
          await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE '${role}'`);
          console.log(`  - ${role}: Added successfully`);
        } catch (err) {
          if (err.message.includes('already exists')) {
            console.log(`  - ${role}: Already exists (concurrent add)`);
          } else {
            throw err;
          }
        }
      }
    }
    console.log('');

    // Step 4: Migrate ADMIN users to SUPER_ADMIN
    if (adminCount > 0) {
      console.log('Step 4: Migrating ADMIN users to SUPER_ADMIN...');

      const adminUsers = await prisma.$queryRaw`
        SELECT id, email, full_name as "fullName", role
        FROM users
        WHERE role::text = 'ADMIN'
      `;

      console.log('Users to migrate:');
      adminUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.fullName})`);
      });
      console.log('');

      const updateCount = await prisma.$executeRaw`
        UPDATE users
        SET role = 'SUPER_ADMIN'::"UserRole"
        WHERE role::text = 'ADMIN'
      `;

      console.log(`Successfully migrated ${updateCount} user(s)`);
      console.log('');
    } else {
      console.log('Step 4: No ADMIN users to migrate, skipping');
      console.log('');
    }

    // Step 5: Verify migration
    console.log('Step 5: Verifying migration...');

    const finalRoles = await prisma.$queryRaw`
      SELECT role::text, COUNT(*)::int as count
      FROM users
      GROUP BY role
      ORDER BY role
    `;
    console.log('Final role distribution:');
    console.table(finalRoles);

    const remainingAdmin = finalRoles.find(r => r.role === 'ADMIN')?.count || 0;
    const superAdmins = finalRoles.find(r => r.role === 'SUPER_ADMIN')?.count || 0;

    if (remainingAdmin > 0) {
      throw new Error(`Migration incomplete: ${remainingAdmin} ADMIN users still exist!`);
    }

    console.log(`Verification: 0 ADMIN users, ${superAdmins} SUPER_ADMIN user(s)`);
    console.log('');

    // Step 6: Show updated enum values
    console.log('Step 6: Updated UserRole enum values:');
    const updatedEnum = await prisma.$queryRaw`
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
      ORDER BY enumlabel
    `;
    console.log(updatedEnum.map(e => `  - ${e.enumlabel}`).join('\n'));
    console.log('');

    console.log('='.repeat(60));
    console.log('SUCCESS: Migration completed!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Summary:');
    console.log(`- Added new roles: ${newRoles.join(', ')}`);
    console.log(`- Migrated ${adminCount} ADMIN user(s) to SUPER_ADMIN`);
    console.log(`- Total SUPER_ADMIN users: ${superAdmins}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Update schema.prisma to remove ADMIN from UserRole enum (if desired)');
    console.log('2. Run: npx prisma generate');
    console.log('3. Update backend code to use new roles');
    console.log('');
    console.log('Note: The old ADMIN value will remain in the database enum');
    console.log('      but is no longer used. PostgreSQL does not support removing');
    console.log('      enum values without recreating the type.');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('ERROR: Migration failed!');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute migration
migrateEnum()
  .then(() => {
    console.log('Migration script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration script failed:', error.message);
    process.exit(1);
  });
