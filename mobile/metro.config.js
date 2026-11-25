const { getDefaultConfig } = require('expo/metro-config');

/** Keep Expo defaults. Preferring `browser` globally made native resolve web builds and crash Expo Go on scan. */
const config = getDefaultConfig(__dirname);

module.exports = config;
