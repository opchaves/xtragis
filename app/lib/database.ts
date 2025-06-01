import { SQLiteDatabase } from 'expo-sqlite';
import { runMigrations } from './migrations';
import { Ride, UploadQueueItem } from './types';

export async function initDB(db: SQLiteDatabase) {
  db.execAsync('PRAGMA journal_mode = WAL;');
  db.execAsync('PRAGMA foreign_keys = ON;');

  await runMigrations(db);
}

export async function saveRideMetadata(db: SQLiteDatabase, args: Ride) {
  const { name, startTime, duration, gpxPath } = args;

  const res = await db.runAsync(
    'INSERT INTO rides (name, startTime, duration, gpxPath) VALUES (?, ?, ?, ?)',
    [name, startTime, duration, gpxPath]
  );

  return res.lastInsertRowId;
}

export async function getRides(db: SQLiteDatabase) {
  return db.getAllAsync<Ride>('SELECT * FROM rides ORDER BY startTime DESC');
}

export async function queueForUpload(db: SQLiteDatabase, rideId: number, gpxPath: string) {
  const res = await db.runAsync('INSERT INTO upload_queue (rideId, gpxPath) VALUES (?, ?)', [
    rideId,
    gpxPath,
  ]);
  return res.lastInsertRowId;
}

export async function getQueuedUploads(db: SQLiteDatabase) {
  return db.getAllAsync<Required<UploadQueueItem>>('SELECT * FROM upload_queue');
}

export async function deleteFromQueue(db: SQLiteDatabase, queueId: number) {
  const res = await db.runAsync('DELETE FROM upload_queue WHERE id = ?', [queueId]);
  return res.changes > 0;
}

export async function getRideById(db: SQLiteDatabase, rideId: number) {
  const ride = await db.getFirstAsync<Ride>(`SELECT * FROM rides WHERE id = ?`, [rideId]);

  if (!ride) {
    throw new Error(`Ride with ID ${rideId} not found`);
  }

  return ride as Required<Ride>;
}
