import { Router } from 'express';
import { HealthController } from '@/controllers/health.controller';
import { HealthCheckMiddleware } from '@/middleware/healthCheck.middleware';

const router = Router();

// Middleware de verificação rápida para todas as rotas de health
router.use(HealthCheckMiddleware.quickCheck());

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check básico
 *     description: Verifica o status básico da aplicação
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Aplicação saudável
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [healthy, unhealthy, degraded]
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: number
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: number
 *                         total:
 *                           type: number
 *                         percentage:
 *                           type: number
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [connected, disconnected, error]
 *                         responseTime:
 *                           type: number
 *                     performance:
 *                       type: object
 *                       properties:
 *                         responseTime:
 *                           type: number
 *                         threshold:
 *                           type: number
 *       503:
 *         description: Aplicação com problemas
 */
router.get('/', HealthController.getHealth);

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Health check detalhado
 *     description: Verifica o status detalhado da aplicação incluindo informações do sistema
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Informações detalhadas de saúde
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [healthy, unhealthy, degraded]
 *                     system:
 *                       type: object
 *                       properties:
 *                         nodeVersion:
 *                           type: string
 *                         platform:
 *                           type: string
 *                         arch:
 *                           type: string
 *                         pid:
 *                           type: number
 *                     performance:
 *                       type: object
 *                       properties:
 *                         responseTime:
 *                           type: number
 *                         threshold:
 *                           type: number
 *                         withinThreshold:
 *                           type: boolean
 *       503:
 *         description: Aplicação com problemas críticos
 */
router.get('/detailed', HealthController.getDetailedHealth);

/**
 * @swagger
 * /health/metrics:
 *   get:
 *     summary: Métricas no formato Prometheus
 *     description: Retorna métricas de saúde no formato Prometheus para monitoramento
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Métricas em formato Prometheus
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: |
 *                 # HELP api_health_status API health status (1=healthy, 0=unhealthy)
 *                 # TYPE api_health_status gauge
 *                 api_health_status{environment="production",version="1.0.0"} 1
 *                 
 *                 # HELP api_uptime_seconds API uptime in seconds
 *                 # TYPE api_uptime_seconds counter
 *                 api_uptime_seconds{environment="production",version="1.0.0"} 3600
 *       503:
 *         description: Erro ao coletar métricas
 */
router.get('/metrics', HealthController.getMetrics);

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Verificação de readiness (Kubernetes)
 *     description: Verifica se a aplicação está pronta para receber tráfego
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Aplicação pronta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     ready:
 *                       type: boolean
 *                     database:
 *                       type: string
 *                     memory:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       503:
 *         description: Aplicação não está pronta
 */
router.get('/ready', HealthController.getReadiness);

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Verificação de liveness (Kubernetes)
 *     description: Verifica se a aplicação está viva e respondendo
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Aplicação viva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     alive:
 *                       type: boolean
 *                     uptime:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       503:
 *         description: Aplicação não está respondendo
 */
router.get('/live', HealthController.getLiveness);

/**
 * @swagger
 * /health/status:
 *   get:
 *     summary: Status do middleware de health check
 *     description: Retorna informações sobre o status do middleware de health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Status do middleware
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     lastCheck:
 *                       type: number
 *                     consecutiveFailures:
 *                       type: number
 *                     timeSinceLastCheck:
 *                       type: number
 */
router.get('/status', (req, res) => {
  const status = HealthCheckMiddleware.getLastHealthCheckStatus();
  
  res.json({
    success: true,
    data: status
  });
});

/**
 * @swagger
 * /health/reset:
 *   post:
 *     summary: Reseta contador de falhas
 *     description: Reseta o contador de falhas consecutivas do health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Contador resetado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/reset', (req, res) => {
  HealthCheckMiddleware.resetFailureCount();
  
  res.json({
    success: true,
    message: 'Health check failure count reset successfully'
  });
});

export default router;
