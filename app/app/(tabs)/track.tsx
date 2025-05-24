import { Stack } from 'expo-router';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Ride', headerTitleAlign: 'center' }} />
      <Container>
        <ScreenContent path="app/(tabs)/two.tsx" title="Ride" />
      </Container>
    </>
  );
}
