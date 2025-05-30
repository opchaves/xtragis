import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import RNFS from 'react-native-fs';

export const BACKGROUND_TRACKINT_TASK = 'background-tracking-task';

TaskManager.defineTask(BACKGROUND_TRACKINT_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background task error:', error);
    return;
  }

  // TODO: create type for `data`
  const { locations } = data as any;
  const tmpPath = `${RNFS.DocumentDirectoryPath}/temp_locations.json`;
  try {
    const content = await RNFS.readFile(tmpPath, 'utf8');
    const existing = content ? JSON.parse(content) : [];
    // TODO: create `loc` type
    const newLocations = locations.map((loc: any) => ({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      // TODO: make sure timestamp is being set
      // timestamp: loc.timestamp,
    }));
    await RNFS.writeFile(tmpPath, JSON.stringify([...existing, ...newLocations]), 'utf8');
  } catch {
    const newLocations = locations.map((loc: any) => ({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      // timestamp: loc.timestamp,
    }));
    await RNFS.writeFile(tmpPath, JSON.stringify(newLocations), 'utf8');
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

export async function startForegroundTracking(
  calback: (location: Location.LocationObjectCoords) => void
) {
  await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000, // 1 second
      distanceInterval: 10, // 10 meters
    },
    (loc) => {
      calback(loc.coords);
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
  const tmpPath = `${RNFS.DocumentDirectoryPath}/temp_locations.json`;
  try {
    const content = await RNFS.readFile(tmpPath, 'utf8');
    const locations = content ? JSON.parse(content) : [];
    await RNFS.unlink(tmpPath); // Clear the file after reading
    // TODO: set type after parsing
    return locations;
  } catch (error) {
    console.error('Error reading temporary locations:', error);
    return [];
  }
}
