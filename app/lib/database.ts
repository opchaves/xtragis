import { SQLiteDatabase } from 'expo-sqlite';
import { runMigrations } from './migrations';

export async function initDB(db: SQLiteDatabase) {
  db.execAsync('PRAGMA journal_mode = WAL;');
  db.execAsync('PRAGMA foreign_keys = ON;');

  await runMigrations(db);
}

export type Ride = {
  id?: number;
  name: string;
  startTime: string;
  duration: number;
  gpxPath: string;
};

export async function saveRideMetadata(db: SQLiteDatabase, args: Ride) {
  const { name, startTime, duration, gpxPath } = args;

  const sqlStmt = await db.prepareAsync(
    'INSERT INTO rides (name, startTime, duration, gpxPath) VALUES (?, ?, ?, ?)'
  );

  await db.withTransactionAsync(async () => {
    await sqlStmt.executeAsync([name, startTime, duration, gpxPath]);
  });
}

export async function getRides(db: SQLiteDatabase) {
  const sqlStmt = await db.prepareAsync('SELECT * FROM rides ORDER BY startTime DESC');
  const result = await sqlStmt.executeAsync<Ride>();
  return result;
}

export async function queueForUpload(db: SQLiteDatabase, rideId: number, gpxPath: string) {
  const sqlStmt = await db.prepareAsync('INSERT INTO upload_queue (rideId, gpxPath) VALUES (?, ?)');

  await db.withTransactionAsync(async () => {
    await sqlStmt.executeAsync([rideId, gpxPath]);
  });
}

export async function deleteFromQueue(db: SQLiteDatabase, queueId: number) {
  const sqlStmt = await db.prepareAsync('DELETE FROM upload_queue WHERE id = ?');

  await db.withTransactionAsync(async () => {
    await sqlStmt.executeAsync([queueId]);
  });
}

export async function getRideById(db: SQLiteDatabase, rideId: number) {
  const sqlStmt = await db.prepareAsync('SELECT * FROM rides WHERE id = ?');
  const result = await sqlStmt.executeAsync<Ride>([rideId]);
  const ride = await result.getFirstAsync();

  if (!ride) {
    throw new Error(`Ride with ID ${rideId} not found`);
  }

  return ride;
}
