/**
 * Validates that all Sequelize models are correctly loaded and associated.
 * Run with: node scripts/validate-models.js
 */

import models, { sequelize } from '../src/models/index.js';

async function validateModels() {
    console.log('🔍 Starting Model Validation...\n');

    const modelNames = Object.keys(models);
    console.log(`✅ Loaded ${modelNames.length} models:`);
    console.log(modelNames.join(', '));
    console.log('\n----------------------------------------\n');

    let errorCount = 0;

    for (const name of modelNames) {
        const model = models[name];
        console.log(`Checking [${name}]...`);

        // Check if table name is set
        console.log(`  - Table: ${model.tableName}`);

        // Check associations
        if (model.associations) {
            const associations = Object.keys(model.associations);
            console.log(`  - Associations: ${associations.length > 0 ? associations.join(', ') : 'None'}`);

            // Verify association targets exist
            associations.forEach(assocName => {
                const association = model.associations[assocName];
                if (!association.target) {
                    console.error(`  ❌ Error: Association '${assocName}' in ${name} has no target model!`);
                    errorCount++;
                }
            });
        } else {
            console.log(`  - Associations: None`);
        }

        console.log('');
    }

    console.log('----------------------------------------');

    if (errorCount === 0) {
        console.log('🎉 SUCCESS: All models validated and associations look correct.');
        console.log('   (Note: This does not verify database connection or table existence, only JS definitions)');
    } else {
        console.error(`💥 FAILED: Found ${errorCount} errors in model definitions.`);
        process.exit(1);
    }

    // Optional: Check DB connection
    try {
        await sequelize.authenticate();
        console.log('\n✅ Database connection verified.');
    } catch (e) {
        console.warn('\n⚠️  Could not connect to database (expected if DB not running), but models are valid JS.');
        // Don't fail the script just for DB connection if we are just testing model logic
    }

    process.exit(0);
}

validateModels().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
