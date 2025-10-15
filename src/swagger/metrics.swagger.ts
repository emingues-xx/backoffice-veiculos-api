/**
 * @swagger
 * tags:
 *   name: Metrics
 *   description: API de métricas de vendas e analytics
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MetricsQuery:
 *       type: object
 *       required:
 *         - startDate
 *         - endDate
 *       properties:
 *         startDate:
 *           type: string
 *           format: date
 *           description: Data inicial do período
 *           example: "2024-01-01"
 *         endDate:
 *           type: string
 *           format: date
 *           description: Data final do período
 *           example: "2024-01-31"
 *         sellerId:
 *           type: string
 *           description: ID do vendedor (opcional)
 *           example: "60d5f484f8d2e63a4c8b4567"
 *
 *     TotalSalesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             totalSales:
 *               type: number
 *               description: Total de vendas no período
 *               example: 150
 *             totalRevenue:
 *               type: number
 *               description: Receita total
 *               example: 7500000
 *             period:
 *               type: object
 *               properties:
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *             growth:
 *               type: number
 *               description: Crescimento em relação ao período anterior (%)
 *               example: 15.5
 *         message:
 *           type: string
 *           example: "Total sales retrieved successfully"
 *
 *     DailySalesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             dailyMetrics:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-15"
 *                   totalSales:
 *                     type: number
 *                     example: 10
 *                   totalRevenue:
 *                     type: number
 *                     example: 500000
 *                   averageTicket:
 *                     type: number
 *                     example: 50000
 *             count:
 *               type: number
 *               example: 31
 *         message:
 *           type: string
 *           example: "Daily sales retrieved successfully"
 *
 *     AverageTicketResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             averageTicket:
 *               type: number
 *               description: Ticket médio (receita média por venda)
 *               example: 50000
 *             totalSales:
 *               type: number
 *               example: 150
 *             totalRevenue:
 *               type: number
 *               example: 7500000
 *             period:
 *               type: object
 *               properties:
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *         message:
 *           type: string
 *           example: "Average ticket retrieved successfully"
 *
 *     ConversionRateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             conversionRate:
 *               type: number
 *               description: Taxa de conversão (%)
 *               example: 75.5
 *             totalSales:
 *               type: number
 *               example: 150
 *             period:
 *               type: object
 *               properties:
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *         message:
 *           type: string
 *           example: "Conversion rate retrieved successfully"
 *
 *     AverageTimeResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             averageTime:
 *               type: number
 *               description: Tempo médio de venda em horas
 *               example: 48.5
 *             averageTimeFormatted:
 *               type: string
 *               description: Tempo médio formatado
 *               example: "2d 0h"
 *             period:
 *               type: object
 *               properties:
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *         message:
 *           type: string
 *           example: "Average sale time retrieved successfully"
 *
 *     MetricsSummaryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             totalSales:
 *               type: number
 *               description: Total de vendas
 *               example: 150
 *             totalRevenue:
 *               type: number
 *               description: Receita total
 *               example: 7500000
 *             totalCommission:
 *               type: number
 *               description: Comissão total
 *               example: 375000
 *             averageTicket:
 *               type: number
 *               description: Ticket médio
 *               example: 50000
 *             conversionRate:
 *               type: number
 *               description: Taxa de conversão (%)
 *               example: 75.5
 *             averageTime:
 *               type: number
 *               description: Tempo médio de venda em horas
 *               example: 48.5
 *             periodComparison:
 *               type: object
 *               properties:
 *                 salesGrowth:
 *                   type: number
 *                   description: Crescimento de vendas (%)
 *                   example: 15.5
 *                 revenueGrowth:
 *                   type: number
 *                   description: Crescimento de receita (%)
 *                   example: 18.2
 *                 previousPeriod:
 *                   type: object
 *                   properties:
 *                     totalSales:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 *                     totalCommission:
 *                       type: number
 *             period:
 *               type: object
 *               properties:
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *         message:
 *           type: string
 *           example: "Metrics summary retrieved successfully"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Missing required parameters"
 *         message:
 *           type: string
 *           example: "startDate and endDate are required"
 */

