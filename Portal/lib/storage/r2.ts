import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export type R2ObjectBody = {
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
  httpEtag: string;
  httpMetadata?: { contentType?: string };
};

export type R2Bucket = {
  get(key: string): Promise<R2ObjectBody | null>;
  put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
  delete(key: string | string[]): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ objects: { key: string }[] }>;
};

function storageRoot(): string {
  return path.resolve(
    /* turbopackIgnore: true */ process.env.STORAGE_ROOT || path.join(process.cwd(), ".data"),
  );
}

function resolveKey(key: string): string {
  const normalized = key.replaceAll("\\", "/").replace(/^\/+/, "");
  const root = storageRoot();
  const resolved = path.resolve(root, normalized);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error("Invalid storage key.");
  }
  return resolved;
}

const bucket: R2Bucket = {
  async get(key) {
    try {
      const bytes = await readFile(resolveKey(key));
      return {
        text: async () => bytes.toString("utf8"),
        arrayBuffer: async () =>
          bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
        httpEtag: `"${bytes.byteLength.toString(16)}"`,
        httpMetadata: { contentType: contentTypeForKey(key) },
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  },
  async put(key, value) {
    const target = resolveKey(key);
    await mkdir(path.dirname(target), { recursive: true });
    const bytes =
      typeof value === "string"
        ? Buffer.from(value)
        : ArrayBuffer.isView(value)
          ? Buffer.from(value.buffer, value.byteOffset, value.byteLength)
          : Buffer.from(value);
    await writeFile(target, bytes);
    return {};
  },
  async delete(key) {
    for (const item of Array.isArray(key) ? key : [key]) {
      await rm(resolveKey(item), { force: true });
    }
  },
  async list(options) {
    const prefix = options?.prefix?.replaceAll("\\", "/").replace(/^\/+/, "") || "";
    const objects: { key: string }[] = [];
    try {
      await walk(resolveKey(prefix), prefix, objects);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    return { objects };
  },
};

async function walk(directory: string, prefix: string, objects: { key: string }[]): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const key = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) await walk(absolute, key, objects);
    else objects.push({ key });
  }
}

function contentTypeForKey(key: string): string | undefined {
  const extension = path.extname(key).toLowerCase();
  return {
    ".avif": "image/avif",
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".json": "application/json",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".xml": "application/xml",
  }[extension];
}

export function getBucket(): R2Bucket {
  return bucket;
}
