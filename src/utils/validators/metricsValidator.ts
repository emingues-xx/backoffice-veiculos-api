import Joi from 'joi';

// Schema para query de métricas
export const metricsQuerySchema = Joi.object({
  period: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  sellerId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
}).custom((value, helpers) => {
  // Se startDate e endDate não foram fornecidos, usar valores padrão (últimos 30 dias)
  if (!value.startDate && !value.endDate) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    return {
      ...value,
      startDate,
      endDate
    };
  }
  
  // Se apenas um dos dois foi fornecido, retornar erro
  if ((value.startDate && !value.endDate) || (!value.startDate && value.endDate)) {
    return helpers.error('any.invalid', { message: 'startDate e endDate devem ser fornecidos juntos' });
  }
  
  // Se ambos foram fornecidos, validar que endDate > startDate
  if (value.startDate && value.endDate && value.endDate <= value.startDate) {
    return helpers.error('any.invalid', { message: 'endDate deve ser maior que startDate' });
  }
  
  return value;
});

// Schema para criação de métricas consolidadas
export const createMetricsSchema = Joi.object({
  period: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required().greater(Joi.ref('startDate')),
  totalSales: Joi.number().integer().min(0).default(0),
  totalRevenue: Joi.number().min(0).default(0),
  totalCommission: Joi.number().min(0).default(0),
  averageTicket: Joi.number().min(0).default(0),
  conversionRate: Joi.number().min(0).max(100).default(0),
  averageTime: Joi.number().min(0).default(0),
  salesByDay: Joi.array().items(
    Joi.object({
      date: Joi.date().required(),
      count: Joi.number().integer().min(0).required(),
      revenue: Joi.number().min(0).required()
    })
  ).default([]),
  salesByPaymentMethod: Joi.array().items(
    Joi.object({
      method: Joi.string().valid('cash', 'financing', 'trade-in').required(),
      count: Joi.number().integer().min(0).required(),
      revenue: Joi.number().min(0).required()
    })
  ).default([]),
  topSellers: Joi.array().items(
    Joi.object({
      sellerId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
      sellerName: Joi.string().required(),
      salesCount: Joi.number().integer().min(0).required(),
      revenue: Joi.number().min(0).required(),
      commission: Joi.number().min(0).required()
    })
  ).max(10).default([])
});

// Schema para atualização de métricas
export const updateMetricsSchema = Joi.object({
  totalSales: Joi.number().integer().min(0).optional(),
  totalRevenue: Joi.number().min(0).optional(),
  totalCommission: Joi.number().min(0).optional(),
  averageTicket: Joi.number().min(0).optional(),
  conversionRate: Joi.number().min(0).max(100).optional(),
  averageTime: Joi.number().min(0).optional(),
  salesByDay: Joi.array().items(
    Joi.object({
      date: Joi.date().required(),
      count: Joi.number().integer().min(0).required(),
      revenue: Joi.number().min(0).required()
    })
  ).optional(),
  salesByPaymentMethod: Joi.array().items(
    Joi.object({
      method: Joi.string().valid('cash', 'financing', 'trade-in').required(),
      count: Joi.number().integer().min(0).required(),
      revenue: Joi.number().min(0).required()
    })
  ).optional(),
  topSellers: Joi.array().items(
    Joi.object({
      sellerId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
      sellerName: Joi.string().required(),
      salesCount: Joi.number().integer().min(0).required(),
      revenue: Joi.number().min(0).required(),
      commission: Joi.number().min(0).required()
    })
  ).max(10).optional()
});

// Schema para filtros de métricas
export const metricsFiltersSchema = Joi.object({
  period: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('startDate', 'totalSales', 'totalRevenue', 'createdAt').default('startDate'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Schema para métricas diárias
export const dailyMetricsSchema = Joi.object({
  date: Joi.date().required(),
  totalSales: Joi.number().integer().min(0).required(),
  totalRevenue: Joi.number().min(0).required(),
  averageTicket: Joi.number().min(0).required(),
  conversionRate: Joi.number().min(0).max(100).required()
});

// Schema para métricas de vendedor
export const sellerMetricsSchema = Joi.object({
  sellerId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required().greater(Joi.ref('startDate'))
});

// Schema para agregação de métricas com comparação
export const metricsAggregationSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required().greater(Joi.ref('startDate')),
  comparePreviousPeriod: Joi.boolean().default(false),
  sellerId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  groupBy: Joi.string().valid('day', 'week', 'month', 'year').optional()
});

// Validação de período customizado
export const customPeriodSchema = Joi.object({
  startDate: Joi.date().required().max('now'),
  endDate: Joi.date().required().greater(Joi.ref('startDate')).max('now')
}).custom((value, helpers) => {
  const start = new Date(value.startDate);
  const end = new Date(value.endDate);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  // Limitar período máximo a 1 ano
  if (diffDays > 365) {
    return helpers.error('any.invalid', { message: 'Período máximo permitido é de 365 dias' });
  }

  return value;
});
