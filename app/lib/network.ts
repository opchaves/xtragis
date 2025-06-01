import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';
import { queueForUpload, deleteFromQueue, getQueuedUploads, getRideById } from './database';
import { SQLiteDatabase } from 'expo-sqlite';
import { Ride } from './types';
import { newName } from './gpx';

const API_URL = 'http://localhost:3000/api/rides/upload';

export async function uploadRide(db: SQLiteDatabase, ride: Required<Ride>, gpxPath: string) {
  const { isConnected } = await NetInfo.fetch();
  if (!isConnected) {
    console.warn('No internet connection. Ride will be queued for upload.');
    await queueForUpload(db, ride.id, gpxPath);
    return;
  }
  try {
    const formData = new FormData();
    const rideName = newName(new Date(ride.startTime));
    const file = new File([`file://${gpxPath}`], `${rideName}.gpx`, {
      type: 'application/gpx+xml',
    });
    formData.append('metadata', JSON.stringify(ride));
    formData.append('gpx', file);
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.ok) {
      await FileSystem.deleteAsync(gpxPath, { idempotent: true });
    } else {
      console.error('Failed to upload. Ride will be queued', response.statusText);
      await queueForUpload(db, ride.id, gpxPath);
    }
  } catch (error) {
    console.error('Error uploading ride:', error);
    await queueForUpload(db, ride.id, gpxPath);
  }
}

export function retryQueuedUPloads(db: SQLiteDatabase) {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      getQueuedUploads(db).then(async (uploads) => {
        for (const item of uploads) {
          const ride = await getRideById(db, item.rideId);
          if (ride) {
            await uploadRide(db, ride, item.gpxPath);
            await deleteFromQueue(db, item.id);
            console.log(`Successfully uploaded ride ${ride.name} from queue.`);
          }
        }
      });
    }
  });
  return unsubscribe;
}
