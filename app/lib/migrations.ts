import { SQLiteDatabase } from 'expo-sqlite';

export const MIGRATIONS = [runMigration001];
export const DB_VERSION = MIGRATIONS.length;

export async function runMigrations(db: SQLiteDatabase) {
  // @ts-ignore
  let { user_version: currentDbVersion } = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );

  for (let i = currentDbVersion; i < DB_VERSION; i++) {
    await MIGRATIONS[i](db);
    currentDbVersion += 1;
  }

  await db.execAsync(`PRAGMA user_version = ${currentDbVersion};`);
}

async function runMigration001(db: SQLiteDatabase) {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS rides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        startTime TEXT,
        duration INTEGER,
        gpxPath TEXT
      );`
  );
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS upload_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rideId INTEGER,
        gpxPath TEXT
      );`
  );
  console.log('Migration 001 completed.');
}
