import { LocationObjectCoords } from 'expo-location';

export type LocationPoint = LocationObjectCoords & { timestamp: number };
