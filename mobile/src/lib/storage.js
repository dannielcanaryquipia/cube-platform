import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export async function setJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export async function removeKey(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
}
