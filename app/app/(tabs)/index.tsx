import { Stack } from 'expo-router';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home', headerTitleAlign: 'center' }} />
      <Container>
        <ScreenContent path="app/(tabs)/index.tsx" title="Home" />
      </Container>
    </>
  );
}
