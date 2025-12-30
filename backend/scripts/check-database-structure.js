/**
 * Check current database structure
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseStructure() {
  console.log('='.repeat(60));
  console.log('Database Structure Check');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Check if users table exists
    console.log('1. Checking if users table exists...');
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      ) as exists
    `;
    console.log('Users table exists:', tableExists[0].exists);
    console.log('');

    if (!tableExists[0].exists) {
      console.log('ERROR: Users table does not exist!');
      console.log('You need to create the initial database schema.');
      return;
    }

    // Check table structure
    console.log('2. Users table columns:');
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'users'
      ORDER BY ordinal_position
    `;
    console.table(columns);
    console.log('');

    // Check enum types
    console.log('3. Checking enum types:');
    const enums = await prisma.$queryRaw`
      SELECT t.typname as enum_name, string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname LIKE '%role%' OR t.typname LIKE '%status%'
      GROUP BY t.typname
      ORDER BY t.typname
    `;
    console.table(enums);
    console.log('');

    // Check current user roles
    console.log('4. Current user role distribution:');
    const roles = await prisma.$queryRaw`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY role
    `;
    console.table(roles);
    console.log('');

    // Check all users
    console.log('5. All users in database:');
    const users = await prisma.$queryRaw`
      SELECT id, email, full_name as "fullName", role, created_at as "createdAt"
      FROM users
      ORDER BY created_at
    `;
    console.table(users);
    console.log('');

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStructure()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Failed:', error);
    process.exit(1);
  });
