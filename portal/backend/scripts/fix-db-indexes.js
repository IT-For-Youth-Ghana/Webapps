/**
 * Database Index Fix Script
 * Helps resolve duplicate index issues during development
 */

import { Sequelize } from 'sequelize';
import config from '../src/config/index.js';
import logger from '../src/utils/logger.js';

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    username: config.database.user,
    password: config.database.password,
    logging: false,
});

async function fixDuplicateIndexes() {
    try {
        await sequelize.authenticate();
        logger.info('✅ Connected to database');

        // Check for duplicate indexes
        const [results] = await sequelize.query(`
            SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = '${config.database.name}'
            AND INDEX_NAME LIKE '%order_index%'
            ORDER BY TABLE_NAME, INDEX_NAME;
        `);

        console.log('Current order_index related indexes:');
        console.table(results);

        // Common duplicate indexes to remove
        const indexesToCheck = [
            { table: 'course_modules', index: 'course_modules_order_index' },
            { table: 'enrollments', index: 'enrollments_enrollment_status' },
            { table: 'payments', index: 'payments_paid_at' },
        ];

        for (const { table, index } of indexesToCheck) {
            try {
                // Check if index exists
                const [indexExists] = await sequelize.query(`
                    SELECT COUNT(*) as count
                    FROM INFORMATION_SCHEMA.STATISTICS
                    WHERE TABLE_SCHEMA = '${config.database.name}'
                    AND TABLE_NAME = '${table}'
                    AND INDEX_NAME = '${index}';
                `);

                if (indexExists[0].count > 0) {
                    logger.warn(`Found duplicate index: ${table}.${index}`);

                    // Ask user if they want to drop it
                    console.log(`\n❓ Found duplicate index: ${table}.${index}`);
                    console.log(`   This might be causing sync issues.`);
                    console.log(`   Consider dropping it manually or using DB_SYNC_FORCE=true`);
                    console.log(`   SQL: ALTER TABLE ${table} DROP INDEX ${index};`);
                }
            } catch (error) {
                logger.error(`Error checking index ${table}.${index}:`, error.message);
            }
        }

        console.log('\n💡 Recommendations:');
        console.log('1. If you want to keep existing data: Remove DB_SYNC from environment');
        console.log('2. If you want fresh schema: Set DB_SYNC_FORCE=true (WILL DELETE ALL DATA)');
        console.log('3. For production: Ensure DB_SYNC is not set');

    } catch (error) {
        logger.error('Failed to check database indexes:', error);
    } finally {
        await sequelize.close();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    fixDuplicateIndexes();
}

export { fixDuplicateIndexes };