import { Platform } from 'react-native';

const startedAt = Date.now();

type ErrorUtilsLike = {
  getGlobalHandler?: () => ((error: Error, isFatal?: boolean) => void) | undefined;
  setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void;
};

export function bootLog(step: string, extra?: unknown) {
  const ms = Date.now() - startedAt;
  if (extra !== undefined) {
    console.log(`[lbl +${ms}ms] ${step}`, extra);
  } else {
    console.log(`[lbl +${ms}ms] ${step}`);
  }
}

function installUnhandledRejections() {
  const hermes = (globalThis as { HermesInternal?: { enablePromiseRejectionTracker?: (opts: object) => void } })
    .HermesInternal;
  hermes?.enablePromiseRejectionTracker?.({
    allRejections: true,
    onUnhandled: (id: number, error: unknown) => {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`[lbl] unhandled rejection #${id}`, err.message, err.stack);
    },
    onHandled: () => {},
  });
}

function installFatalHandler() {
  const ErrorUtils = (globalThis as { ErrorUtils?: ErrorUtilsLike }).ErrorUtils;
  if (!ErrorUtils?.setGlobalHandler) return;
  const previous = ErrorUtils.getGlobalHandler?.();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    // Expo SDK 56+ web/DOM asyncRequire tries importAll() before the split
    // chunk loads. Metro reports that as fatal; the chunk then loads and the
    // import succeeds. cubing.js 3D hits this on every play.
    if (/Requiring unknown module/.test(error?.message ?? '')) {
      console.log('[lbl] metro lazy chunk (not fatal)', error.message);
      return;
    }
    console.error('[lbl] JS error', {
      isFatal: Boolean(isFatal),
      message: error?.message,
      stack: error?.stack,
    });
    previous?.(error, isFatal);
  });
}

let installed = false;

export function installBootLogs() {
  if (installed) return;
  installed = true;
  try {
    installFatalHandler();
  } catch (e) {
    console.log('[lbl] fatal handler skipped', e);
  }
  try {
    installUnhandledRejections();
  } catch (e) {
    console.log('[lbl] rejection tracker skipped', e);
  }
  bootLog('js runtime alive', {
    os: Platform.OS,
    version: String(Platform.Version),
  });
}

installBootLogs();
