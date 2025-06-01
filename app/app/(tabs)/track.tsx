import { Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { AppState, SafeAreaView, StyleSheet, View } from 'react-native';
import MapView, { LatLng, Marker, Polyline } from 'react-native-maps';
import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import { saveRideMetadata } from '~/lib/database';
import { newName, saveGPXFile } from '~/lib/gpx';
import {
  getTempLocations,
  requestLocationPermissions,
  startBackgroundTracking,
  startForegroundTracking,
  stopBackgroundTracking,
} from '~/lib/location';
import { LocationPoint } from '~/lib/types';

export default function Home() {
  const db = useSQLiteContext();
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [tracking, setTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isScreenOn, setIsScreenOn] = useState(true);
  const [startPoint, setStartPoint] = useState<LatLng>({
    latitude: -5.08649, // Default latitude (Teresina)
    longitude: -42.80309, // Default longitude
  });
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setIsScreenOn(nextAppState === 'active');
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (locations.length > 0) {
      setStartPoint({
        latitude: locations[0].latitude,
        longitude: locations[0].longitude,
      });
    }
  }, [locations]);

  useEffect(() => {
    let subscription: { remove: () => void } | undefined;
    (async () => {
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        console.warn('Location permissions not granted');
        return;
      }

      if (tracking) {
        if (isScreenOn) {
          subscription = await startForegroundTracking((location) => {
            setLocations((prev) => [...prev, location]);
          });
        } else {
          await startBackgroundTracking();
        }
      }
    })();
    return () => {
      subscription?.remove();
      if (!isScreenOn && tracking) {
        stopBackgroundTracking();
      }
    };
  }, [tracking, isScreenOn]);

  const startTacking = async () => {
    setStartTime(new Date());
    setLocations([]);
    setTracking(true);
  };

  const stopTracking = async () => {
    setTracking(false);
    if (!isScreenOn) {
      await stopBackgroundTracking();
    }
    // TODO: is the order of locations always correct?
    const allLocations = [...locations, ...(await getTempLocations())];
    const rideName = newName(startTime!);
    const duration = Math.floor((Date.now() - new Date(startTime!).getTime()) / 1000);
    const gpxPath = await saveGPXFile(allLocations, rideName);
    await saveRideMetadata(db, {
      duration,
      gpxPath,
      name: rideName,
      startTime: startTime!.toISOString(),
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Ride', headerTitleAlign: 'center' }} />
      <SafeAreaView className="flex flex-1">
        {isScreenOn && (
          <MapView
            style={styles.map}
            region={{
              ...startPoint,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}>
            <Marker coordinate={startPoint} />
            {locations.length > 1 && (
              <Polyline
                coordinates={locations.map((loc) => ({
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }))}
                strokeColor="#3b82f6"
                strokeWidth={4}
              />
            )}
          </MapView>
        )}
        <View className="absolute bottom-4 left-4 right-4">
          <Button
            className="mx-auto w-1/4 bg-blue-600"
            title={tracking ? 'Stop' : 'Start'}
            onPress={tracking ? stopTracking : startTacking}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});
