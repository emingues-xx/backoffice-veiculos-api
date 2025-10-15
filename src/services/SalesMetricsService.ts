import SalesRepository, { SalesFilter } from '@/repositories/SalesRepository';
import SalesMetricsModel, { SalesMetricsDocument } from '@/models/SalesMetrics';
import { MetricsQuery, SalesMetrics, MetricsAggregation } from '@/types/metrics.types';
import { calculateAverageTicket, calculateConversionRate, calculateGrowthRate } from '@/utils/metricsCalculator';

export class SalesMetricsService {
  private repository = SalesRepository;

  /**
   * Calcula e retorna métricas agregadas para um período
   */
  async getMetrics(query: MetricsQuery): Promise<MetricsAggregation> {
    const filters: SalesFilter = {
      startDate: query.startDate,
      endDate: query.endDate,
      sellerId: query.sellerId,
      status: 'completed' // Apenas vendas completadas
    };

    // Busca dados agregados
    const aggregated = await this.repository.aggregateMetrics(filters);

    // Calcula tempo médio
    const averageTime = await this.repository.calculateAverageSaleTime(filters);

    // Calcula métricas derivadas
    const averageTicket = calculateAverageTicket(
      aggregated.totalRevenue,
      aggregated.totalSales
    );

    // Para taxa de conversão, precisamos do total de tentativas (incluindo pending/cancelled)
    const allSalesCount = await this.repository.countByFilters({
      ...filters,
      status: undefined // Remove filtro de status
    });

    const conversionRate = calculateConversionRate(
      aggregated.totalSales,
      allSalesCount
    );

    // Busca período anterior para comparação
    const previousPeriod = await this.repository.findPreviousPeriodMetrics(filters);

    const salesGrowth = calculateGrowthRate(
      previousPeriod.totalSales,
      aggregated.totalSales
    );

    const revenueGrowth = calculateGrowthRate(
      previousPeriod.totalRevenue,
      aggregated.totalRevenue
    );

    return {
      totalSales: aggregated.totalSales,
      totalRevenue: aggregated.totalRevenue,
      totalCommission: aggregated.totalCommission,
      averageTicket,
      conversionRate,
      averageTime,
      periodComparison: {
        salesGrowth,
        revenueGrowth,
        previousPeriod
      }
    };
  }

  /**
   * Calcula e persiste métricas consolidadas
   */
  async calculateAndSaveMetrics(query: MetricsQuery): Promise<SalesMetrics> {
    const filters: SalesFilter = {
      startDate: query.startDate,
      endDate: query.endDate,
      sellerId: query.sellerId,
      status: 'completed'
    };

    // Busca dados agregados
    const aggregated = await this.repository.aggregateMetrics(filters);

    // Calcula tempo médio
    const averageTime = await this.repository.calculateAverageSaleTime(filters);

    // Calcula métricas derivadas
    const averageTicket = calculateAverageTicket(
      aggregated.totalRevenue,
      aggregated.totalSales
    );

    const allSalesCount = await this.repository.countByFilters({
      ...filters,
      status: undefined
    });

    const conversionRate = calculateConversionRate(
      aggregated.totalSales,
      allSalesCount
    );

    // Transforma dados agregados
    const salesByDay = aggregated.salesByDay.map(item => ({
      date: new Date(item._id),
      count: item.count,
      revenue: item.revenue
    }));

    const salesByPaymentMethod = aggregated.salesByPaymentMethod.map(item => ({
      method: item._id as 'cash' | 'financing' | 'trade-in',
      count: item.count,
      revenue: item.revenue
    }));

    const topSellers = aggregated.topSellers.map(item => ({
      sellerId: item._id,
      sellerName: item.name,
      salesCount: item.salesCount,
      revenue: item.revenue,
      commission: item.commission
    }));

    // Cria ou atualiza documento de métricas
    const metricsData: Partial<SalesMetricsDocument> = {
      period: query.period || 'daily',
      startDate: query.startDate,
      endDate: query.endDate,
      totalSales: aggregated.totalSales,
      totalRevenue: aggregated.totalRevenue,
      totalCommission: aggregated.totalCommission,
      averageTicket,
      conversionRate,
      averageTime,
      salesByDay,
      salesByPaymentMethod,
      topSellers
    };

    // Usa upsert para evitar duplicações
    const metrics = await SalesMetricsModel.findOneAndUpdate(
      {
        period: metricsData.period,
        startDate: metricsData.startDate,
        endDate: metricsData.endDate
      },
      { $set: metricsData },
      { upsert: true, new: true, runValidators: true }
    ).lean().exec();

    return metrics as unknown as SalesMetrics;
  }

