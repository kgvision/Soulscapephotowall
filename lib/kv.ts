import { Redis } from "@upstash/redis";

// Minimal command surface the store needs — kept small and backend-agnostic
// so a real Redis-backed store (production, on Vercel) and an in-memory
// stand-in (local dev without a Redis integration connected) share one
// interface and one code path in store.ts.
export interface KvBackend {
  hgetall(key: string): Promise<Record<string, string> | null>;
  hset(key: string, fields: Record<string, string | number>): Promise<void>;
  lpush(key: string, value: string): Promise<void>;
  lrange(key: string, start: number, stop: number): Promise<string[]>;
}

class RedisBackend implements KvBackend {
  constructor(private client: Redis) {}

  async hgetall(key: string) {
    const result = await this.client.hgetall<Record<string, string>>(key);
    return result && Object.keys(result).length > 0 ? result : null;
  }

  async hset(key: string, fields: Record<string, string | number>) {
    await this.client.hset(key, fields);
  }

  async lpush(key: string, value: string) {
    await this.client.lpush(key, value);
  }

  async lrange(key: string, start: number, stop: number) {
    return this.client.lrange<string>(key, start, stop);
  }
}

class MemoryBackend implements KvBackend {
  private hashes = new Map<string, Record<string, string>>();
  private lists = new Map<string, string[]>();

  async hgetall(key: string) {
    const h = this.hashes.get(key);
    return h && Object.keys(h).length > 0 ? { ...h } : null;
  }

  async hset(key: string, fields: Record<string, string | number>) {
    const existing = this.hashes.get(key) ?? {};
    for (const [k, v] of Object.entries(fields)) existing[k] = String(v);
    this.hashes.set(key, existing);
  }

  async lpush(key: string, value: string) {
    const list = this.lists.get(key) ?? [];
    list.unshift(value);
    this.lists.set(key, list);
  }

  async lrange(key: string, start: number, stop: number) {
    const list = this.lists.get(key) ?? [];
    const end = stop === -1 ? list.length : stop + 1;
    return list.slice(start, end);
  }
}

function resolveCredentials() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

interface Globals {
  __soulscapeKv?: KvBackend;
}
const g = globalThis as unknown as Globals;

const credentials = resolveCredentials();

if (!g.__soulscapeKv) {
  g.__soulscapeKv = credentials ? new RedisBackend(new Redis(credentials)) : new MemoryBackend();
}

export const kv: KvBackend = g.__soulscapeKv;
// Lets API routes/logs make it obvious when a deploy is quietly running on
// the in-memory fallback (fine for local dev, wrong for a real multi-instance
// deployment) instead of a real shared Redis store.
export const usingRealRedis = Boolean(credentials);
