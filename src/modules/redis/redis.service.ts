import { Inject, Injectable } from '@nestjs/common';
import Keyv, { KeyvEntry } from 'keyv';

@Injectable()
export class RedisService {
  constructor(@Inject('KEYV_INSTANCE') private readonly keyv: Keyv) {}

  async get<T>(key: string): Promise<T> {
    return await this.keyv.get(key);
  }

  async getMany<T>(keys: string[]): Promise<T[]> {
    return await this.keyv.getMany(keys);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    return await this.keyv.set(key, value, ttl);
  }

  async setMany(entries: KeyvEntry[]): Promise<boolean[]> {
    return await this.keyv.setMany(entries);
  }

  async delete(key: string): Promise<boolean> {
    return await this.keyv.delete(key);
  }

  async deleteMany(keys: string[]): Promise<boolean> {
    return await this.keyv.deleteMany(keys);
  }

  async clear(): Promise<void> {
    return await this.keyv.clear();
  }

  async has(key: string): Promise<boolean> {
    return await this.keyv.has(key);
  }

  async hasMany(keys: string[]): Promise<boolean[]> {
    return await this.keyv.hasMany(keys);
  }
}
