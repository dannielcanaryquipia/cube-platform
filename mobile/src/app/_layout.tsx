import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { BootErrorBoundary } from '@/components/boot-error-boundary';
import { BootScreen } from '@/components/boot-screen';
import { CrashReport } from '@/components/crash-report';
import { HeaderBack } from '@/components/header-back';
import { Colors, Rubik } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { bootLog } from '@/lib/boot-log';

bootLog('root layout module loaded');

void SplashScreen.preventAutoHideAsync()
  .then(() => bootLog('native splash held'))
  .catch((e) => bootLog('native splash hold failed', String(e)));

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    Rubik_400Regular: require('../../assets/fonts/Rubik_400Regular.ttf'),
    Rubik_500Medium: require('../../assets/fonts/Rubik_500Medium.ttf'),
    Rubik_600SemiBold: require('../../assets/fonts/Rubik_600SemiBold.ttf'),
    Rubik_700Bold: require('../../assets/fonts/Rubik_700Bold.ttf'),
    Rubik_800ExtraBold: require('../../assets/fonts/Rubik_800ExtraBold.ttf'),
  });
  const [booted, setBooted] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const c = Colors[isDark ? 'dark' : 'light'];

  useEffect(() => {
    bootLog('root layout mounted');
    void SystemUI.setBackgroundColorAsync(c.bg);
  }, [c.bg]);

  useEffect(() => {
    if (loaded || fontError) {
      bootLog('fonts ready, hiding native splash', { loaded, fontError: fontError ? String(fontError) : null });
      void SplashScreen.hideAsync()
        .then(() => bootLog('native splash hidden'))
        .catch((e) => bootLog('native splash hide failed', String(e)));
      return;
    }
    const timeout = setTimeout(() => {
      bootLog('font timeout, hiding native splash');
      void SplashScreen.hideAsync().catch((e) => bootLog('native splash hide failed', String(e)));
    }, 1800);
    return () => clearTimeout(timeout);
  }, [loaded, fontError]);

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: c.bg,
      card: c.bg,
      text: c.ink,
      border: c.line,
      primary: c.accent,
      notification: c.accent,
    },
  };

  return (
    <BootErrorBoundary>
      <ThemeProvider value={navTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: c.bg },
            headerTintColor: c.ink,
            headerShadowVisible: false,
            headerTitleStyle: { fontFamily: Rubik.semibold, fontSize: 17, color: c.ink },
            headerBackTitle: 'Back',
            headerBackTitleStyle: { fontFamily: Rubik.medium },
            headerBackButtonDisplayMode: 'minimal',
            headerLeft: ({ canGoBack }) => (canGoBack ? <HeaderBack /> : undefined),
            contentStyle: { backgroundColor: c.bg, flex: 1 },
            // Default native-stack pop slides the current screen to the right
            // and flashes a white card behind it. Fade on both platforms.
            animation: 'fade',
            animationDuration: 180,
            gestureEnabled: true,
            fullScreenGestureEnabled: false,
            animationMatchesGesture: true,
            navigationBarColor: c.bg,
            statusBarBackgroundColor: c.bg,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="case/[id]" options={{ title: 'Case' }} />
          <Stack.Screen name="set/[id]" options={{ title: 'Set' }} />
          <Stack.Screen name="notation" options={{ title: 'Notation' }} />
          <Stack.Screen name="cross" options={{ title: 'Cross' }} />
          <Stack.Screen name="search" options={{ title: 'Search' }} />
          <Stack.Screen name="solve" options={{ title: 'Solve' }} />
        </Stack>
        {!booted ? <BootScreen onDone={() => setBooted(true)} /> : null}
        <CrashReport />
      </ThemeProvider>
    </BootErrorBoundary>
  );
}
