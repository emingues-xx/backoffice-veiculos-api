import { Request, Response, NextFunction } from 'express';
import { redisClient } from '@/config/redis';

export interface CacheOptions {
  ttl?: number; // Time to live em segundos
  keyPrefix?: string;
}

/**
 * Middleware de cache Redis
 * Cacheia responses de endpoints GET
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl = 300, keyPrefix = 'cache' } = options; // Default 5 minutos

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Apenas cacheia requisições GET
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Se Redis não está conectado, pula o cache
    if (!redisClient.isConnected()) {
      next();
      return;
    }

    try {
      // Gera chave de cache baseada na URL e query params
      const cacheKey = `${keyPrefix}:${req.originalUrl || req.url}`;

      // Tenta buscar do cache
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        // Cache hit - retorna dados cacheados
        const parsed = JSON.parse(cachedData);
        res.json(parsed);
        return;
      }

      // Cache miss - intercepta o res.json para cachear a resposta
      const originalJson = res.json.bind(res);

      res.json = function (data: any): Response {
        // Apenas cacheia respostas de sucesso
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.set(cacheKey, JSON.stringify(data), ttl).catch(err => {
            console.error('Redis cache set error:', err);
          });
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Middleware para invalidar cache
 * Limpa cache com prefixo específico
 */
export const invalidateCacheMiddleware = (keyPattern: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (redisClient.isConnected()) {
        // Invalida após a resposta ser enviada
        res.on('finish', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            redisClient.del(keyPattern).catch(err => {
              console.error('Cache invalidation error:', err);
            });
          }
        });
      }
      next();
    } catch (error) {
      console.error('Cache invalidation middleware error:', error);
      next();
    }
  };
};

export default cacheMiddleware;
