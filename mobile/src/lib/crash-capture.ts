import AsyncStorage from '@react-native-async-storage/async-storage';

export const LAST_CRASH_KEY = 'lbl:lastCrash';

export type LastCrash = {
  message: string;
  stack: string | null;
  isFatal: boolean;
  time: string;
};

type ErrorUtilsLike = {
  getGlobalHandler?: () => ((error: Error, isFatal?: boolean) => void) | undefined;
  setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void;
};

function isLazyChunkError(error: Error | null | undefined) {
  return /Requiring unknown module/.test(error?.message ?? '');
}

export function saveLastCrash(error: Error, isFatal: boolean): Promise<void> {
  if (isLazyChunkError(error)) return Promise.resolve();
  const payload: LastCrash = {
    message: error?.message ?? String(error),
    stack: error?.stack ?? null,
    isFatal: Boolean(isFatal),
    time: new Date().toISOString(),
  };
  return AsyncStorage.setItem(LAST_CRASH_KEY, JSON.stringify(payload)).catch(() => {});
}

export function readLastCrash(): Promise<LastCrash | null> {
  return AsyncStorage.getItem(LAST_CRASH_KEY)
    .then((raw) => {
      if (!raw) return null;
      try {
        return JSON.parse(raw) as LastCrash;
      } catch {
        return null;
      }
    })
    .catch(() => null);
}

export function clearLastCrash(): Promise<void> {
  return AsyncStorage.removeItem(LAST_CRASH_KEY).catch(() => {});
}

let installed = false;

export function installCrashCapture() {
  if (installed) return;
  installed = true;
  const ErrorUtils = (globalThis as { ErrorUtils?: ErrorUtilsLike }).ErrorUtils;
  if (!ErrorUtils?.setGlobalHandler) return;
  const previous = ErrorUtils.getGlobalHandler?.();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    if (isLazyChunkError(error)) return;
    void saveLastCrash(error, Boolean(isFatal)).finally(() => {
      previous?.(error, isFatal);
    });
  });
}
