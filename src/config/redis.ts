import { createClient, RedisClientType } from 'redis';
import { config } from '@/config/config';

class RedisClient {
  private client: RedisClientType | null = null;
  private connected = false;

  async connect(): Promise<void> {
    if (this.connected && this.client?.isOpen) {
      return;
    }

    try {
      this.client = createClient({
        url: config.redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              return new Error('Redis max retries reached');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.connected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis connecting...');
      });

      this.client.on('ready', () => {
        console.log('Redis connected successfully');
        this.connected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis disconnected');
        this.connected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.connected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.quit();
      this.connected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client?.isOpen) {
      return null;
    }
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client?.isOpen) {
      return;
    }
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client?.isOpen) {
      return;
    }
    await this.client.del(key);
  }

  async clear(): Promise<void> {
    if (!this.client?.isOpen) {
      return;
    }
    await this.client.flushDb();
  }

  isConnected(): boolean {
    return this.connected && this.client?.isOpen === true;
  }
}

export const redisClient = new RedisClient();
export default redisClient;
