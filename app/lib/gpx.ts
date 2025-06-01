import RNFS from 'react-native-fs';
import { LocationPoint } from './types';

export function generateGPX(locations: LocationPoint[], rideName: string) {
  const startTime = new Date(locations[0].timestamp).toISOString();
  const trkPts = locations
    .map((loc) => {
      return `<trkpt lat="${loc.latitude}" lon="${loc.longitude}">
        <ele>${loc.altitude || 0}</ele>
        <time>${new Date(loc.timestamp).toISOString()}</time>
      </trkpt>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <gpx creator="Xtragis"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"
       version="1.1"
       xmlns="http://www.topografix.com/GPX/1/1">
    <metadata>
      <name>${rideName}</name>
      <link href="opchaves.com">
        <text>Outdoor Cycling</text>
      </link>
      <time>${startTime}</time>
    </metadata>
    <trk>
      <name>${rideName}</name>
      <trkseg>
        ${trkPts}
      </trkseg>
    </trk>
  </gpx>`;
}

export async function saveGPXFile(
  locations: LocationPoint[],
  rideName?: string,
  filePath?: string
) {
  if (!locations || locations.length === 0) {
    return new Error('No locations provided to save GPX file.');
  }

  const startDate = new Date(locations[0].timestamp);
  rideName = rideName || newName(startDate);
  const gpxContent = generateGPX(locations, rideName);

  try {
    filePath = filePath || `${RNFS.DocumentDirectoryPath}/${rideName}.gpx`;
    await RNFS.writeFile(filePath, gpxContent, 'utf8');
    console.log(`GPX file saved to ${filePath}`);
  } catch (error) {
    return error as Error;
  }
}

function newName(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `Ride-${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}
