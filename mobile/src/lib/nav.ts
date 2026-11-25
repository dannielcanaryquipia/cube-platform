import { router, type Href } from 'expo-router';

/** Stack back with a safe home fallback when there is no history (web deep links). */
export function goBack(fallback: Href = '/') {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}
