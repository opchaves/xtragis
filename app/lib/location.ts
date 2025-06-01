import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as FileSystem from 'expo-file-system';
import { LocationPoint } from './types';

export const BACKGROUND_TRACKINT_TASK = 'background-tracking-task';

TaskManager.defineTask(BACKGROUND_TRACKINT_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background task error:', error);
    return;
  }

  // TODO: create type for `data`
  const { locations } = data as any;
  const tmpPath = `${FileSystem.documentDirectory}/temp_locations.json`;
  try {
    const content = await FileSystem.readAsStringAsync(tmpPath);
    const existing = content ? JSON.parse(content) : [];
    const newLocations = locations.map((loc: any) => ({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      timestamp: loc.timestamp,
    }));
    const contents = JSON.stringify([...existing, ...newLocations]);
    await FileSystem.writeAsStringAsync(tmpPath, contents);
  } catch {
    const newLocations = locations.map((loc: any) => ({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      timestamp: loc.timestamp,
    }));
    await FileSystem.writeAsStringAsync(tmpPath, JSON.stringify(newLocations));
  }
});

export async function requestLocationPermissions() {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') {
    return false;
  }
  const background = await Location.requestBackgroundPermissionsAsync();
  return background.status === 'granted';
}

export async function startForegroundTracking(calback: (location: LocationPoint) => void) {
  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000, // 1 second
      distanceInterval: 10, // 10 meters
    },
    (loc) => {
      calback({ ...loc.coords, timestamp: loc.timestamp });
    }
  );
}

export async function startBackgroundTracking() {
  await Location.startLocationUpdatesAsync(BACKGROUND_TRACKINT_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 1000, // 1 second
    distanceInterval: 10, // 10 meters
    deferredUpdatesInterval: 1000, // 1 second
    deferredUpdatesDistance: 10, // 10 meters
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'XtraGIS Tracking',
      notificationBody: 'Tracking your location in the background',
      notificationColor: '#0000FF', // Blue color for the notification
    },
  });
}

export async function stopBackgroundTracking() {
  await Location.stopLocationUpdatesAsync(BACKGROUND_TRACKINT_TASK);
}

export async function getTempLocations() {
  const tmpPath = `${FileSystem.documentDirectory}/temp_locations.json`;
  try {
    const fileInfo = await FileSystem.getInfoAsync(tmpPath);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(tmpPath);
      const locations = content ? JSON.parse(content) : [];
      await FileSystem.deleteAsync(tmpPath, { idempotent: true });
      return locations;
    }
    return [];
  } catch (error) {
    console.error('Error reading temporary locations:', error);
    return [];
  }
}
