import { getBucket } from "./r2";

export async function readJsonFile<T>(key: string, fallback: T): Promise<T> {
  const object = await getBucket().get(key);
  if (!object) return fallback;

  try {
    return JSON.parse(await object.text()) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(key: string, value: T): Promise<void> {
  await getBucket().put(key, JSON.stringify(value, null, 2), {
    httpMetadata: { contentType: "application/json" },
  });
}