/**
 * @swagger
 * /api/metrics/total-sales:
 *   get:
 *     summary: Retorna total de vendas no período
 *     description: Busca o total de vendas e receita para um período específico. Pode filtrar por vendedor. Resultado é cacheado por 5 minutos.
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
 *         description: Data inicial do período (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período (YYYY-MM-DD)
 *         example: "2024-01-31"
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *         description: ID do vendedor (opcional)
 *         example: "60d5f484f8d2e63a4c8b4567"
 *     responses:
 *       200:
 *         description: Total de vendas retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalSalesResponse'
 *             examples:
 *               success:
 *                 summary: Resposta de sucesso
 *                 value:
 *                   success: true
 *                   data:
 *                     totalSales: 150
 *                     totalRevenue: 7500000
 *                     period:
 *                       startDate: "2024-01-01T00:00:00.000Z"
 *                       endDate: "2024-01-31T23:59:59.999Z"
 *                     growth: 15.5
 *                   message: "Total sales retrieved successfully"
 *       400:
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/metrics/daily-sales:
 *   get:
 *     summary: Retorna vendas diárias no período
 *     description: Busca métricas diárias de vendas para análise de performance ao longo do tempo. Cacheado por 5 minutos.
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
 *         description: Data inicial do período
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período
 *         example: "2024-01-31"
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *         description: ID do vendedor (opcional)
 *     responses:
 *       200:
 *         description: Vendas diárias retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DailySalesResponse'
 *             examples:
 *               success:
 *                 summary: Resposta com múltiplos dias
 *                 value:
 *                   success: true
 *                   data:
 *                     dailyMetrics:
 *                       - date: "2024-01-01"
 *                         totalSales: 8
 *                         totalRevenue: 400000
 *                         averageTicket: 50000
 *                       - date: "2024-01-02"
 *                         totalSales: 12
 *                         totalRevenue: 600000
 *                         averageTicket: 50000
 *                     count: 2
 *                   message: "Daily sales retrieved successfully"
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/metrics/average-ticket:
 *   get:
 *     summary: Retorna ticket médio no período
 *     description: Calcula o ticket médio (receita média por venda) para o período especificado. Útil para análise de pricing.
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
 *         description: Data inicial
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final
 *         example: "2024-01-31"
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *         description: Filtrar por vendedor
 *     responses:
 *       200:
 *         description: Ticket médio calculado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AverageTicketResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     averageTicket: 50000
 *                     totalSales: 150
 *                     totalRevenue: 7500000
 *                     period:
 *                       startDate: "2024-01-01T00:00:00.000Z"
 *                       endDate: "2024-01-31T23:59:59.999Z"
 *                   message: "Average ticket retrieved successfully"
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/metrics/conversion-rate:
 *   get:
 *     summary: Retorna taxa de conversão no período
 *     description: Calcula a taxa de conversão (vendas completadas / total de tentativas) para análise de eficiência do funil de vendas.
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
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-31"
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *         description: Filtrar por vendedor
 *     responses:
 *       200:
 *         description: Taxa de conversão calculada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversionRateResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     conversionRate: 75.5
 *                     totalSales: 150
 *                     period:
 *                       startDate: "2024-01-01T00:00:00.000Z"
 *                       endDate: "2024-01-31T23:59:59.999Z"
 *                   message: "Conversion rate retrieved successfully"
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/metrics/average-time:
 *   get:
 *     summary: Retorna tempo médio de venda no período
 *     description: Calcula o tempo médio entre criação e conclusão da venda. Útil para análise de eficiência do processo.
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
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-31"
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *         description: Filtrar por vendedor
 *     responses:
 *       200:
 *         description: Tempo médio calculado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AverageTimeResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     averageTime: 48.5
 *                     averageTimeFormatted: "2d 0h"
 *                     period:
 *                       startDate: "2024-01-01T00:00:00.000Z"
 *                       endDate: "2024-01-31T23:59:59.999Z"
 *                   message: "Average sale time retrieved successfully"
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/metrics/summary:
 *   get:
 *     summary: Retorna resumo completo de todas as métricas
 *     description: |
 *       Endpoint consolidado que retorna todas as métricas principais em uma única chamada:
 *       - Total de vendas e receita
 *       - Ticket médio
 *       - Taxa de conversão
 *       - Tempo médio de venda
 *       - Comparação com período anterior
 *
 *       Performance garantida < 1s. Resultado cacheado por 5 minutos.
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
 *         description: Data inicial do período
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período
 *         example: "2024-01-31"
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *         description: ID do vendedor para filtrar resultados (opcional)
 *         example: "60d5f484f8d2e63a4c8b4567"
 *     responses:
 *       200:
 *         description: Resumo completo de métricas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetricsSummaryResponse'
 *             examples:
 *               success:
 *                 summary: Resposta completa com todas as métricas
 *                 value:
 *                   success: true
 *                   data:
 *                     totalSales: 150
 *                     totalRevenue: 7500000
 *                     totalCommission: 375000
 *                     averageTicket: 50000
 *                     conversionRate: 75.5
 *                     averageTime: 48.5
 *                     periodComparison:
 *                       salesGrowth: 15.5
 *                       revenueGrowth: 18.2
 *                       previousPeriod:
 *                         totalSales: 130
 *                         totalRevenue: 6350000
 *                         totalCommission: 317500
 *                     period:
 *                       startDate: "2024-01-01T00:00:00.000Z"
 *                       endDate: "2024-01-31T23:59:59.999Z"
 *                   message: "Metrics summary retrieved successfully"
 *       400:
 *         description: Parâmetros inválidos ou ausentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingParams:
 *                 summary: Parâmetros ausentes
 *                 value:
 *                   success: false
 *                   error: "Missing required parameters"
 *                   message: "startDate and endDate are required"
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 value:
 *                   success: false
 *                   error: "Unauthorized"
 *                   message: "Authentication token required"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: |
 *         Token JWT obtido através do endpoint /api/users/login
 *
 *         Exemplo de uso:
 *         ```
 *         Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         ```
 */

export {};