  /**
   * Busca métricas salvas por período
   */
  async getSavedMetrics(query: MetricsQuery): Promise<SalesMetrics | null> {
    const filter: any = {
      startDate: query.startDate,
      endDate: query.endDate
    };

    if (query.period) {
      filter.period = query.period;
    }

    return SalesMetricsModel.findOne(filter) as unknown as Promise<SalesMetrics | null>
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * Lista todas as métricas salvas com paginação
   */
  async listSavedMetrics(
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly',
    page: number = 1,
    limit: number = 10
  ): Promise<{ metrics: SalesMetrics[]; total: number; page: number; totalPages: number }> {
    const filter: any = {};
    if (period) {
      filter.period = period;
    }

    const skip = (page - 1) * limit;

    const [metrics, total] = await Promise.all([
      SalesMetricsModel.find(filter)
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      SalesMetricsModel.countDocuments(filter).exec()
    ]);

    return {
      metrics: metrics as unknown as SalesMetrics[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Calcula métricas diárias para um intervalo
   */
  async getDailyMetrics(startDate: Date, endDate: Date, sellerId?: string): Promise<SalesMetrics[]> {
    const metrics: SalesMetrics[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayMetrics = await this.calculateAndSaveMetrics({
        period: 'daily',
        startDate: dayStart,
        endDate: dayEnd,
        sellerId
      });

      metrics.push(dayMetrics);

      // Avança para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return metrics;
  }

  /**
   * Calcula métricas semanais
   */
  async getWeeklyMetrics(startDate: Date, endDate: Date, sellerId?: string): Promise<SalesMetrics> {
    return this.calculateAndSaveMetrics({
      period: 'weekly',
      startDate,
      endDate,
      sellerId
    });
  }

  /**
   * Calcula métricas mensais
   */
  async getMonthlyMetrics(year: number, month: number, sellerId?: string): Promise<SalesMetrics> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return this.calculateAndSaveMetrics({
      period: 'monthly',
      startDate,
      endDate,
      sellerId
    });
  }

  /**
   * Calcula métricas anuais
   */
  async getYearlyMetrics(year: number, sellerId?: string): Promise<SalesMetrics> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    return this.calculateAndSaveMetrics({
      period: 'yearly',
      startDate,
      endDate,
      sellerId
    });
  }

  /**
   * Remove métricas antigas (para manutenção)
   */
  async cleanupOldMetrics(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await SalesMetricsModel.deleteMany({
      createdAt: { $lt: cutoffDate }
    }).exec();

    return result.deletedCount || 0;
  }

  /**
   * Compara métricas entre dois períodos
   */
  async compareMetrics(
    period1: { startDate: Date; endDate: Date },
    period2: { startDate: Date; endDate: Date },
    sellerId?: string
  ): Promise<{
    period1: MetricsAggregation;
    period2: MetricsAggregation;
    comparison: {
      salesDifference: number;
      revenueDifference: number;
      salesGrowth: number;
      revenueGrowth: number;
    };
  }> {
    const [metrics1, metrics2] = await Promise.all([
      this.getMetrics({ ...period1, sellerId }),
      this.getMetrics({ ...period2, sellerId })
    ]);

    const salesDifference = metrics2.totalSales - metrics1.totalSales;
    const revenueDifference = metrics2.totalRevenue - metrics1.totalRevenue;
    const salesGrowth = calculateGrowthRate(metrics1.totalSales, metrics2.totalSales);
    const revenueGrowth = calculateGrowthRate(metrics1.totalRevenue, metrics2.totalRevenue);

    return {
      period1: metrics1,
      period2: metrics2,
      comparison: {
        salesDifference,
        revenueDifference,
        salesGrowth,
        revenueGrowth
      }
    };
  }
}

export default new SalesMetricsService();
