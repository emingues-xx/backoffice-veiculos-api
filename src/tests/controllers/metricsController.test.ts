import { Request, Response, NextFunction } from 'express';
import metricsController from '@/controllers/metricsController';
import SalesMetricsService from '@/services/SalesMetricsService';
import { AuthRequest } from '@/middleware/auth';

// Mock do serviço
jest.mock('@/services/SalesMetricsService');

describe('MetricsController', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {},
      user: {
        userId: 'user123',
        email: 'test@test.com',
        role: 'admin'
      }
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getTotalSales', () => {
    it('deve retornar total de vendas com sucesso', async () => {
      const mockMetrics = {
        totalSales: 100,
        totalRevenue: 500000,
        totalCommission: 25000,
        averageTicket: 5000,
        conversionRate: 75,
        averageTime: 48,
        periodComparison: {
          salesGrowth: 15.5,
          revenueGrowth: 20.3,
          previousPeriod: { totalSales: 85, totalRevenue: 400000, totalCommission: 20000 }
        }
      };

      (SalesMetricsService.getMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await metricsController.getTotalSales(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          totalSales: 100,
          totalRevenue: 500000,
          growth: 15.5
        }),
        message: 'Total sales retrieved successfully'
      });
    });

    it('deve retornar erro 400 quando faltam parâmetros obrigatórios', async () => {
      mockRequest.query = { startDate: '2024-01-01' };

      await metricsController.getTotalSales(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required parameters',
        message: 'startDate and endDate are required'
      });
    });

    it('deve responder em menos de 1 segundo', async () => {
      const mockMetrics = {
        totalSales: 100,
        totalRevenue: 500000,
        totalCommission: 25000,
        averageTicket: 5000,
        conversionRate: 75,
        averageTime: 48,
        periodComparison: {
          salesGrowth: 15.5,
          revenueGrowth: 20.3,
          previousPeriod: { totalSales: 85, totalRevenue: 400000, totalCommission: 20000 }
        }
      };

      (SalesMetricsService.getMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      const startTime = Date.now();
      await metricsController.getTotalSales(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('deve chamar next com erro quando serviço falhar', async () => {
      const error = new Error('Database error');
      (SalesMetricsService.getMetrics as jest.Mock).mockRejectedValue(error);

      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await metricsController.getTotalSales(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getDailySales', () => {
    it('deve retornar vendas diárias com sucesso', async () => {
      const mockDailyMetrics = [
        {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-01'),
          totalSales: 10,
          totalRevenue: 50000,
          averageTicket: 5000,
          period: 'daily' as const
        },
        {
          startDate: new Date('2024-01-02'),
          endDate: new Date('2024-01-02'),
          totalSales: 15,
          totalRevenue: 75000,
          averageTicket: 5000,
          period: 'daily' as const
        }
      ];

      (SalesMetricsService.getDailyMetrics as jest.Mock).mockResolvedValue(mockDailyMetrics);

      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-02'
      };

      await metricsController.getDailySales(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          dailyMetrics: expect.arrayContaining([
            expect.objectContaining({ totalSales: 10 }),
            expect.objectContaining({ totalSales: 15 })
          ]),
          count: 2
        },
        message: 'Daily sales retrieved successfully'
      });
    });

    it('deve retornar erro 400 quando faltam parâmetros', async () => {
      mockRequest.query = {};

      await metricsController.getDailySales(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getAverageTicket', () => {
    it('deve retornar ticket médio com sucesso', async () => {
      const mockMetrics = {
        totalSales: 100,
        totalRevenue: 500000,
        totalCommission: 25000,
        averageTicket: 5000,
        conversionRate: 75,
        averageTime: 48,
        periodComparison: {
          salesGrowth: 15.5,
          revenueGrowth: 20.3,
          previousPeriod: { totalSales: 85, totalRevenue: 400000, totalCommission: 20000 }
        }
      };

      (SalesMetricsService.getMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await metricsController.getAverageTicket(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          averageTicket: 5000,
          totalSales: 100,
          totalRevenue: 500000
        }),
        message: 'Average ticket retrieved successfully'
      });
    });

    it('deve calcular ticket médio corretamente', async () => {
      const mockMetrics = {
        totalSales: 50,
        totalRevenue: 1000000,
        totalCommission: 50000,
        averageTicket: 20000,
        conversionRate: 80,
        averageTime: 36,
        periodComparison: {
          salesGrowth: 10,
          revenueGrowth: 12,
          previousPeriod: { totalSales: 45, totalRevenue: 900000, totalCommission: 45000 }
        }
      };

      (SalesMetricsService.getMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await metricsController.getAverageTicket(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            averageTicket: 20000
          })
        })
      );
    });
  });

  describe('getConversionRate', () => {
    it('deve retornar taxa de conversão com sucesso', async () => {
      const mockMetrics = {
        totalSales: 75,
        totalRevenue: 375000,
        totalCommission: 18750,
        averageTicket: 5000,
        conversionRate: 75,
        averageTime: 48,
        periodComparison: {
          salesGrowth: 5,
          revenueGrowth: 8,
          previousPeriod: { totalSales: 71, totalRevenue: 350000, totalCommission: 17500 }
        }
      };

      (SalesMetricsService.getMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await metricsController.getConversionRate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          conversionRate: 75,
          totalSales: 75
        }),
        message: 'Conversion rate retrieved successfully'
      });
    });
  });

  describe('getAverageTime', () => {
    it('deve retornar tempo médio de venda formatado', async () => {
      const mockMetrics = {
        totalSales: 100,
        totalRevenue: 500000,
        totalCommission: 25000,
        averageTicket: 5000,
        conversionRate: 75,
        averageTime: 48,
        periodComparison: {
          salesGrowth: 15.5,
          revenueGrowth: 20.3,
          previousPeriod: { totalSales: 85, totalRevenue: 400000, totalCommission: 20000 }
        }
      };

      (SalesMetricsService.getMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await metricsController.getAverageTime(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          averageTime: 48,
          averageTimeFormatted: '2d 0h'
        }),
        message: 'Average sale time retrieved successfully'
      });
    });
  });

  describe('getMetricsSummary', () => {
    it('deve retornar resumo completo de métricas', async () => {
      const mockMetrics = {
        totalSales: 100,
        totalRevenue: 500000,
        totalCommission: 25000,
        averageTicket: 5000,
        conversionRate: 75,
        averageTime: 48,
        periodComparison: {
          salesGrowth: 15.5,
          revenueGrowth: 20.3,
          previousPeriod: { totalSales: 85, totalRevenue: 400000, totalCommission: 20000 }
        }
      };

      (SalesMetricsService.getMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await metricsController.getMetricsSummary(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          totalSales: 100,
          totalRevenue: 500000,
          averageTicket: 5000,
          conversionRate: 75,
          averageTime: 48,
          period: expect.any(Object)
        }),
        message: 'Metrics summary retrieved successfully'
      });
    });

    it('deve incluir filtro por vendedor quando fornecido', async () => {
      const mockMetrics = {
        totalSales: 50,
        totalRevenue: 250000,
        totalCommission: 12500,
        averageTicket: 5000,
        conversionRate: 70,
        averageTime: 36,
        periodComparison: {
          salesGrowth: 10,
          revenueGrowth: 12,
          previousPeriod: { totalSales: 45, totalRevenue: 225000, totalCommission: 11250 }
        }
      };

      (SalesMetricsService.getMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        sellerId: 'seller123'
      };

      await metricsController.getMetricsSummary(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(SalesMetricsService.getMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          sellerId: 'seller123'
        })
      );
    });
  });

  describe('Performance Tests', () => {
    it('deve processar múltiplas requisições em menos de 1s cada', async () => {
      const mockMetrics = {
        totalSales: 100,
        totalRevenue: 500000,
        totalCommission: 25000,
        averageTicket: 5000,
        conversionRate: 75,
        averageTime: 48,
        periodComparison: {
          salesGrowth: 15.5,
          revenueGrowth: 20.3,
          previousPeriod: { totalSales: 85, totalRevenue: 400000, totalCommission: 20000 }
        }
      };

      (SalesMetricsService.getMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      const iterations = 5;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await metricsController.getTotalSales(
          mockRequest as AuthRequest,
          mockResponse as Response,
          mockNext
        );
        const end = Date.now();
        times.push(end - start);
      }

      times.forEach(time => {
        expect(time).toBeLessThan(1000);
      });
    });
  });

  describe('Error Handling', () => {
    it('deve tratar erro de data inválida', async () => {
      mockRequest.query = {
        startDate: 'invalid-date',
        endDate: '2024-01-31'
      };

      const error = new Error('Invalid date');
      (SalesMetricsService.getMetrics as jest.Mock).mockRejectedValue(error);

      await metricsController.getTotalSales(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('deve tratar erro de conexão com banco', async () => {
      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      const error = new Error('Database connection failed');
      (SalesMetricsService.getMetrics as jest.Mock).mockRejectedValue(error);

      await metricsController.getTotalSales(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
