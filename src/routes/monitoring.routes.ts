import { Router } from 'express';
import { JobMonitoringController } from '@/controllers/jobMonitoring.controller';

const router = Router();

/**
 * @swagger
 * /monitoring/jobs/statistics:
 *   get:
 *     summary: Obtém estatísticas de execução de jobs
 *     description: Retorna estatísticas de execução de jobs incluindo taxa de sucesso e duração média
 *     tags: [Job Monitoring]
 *     parameters:
 *       - in: query
 *         name: jobName
 *         schema:
 *           type: string
 *         description: Nome do job para filtrar (opcional)
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Número de dias para análise
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
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
 *                     statistics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           jobName:
 *                             type: string
 *                           totalExecutions:
 *                             type: number
 *                           successRate:
 *                             type: number
 *                           averageDuration:
 *                             type: number
 *                           statuses:
 *                             type: object
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/jobs/statistics', JobMonitoringController.getJobStatistics);

/**
 * @swagger
 * /monitoring/jobs/history:
 *   get:
 *     summary: Obtém histórico de execuções
 *     description: Retorna histórico de execuções de jobs
 *     tags: [Job Monitoring]
 *     parameters:
 *       - in: query
 *         name: jobName
 *         schema:
 *           type: string
 *         description: Nome do job para filtrar (opcional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número máximo de registros
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, running, completed, failed, timeout, cancelled]
 *         description: Status para filtrar (opcional)
 *     responses:
 *       200:
 *         description: Histórico obtido com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/jobs/history', JobMonitoringController.getExecutionHistory);

/**
 * @swagger
 * /monitoring/jobs/running:
 *   get:
 *     summary: Obtém jobs em execução
 *     description: Retorna lista de jobs atualmente em execução
 *     tags: [Job Monitoring]
 *     responses:
 *       200:
 *         description: Lista de jobs em execução
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
 *                     runningJobs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           jobName:
 *                             type: string
 *                           status:
 *                             type: string
 *                           startTime:
 *                             type: string
 *                             format: date-time
 *                           progress:
 *                             type: number
 *                     count:
 *                       type: number
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/jobs/running', JobMonitoringController.getRunningJobs);

/**
 * @swagger
 * /monitoring/jobs/{executionId}/cancel:
 *   post:
 *     summary: Cancela um job em execução
 *     description: Cancela um job que está atualmente em execução
 *     tags: [Job Monitoring]
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da execução do job
 *     responses:
 *       200:
 *         description: Job cancelado com sucesso
 *       404:
 *         description: Job não encontrado ou não está em execução
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/jobs/:executionId/cancel', JobMonitoringController.cancelJob);

/**
 * @swagger
 * /monitoring/jobs/{executionId}:
 *   get:
 *     summary: Obtém detalhes de uma execução
 *     description: Retorna detalhes completos de uma execução específica
 *     tags: [Job Monitoring]
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da execução do job
 *     responses:
 *       200:
 *         description: Detalhes da execução
 *       404:
 *         description: Execução não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/jobs/:executionId', JobMonitoringController.getExecutionDetails);

/**
 * @swagger
 * /monitoring/jobs/performance:
 *   get:
 *     summary: Obtém métricas de performance
 *     description: Retorna métricas de performance dos jobs incluindo percentis de tempo de resposta
 *     tags: [Job Monitoring]
 *     parameters:
 *       - in: query
 *         name: jobName
 *         schema:
 *           type: string
 *         description: Nome do job para filtrar (opcional)
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Número de dias para análise
 *     responses:
 *       200:
 *         description: Métricas de performance
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
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         averageResponseTime:
 *                           type: number
 *                         p95ResponseTime:
 *                           type: number
 *                         p99ResponseTime:
 *                           type: number
 *                         errorRate:
 *                           type: number
 *                         throughput:
 *                           type: number
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/jobs/performance', JobMonitoringController.getPerformanceMetrics);

/**
 * @swagger
 * /monitoring/status:
 *   get:
 *     summary: Obtém status do monitoramento
 *     description: Retorna status do serviço de monitoramento de jobs
 *     tags: [Job Monitoring]
 *     responses:
 *       200:
 *         description: Status do monitoramento
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
 *                     isMonitoring:
 *                       type: boolean
 *                     uptime:
 *                       type: number
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/status', JobMonitoringController.getMonitoringStatus);

/**
 * @swagger
 * /monitoring/start:
 *   post:
 *     summary: Inicia monitoramento automático
 *     description: Inicia o monitoramento automático de jobs travados
 *     tags: [Job Monitoring]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               intervalMinutes:
 *                 type: integer
 *                 default: 5
 *                 description: Intervalo em minutos para verificação
 *     responses:
 *       200:
 *         description: Monitoramento iniciado com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/start', JobMonitoringController.startMonitoring);

/**
 * @swagger
 * /monitoring/stop:
 *   post:
 *     summary: Para monitoramento automático
 *     description: Para o monitoramento automático de jobs travados
 *     tags: [Job Monitoring]
 *     responses:
 *       200:
 *         description: Monitoramento parado com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/stop', JobMonitoringController.stopMonitoring);

/**
 * @swagger
 * /monitoring/cleanup:
 *   post:
 *     summary: Limpa execuções antigas
 *     description: Remove execuções antigas do banco de dados
 *     tags: [Job Monitoring]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daysToKeep:
 *                 type: integer
 *                 default: 30
 *                 description: Número de dias para manter as execuções
 *     responses:
 *       200:
 *         description: Limpeza realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: number
 *                     daysToKeep:
 *                       type: number
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/cleanup', JobMonitoringController.cleanupOldExecutions);

export default router;
