// scripts/run-migration.ts
import { MongoClient } from "mongodb";
import path from "path";
import dotenv from "dotenv";
import * as readline from 'readline';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const args = process.argv.slice(2);
const fileName = args[0]; // eg: "20250726120000-fix-favorite-groups"

console.log('\n');

if (!fileName) {
    console.error("❌ Please pass a migration filename to run.");
    process.exit(1);
}

const migrationPath = path.resolve(__dirname, `../migrations/${fileName}.ts`);

(async () => {
    const migration = await import(migrationPath);

    if (!migration.up || typeof migration.up !== "function") {
        console.error("❌ Migration file must export an 'up' function.");
        process.exit(1);
    }

    const client = new MongoClient(MONGO_URI!);
    console.log(`Connecting to Database...`, '\n');
    await client.connect();
    const db = client.db();
    console.log(`Connected to Database: ${db.databaseName}`, '\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(`Do you want to run the migration in ${db.databaseName}? (y/n): `, async (answer: string) => {
        if (answer.trim().toLowerCase() === 'y') {
            console.log(`🚀 Running migration: ${fileName}`, '\n');
            await migration.up(db, client);
            await client.close();
        } else {
            console.log('Migration cancelled.');
            process.exit(1);
        }
        rl.close();
    });

    console.log("✅ Migration completed.");
})();
