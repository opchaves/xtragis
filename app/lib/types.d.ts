import { LocationObjectCoords } from 'expo-location';

export type LocationPoint = LocationObjectCoords & { timestamp: number };

export type Ride = {
  id?: number;
  name: string;
  startTime: string;
  duration: number;
  gpxPath: string;
};

export type UploadQueueItem = {
  id?: number;
  rideId: number;
  gpxPath: string;
};
