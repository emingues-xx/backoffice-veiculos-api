import { Router } from 'express';
import metricsController from '@/controllers/metricsController';
import { authenticate } from '@/middleware/auth';
import { cacheMiddleware } from '@/middleware/cache.middleware';
import { validate } from '@/middleware/validation';
import { metricsQuerySchema } from '@/utils/validators/metricsValidator';

const router = Router();

// Todos os endpoints requerem autenticação
router.use(authenticate);

/**
 * @swagger
 * /api/metrics/total-sales:
 *   get:
 *     summary: Retorna total de vendas no período
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Total de vendas
 *       401:
 *         description: Não autorizado
 */
router.get(
  '/total-sales',
  validate(metricsQuerySchema),
  cacheMiddleware({ ttl: 300, keyPrefix: 'metrics:total-sales' }),
  metricsController.getTotalSales
);

/**
 * @swagger
 * /api/metrics/daily-sales:
 *   get:
 *     summary: Retorna vendas diárias no período
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendas diárias
 */
router.get(
  '/daily-sales',
  validate(metricsQuerySchema),
  cacheMiddleware({ ttl: 300, keyPrefix: 'metrics:daily-sales' }),
  metricsController.getDailySales
);

/**
 * @swagger
 * /api/metrics/average-ticket:
 *   get:
 *     summary: Retorna ticket médio no período
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket médio
 */
router.get(
  '/average-ticket',
  validate(metricsQuerySchema),
  cacheMiddleware({ ttl: 300, keyPrefix: 'metrics:average-ticket' }),
  metricsController.getAverageTicket
);

/**
 * @swagger
 * /api/metrics/conversion-rate:
 *   get:
 *     summary: Retorna taxa de conversão no período
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Taxa de conversão
 */
router.get(
  '/conversion-rate',
  validate(metricsQuerySchema),
  cacheMiddleware({ ttl: 300, keyPrefix: 'metrics:conversion-rate' }),
  metricsController.getConversionRate
);

/**
 * @swagger
 * /api/metrics/average-time:
 *   get:
 *     summary: Retorna tempo médio de venda
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tempo médio de venda
 */
router.get(
  '/average-time',
  validate(metricsQuerySchema),
  cacheMiddleware({ ttl: 300, keyPrefix: 'metrics:average-time' }),
  metricsController.getAverageTime
);

/**
 * @swagger
 * /api/metrics/summary:
 *   get:
 *     summary: Retorna resumo completo de todas as métricas
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resumo de métricas
 */
router.get(
  '/summary',
  validate(metricsQuerySchema),
  cacheMiddleware({ ttl: 300, keyPrefix: 'metrics:summary' }),
  metricsController.getMetricsSummary
);

export default router;
