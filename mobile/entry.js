const { installCrashCapture, saveLastCrash } = require('./src/lib/crash-capture');

installCrashCapture();

try {
  require('expo-router/entry');
} catch (error) {
  const err = error instanceof Error ? error : new Error(String(error));
  saveLastCrash(err, true);
  throw err;
}
