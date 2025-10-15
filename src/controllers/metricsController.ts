import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/auth';
import { ApiResponse } from '@/types/api.types';
import SalesMetricsService from '@/services/SalesMetricsService';
import { MetricsQuery } from '@/types/metrics.types';

/**
 * Controller para endpoints de métricas de vendas
 */
class MetricsController {
  private salesMetricsService: any;

  constructor() {
    this.salesMetricsService = SalesMetricsService;
  }
  /**
   * GET /api/metrics/total-sales
   * Retorna total de vendas no período
   */
  async getTotalSales(req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, sellerId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters',
          message: 'startDate and endDate are required'
        });
        return;
      }

      const query: MetricsQuery = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        sellerId: sellerId as string | undefined
      };

      const metrics = await SalesMetricsService.getMetrics(query);

      res.json({
        success: true,
        data: {
          totalSales: metrics.totalSales,
          totalRevenue: metrics.totalRevenue,
          period: {
            startDate: query.startDate,
            endDate: query.endDate
          },
          growth: metrics.periodComparison?.salesGrowth || 0
        },
        message: 'Total sales retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/metrics/daily-sales
   * Retorna vendas diárias no período
   */
  async getDailySales(req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, sellerId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters',
          message: 'startDate and endDate are required'
        });
        return;
      }

      const dailyMetrics = await SalesMetricsService.getDailyMetrics(
        new Date(startDate as string),
        new Date(endDate as string),
        sellerId as string | undefined
      );

      res.json({
        success: true,
        data: {
          dailyMetrics: dailyMetrics.map(m => ({
            date: m.startDate,
            totalSales: m.totalSales,
            totalRevenue: m.totalRevenue,
            averageTicket: m.averageTicket
          })),
          count: dailyMetrics.length
        },
        message: 'Daily sales retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/metrics/average-ticket
   * Retorna ticket médio no período
   */
  async getAverageTicket(req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, sellerId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters',
          message: 'startDate and endDate are required'
        });
        return;
      }

      const query: MetricsQuery = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        sellerId: sellerId as string | undefined
      };

      const metrics = await SalesMetricsService.getMetrics(query);

      res.json({
        success: true,
        data: {
          averageTicket: metrics.averageTicket,
          totalSales: metrics.totalSales,
          totalRevenue: metrics.totalRevenue,
          period: {
            startDate: query.startDate,
            endDate: query.endDate
          }
        },
        message: 'Average ticket retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/metrics/conversion-rate
   * Retorna taxa de conversão no período
   */
  async getConversionRate(req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, sellerId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters',
          message: 'startDate and endDate are required'
        });
        return;
      }

      const query: MetricsQuery = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        sellerId: sellerId as string | undefined
      };

      const metrics = await SalesMetricsService.getMetrics(query);

      res.json({
        success: true,
        data: {
          conversionRate: metrics.conversionRate,
          totalSales: metrics.totalSales,
          period: {
            startDate: query.startDate,
            endDate: query.endDate
          }
        },
        message: 'Conversion rate retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/metrics/average-time
   * Retorna tempo médio de venda no período
   */
  async getAverageTime(req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, sellerId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters',
          message: 'startDate and endDate are required'
        });
        return;
      }

      const query: MetricsQuery = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        sellerId: sellerId as string | undefined
      };

      const metrics = await SalesMetricsService.getMetrics(query);

      res.json({
        success: true,
        data: {
          averageTime: metrics.averageTime,
          averageTimeFormatted: `${Math.floor(metrics.averageTime / 24)}d ${metrics.averageTime % 24}h`,
          period: {
            startDate: query.startDate,
            endDate: query.endDate
          }
        },
        message: 'Average sale time retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/metrics/summary
   * Retorna resumo completo de todas as métricas
   */
  async getMetricsSummary(req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, sellerId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters',
          message: 'startDate and endDate are required'
        });
        return;
      }

      const query: MetricsQuery = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        sellerId: sellerId as string | undefined
      };

      const metrics = await SalesMetricsService.getMetrics(query);

      res.json({
        success: true,
        data: {
          ...metrics,
          period: {
            startDate: query.startDate,
            endDate: query.endDate
          }
        },
        message: 'Metrics summary retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna receita total no período
   */
  async getTotalRevenue(req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = req.query as any;
      const metrics = await this.salesMetricsService.getTotalRevenue(query);
      
      res.json({
        success: true,
        data: {
          totalRevenue: metrics.totalRevenue,
          period: {
            startDate: query.startDate,
            endDate: query.endDate
          }
        },
        message: 'Total revenue retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna vendas por dia no período
   */
  async getSalesByDay(req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = req.query as any;
      const metrics = await this.salesMetricsService.getSalesByDay(query);
      
      res.json({
        success: true,
        data: {
          salesByDay: metrics.salesByDay,
          period: {
            startDate: query.startDate,
            endDate: query.endDate
          }
        },
        message: 'Sales by day retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna top vendedores no período
   */
  async getTopSellers(req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = req.query as any;
      const metrics = await this.salesMetricsService.getTopSellers(query);
      
      res.json({
        success: true,
        data: {
          topSellers: metrics.topSellers,
          period: {
            startDate: query.startDate,
            endDate: query.endDate
          }
        },
        message: 'Top sellers retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MetricsController();
