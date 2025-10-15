import SalesMetricsService from '@/services/SalesMetricsService';
import SalesRepository from '@/repositories/SalesRepository';
import SalesMetricsModel from '@/models/SalesMetrics';
import * as metricsCalculator from '@/utils/metricsCalculator';

// Mock das dependências
jest.mock('@/repositories/SalesRepository');
jest.mock('@/models/SalesMetrics');
jest.mock('@/utils/metricsCalculator');

describe('SalesMetricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMetrics', () => {
    it('deve calcular métricas agregadas corretamente', async () => {
      const mockAggregated = {
        totalSales: 100,
        totalRevenue: 500000,
        totalCommission: 25000,
        salesByDay: [
          { _id: '2024-01-01', count: 50, revenue: 250000 },
          { _id: '2024-01-02', count: 50, revenue: 250000 }
        ],
        salesByPaymentMethod: [
          { _id: 'cash', count: 60, revenue: 300000 },
          { _id: 'financing', count: 40, revenue: 200000 }
        ],
        topSellers: [
          { _id: 'seller1', name: 'John Doe', salesCount: 60, revenue: 300000, commission: 15000 }
        ]
      };

      const mockAverageTime = 48;
      const mockPreviousPeriod = { totalSales: 85, totalRevenue: 425000, totalCommission: 21250 };

      (SalesRepository.aggregateMetrics as jest.Mock).mockResolvedValue(mockAggregated);
      (SalesRepository.calculateAverageSaleTime as jest.Mock).mockResolvedValue(mockAverageTime);
      (SalesRepository.countByFilters as jest.Mock).mockResolvedValue(120);
      (SalesRepository.findPreviousPeriodMetrics as jest.Mock).mockResolvedValue(mockPreviousPeriod);

      (metricsCalculator.calculateAverageTicket as jest.Mock).mockReturnValue(5000);
      (metricsCalculator.calculateConversionRate as jest.Mock).mockReturnValue(83.33);
      (metricsCalculator.calculateGrowthRate as jest.Mock)
        .mockReturnValueOnce(17.65) // salesGrowth
        .mockReturnValueOnce(17.65); // revenueGrowth

      const query = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const result = await SalesMetricsService.getMetrics(query);

      expect(result).toEqual({
        totalSales: 100,
        totalRevenue: 500000,
        totalCommission: 25000,
        averageTicket: 5000,
        conversionRate: 83.33,
        averageTime: 48,
        periodComparison: {
          salesGrowth: 17.65,
          revenueGrowth: 17.65,
          previousPeriod: mockPreviousPeriod
        }
      });

      expect(SalesRepository.aggregateMetrics).toHaveBeenCalledWith({
        startDate: query.startDate,
        endDate: query.endDate,
        sellerId: undefined,
        status: 'completed'
      });
    });

    it('deve responder em menos de 1 segundo', async () => {
      const mockAggregated = {
        totalSales: 100,
        totalRevenue: 500000,
        totalCommission: 25000,
        salesByDay: [],
        salesByPaymentMethod: [],
        topSellers: []
      };

      (SalesRepository.aggregateMetrics as jest.Mock).mockResolvedValue(mockAggregated);
      (SalesRepository.calculateAverageSaleTime as jest.Mock).mockResolvedValue(48);
      (SalesRepository.countByFilters as jest.Mock).mockResolvedValue(120);
      (SalesRepository.findPreviousPeriodMetrics as jest.Mock).mockResolvedValue({ totalSales: 85, totalRevenue: 425000, totalCommission: 21250 });
      (metricsCalculator.calculateAverageTicket as jest.Mock).mockReturnValue(5000);
      (metricsCalculator.calculateConversionRate as jest.Mock).mockReturnValue(83.33);
      (metricsCalculator.calculateGrowthRate as jest.Mock).mockReturnValue(17.65);

      const query = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const startTime = Date.now();
      await SalesMetricsService.getMetrics(query);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('deve filtrar por vendedor específico quando fornecido', async () => {
      const mockAggregated = {
        totalSales: 50,
        totalRevenue: 250000,
        totalCommission: 12500,
        salesByDay: [],
        salesByPaymentMethod: [],
        topSellers: []
      };

      (SalesRepository.aggregateMetrics as jest.Mock).mockResolvedValue(mockAggregated);
      (SalesRepository.calculateAverageSaleTime as jest.Mock).mockResolvedValue(36);
      (SalesRepository.countByFilters as jest.Mock).mockResolvedValue(60);
      (SalesRepository.findPreviousPeriodMetrics as jest.Mock).mockResolvedValue({ totalSales: 45, totalRevenue: 225000, totalCommission: 11250 });
      (metricsCalculator.calculateAverageTicket as jest.Mock).mockReturnValue(5000);
      (metricsCalculator.calculateConversionRate as jest.Mock).mockReturnValue(83.33);
      (metricsCalculator.calculateGrowthRate as jest.Mock).mockReturnValue(11.11);

      const query = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        sellerId: 'seller123'
      };

      await SalesMetricsService.getMetrics(query);

      expect(SalesRepository.aggregateMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          sellerId: 'seller123'
        })
      );
    });

    it('deve calcular taxa de conversão corretamente', async () => {
      const mockAggregated = {
        totalSales: 75,
        totalRevenue: 375000,
        totalCommission: 18750,
        salesByDay: [],
        salesByPaymentMethod: [],
        topSellers: []
      };

      (SalesRepository.aggregateMetrics as jest.Mock).mockResolvedValue(mockAggregated);
      (SalesRepository.calculateAverageSaleTime as jest.Mock).mockResolvedValue(40);
      (SalesRepository.countByFilters as jest.Mock).mockResolvedValue(100);
      (SalesRepository.findPreviousPeriodMetrics as jest.Mock).mockResolvedValue({ totalSales: 70, totalRevenue: 350000, totalCommission: 17500 });

      (metricsCalculator.calculateAverageTicket as jest.Mock).mockReturnValue(5000);
      (metricsCalculator.calculateConversionRate as jest.Mock).mockReturnValue(75);
      (metricsCalculator.calculateGrowthRate as jest.Mock).mockReturnValue(7.14);

      const query = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const result = await SalesMetricsService.getMetrics(query);

      expect(metricsCalculator.calculateConversionRate).toHaveBeenCalledWith(75, 100);
      expect(result.conversionRate).toBe(75);
    });
  });

  describe('calculateAndSaveMetrics', () => {
    it('deve calcular e salvar métricas com sucesso', async () => {
      const mockAggregated = {
        totalSales: 100,
        totalRevenue: 500000,
        totalCommission: 25000,
        salesByDay: [
          { _id: '2024-01-01', count: 50, revenue: 250000 },
          { _id: '2024-01-02', count: 50, revenue: 250000 }
        ],
        salesByPaymentMethod: [
          { _id: 'cash', count: 60, revenue: 300000 },
          { _id: 'financing', count: 40, revenue: 200000 }
        ],
        topSellers: [
          { _id: 'seller1', name: 'John Doe', salesCount: 60, revenue: 300000, commission: 15000 }
        ]
      };

      const mockSavedMetrics = {
        _id: 'metrics123',
        period: 'daily',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        totalSales: 100,
        totalRevenue: 500000,
        totalCommission: 25000,
        averageTicket: 5000,
        conversionRate: 83.33,
        averageTime: 48
      };

      (SalesRepository.aggregateMetrics as jest.Mock).mockResolvedValue(mockAggregated);
      (SalesRepository.calculateAverageSaleTime as jest.Mock).mockResolvedValue(48);
      (SalesRepository.countByFilters as jest.Mock).mockResolvedValue(120);
      (metricsCalculator.calculateAverageTicket as jest.Mock).mockReturnValue(5000);
      (metricsCalculator.calculateConversionRate as jest.Mock).mockReturnValue(83.33);

      const mockFindOneAndUpdate = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSavedMetrics)
        })
      });
      (SalesMetricsModel.findOneAndUpdate as jest.Mock) = mockFindOneAndUpdate;

      const query = {
        period: 'daily' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const result = await SalesMetricsService.calculateAndSaveMetrics(query);

      expect(result).toEqual(mockSavedMetrics);
      expect(mockFindOneAndUpdate).toHaveBeenCalled();
    });

    it('deve usar upsert para evitar duplicações', async () => {
      const mockAggregated = {
        totalSales: 50,
        totalRevenue: 250000,
        totalCommission: 12500,
        salesByDay: [],
        salesByPaymentMethod: [],
        topSellers: []
      };

      (SalesRepository.aggregateMetrics as jest.Mock).mockResolvedValue(mockAggregated);
      (SalesRepository.calculateAverageSaleTime as jest.Mock).mockResolvedValue(36);
      (SalesRepository.countByFilters as jest.Mock).mockResolvedValue(60);
      (metricsCalculator.calculateAverageTicket as jest.Mock).mockReturnValue(5000);
      (metricsCalculator.calculateConversionRate as jest.Mock).mockReturnValue(83.33);

      const mockFindOneAndUpdate = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({})
        })
      });
      (SalesMetricsModel.findOneAndUpdate as jest.Mock) = mockFindOneAndUpdate;

      const query = {
        period: 'daily' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01')
      };

      await SalesMetricsService.calculateAndSaveMetrics(query);

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          period: 'daily',
          startDate: query.startDate,
          endDate: query.endDate
        }),
        expect.any(Object),
        expect.objectContaining({
          upsert: true,
          new: true,
          runValidators: true
        })
      );
    });
  });

  describe('getDailyMetrics', () => {
    it('deve calcular métricas diárias para intervalo de datas', async () => {
      const mockAggregated = {
        totalSales: 10,
        totalRevenue: 50000,
        totalCommission: 2500,
        salesByDay: [{ _id: '2024-01-01', count: 10, revenue: 50000 }],
        salesByPaymentMethod: [],
        topSellers: []
      };

      (SalesRepository.aggregateMetrics as jest.Mock).mockResolvedValue(mockAggregated);
      (SalesRepository.calculateAverageSaleTime as jest.Mock).mockResolvedValue(24);
      (SalesRepository.countByFilters as jest.Mock).mockResolvedValue(12);
      (metricsCalculator.calculateAverageTicket as jest.Mock).mockReturnValue(5000);
      (metricsCalculator.calculateConversionRate as jest.Mock).mockReturnValue(83.33);

      const mockFindOneAndUpdate = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            period: 'daily',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-01'),
            totalSales: 10,
            totalRevenue: 50000,
            averageTicket: 5000
          })
        })
      });
      (SalesMetricsModel.findOneAndUpdate as jest.Mock) = mockFindOneAndUpdate;

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-02');

      const result = await SalesMetricsService.getDailyMetrics(startDate, endDate);

      expect(result).toHaveLength(2);
      expect(result[0].period).toBe('daily');
    });
  });

  describe('compareMetrics', () => {
    it('deve comparar métricas entre dois períodos', async () => {
      const mockMetrics1 = {
        totalSales: 80,
        totalRevenue: 400000,
        totalCommission: 20000,
        averageTicket: 5000,
        conversionRate: 80,
        averageTime: 48,
        periodComparison: {
          salesGrowth: 0,
          revenueGrowth: 0,
          previousPeriod: { totalSales: 80, totalRevenue: 400000, totalCommission: 20000 }
        }
      };

      const mockMetrics2 = {
        totalSales: 100,
        totalRevenue: 500000,
        totalCommission: 25000,
        averageTicket: 5000,
        conversionRate: 83.33,
        averageTime: 48,
        periodComparison: {
          salesGrowth: 25,
          revenueGrowth: 25,
          previousPeriod: { totalSales: 80, totalRevenue: 400000, totalCommission: 20000 }
        }
      };

      (SalesRepository.aggregateMetrics as jest.Mock).mockResolvedValue({
        totalSales: 80,
        totalRevenue: 400000,
        totalCommission: 20000,
        salesByDay: [],
        salesByPaymentMethod: [],
        topSellers: []
      });
      (SalesRepository.calculateAverageSaleTime as jest.Mock).mockResolvedValue(48);
      (SalesRepository.countByFilters as jest.Mock).mockResolvedValue(100);
      (SalesRepository.findPreviousPeriodMetrics as jest.Mock).mockResolvedValue({ totalSales: 80, totalRevenue: 400000, totalCommission: 20000 });
      (metricsCalculator.calculateAverageTicket as jest.Mock).mockReturnValue(5000);
      (metricsCalculator.calculateConversionRate as jest.Mock).mockReturnValue(80);
      (metricsCalculator.calculateGrowthRate as jest.Mock).mockReturnValue(25);

      const period1 = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const period2 = {
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-29')
      };

      const result = await SalesMetricsService.compareMetrics(period1, period2);

      expect(result).toHaveProperty('period1');
      expect(result).toHaveProperty('period2');
      expect(result).toHaveProperty('comparison');
      expect(result.comparison).toHaveProperty('salesDifference');
      expect(result.comparison).toHaveProperty('revenueDifference');
      expect(result.comparison).toHaveProperty('salesGrowth');
      expect(result.comparison).toHaveProperty('revenueGrowth');
    });
  });

  describe('Cálculos de Métricas', () => {
    it('deve calcular ticket médio corretamente', async () => {
      const mockAggregated = {
        totalSales: 100,
        totalRevenue: 1000000,
        totalCommission: 50000,
        salesByDay: [],
        salesByPaymentMethod: [],
        topSellers: []
      };

      (SalesRepository.aggregateMetrics as jest.Mock).mockResolvedValue(mockAggregated);
      (SalesRepository.calculateAverageSaleTime as jest.Mock).mockResolvedValue(48);
      (SalesRepository.countByFilters as jest.Mock).mockResolvedValue(120);
      (SalesRepository.findPreviousPeriodMetrics as jest.Mock).mockResolvedValue({ totalSales: 90, totalRevenue: 900000, totalCommission: 45000 });

      (metricsCalculator.calculateAverageTicket as jest.Mock).mockReturnValue(10000);
      (metricsCalculator.calculateConversionRate as jest.Mock).mockReturnValue(83.33);
      (metricsCalculator.calculateGrowthRate as jest.Mock).mockReturnValue(11.11);

      const query = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const result = await SalesMetricsService.getMetrics(query);

      expect(metricsCalculator.calculateAverageTicket).toHaveBeenCalledWith(1000000, 100);
      expect(result.averageTicket).toBe(10000);
    });

    it('deve retornar 0 para métricas quando não há vendas', async () => {
      const mockAggregated = {
        totalSales: 0,
        totalRevenue: 0,
        totalCommission: 0,
        salesByDay: [],
        salesByPaymentMethod: [],
        topSellers: []
      };

      (SalesRepository.aggregateMetrics as jest.Mock).mockResolvedValue(mockAggregated);
      (SalesRepository.calculateAverageSaleTime as jest.Mock).mockResolvedValue(0);
      (SalesRepository.countByFilters as jest.Mock).mockResolvedValue(0);
      (SalesRepository.findPreviousPeriodMetrics as jest.Mock).mockResolvedValue({ totalSales: 0, totalRevenue: 0, totalCommission: 0 });

      (metricsCalculator.calculateAverageTicket as jest.Mock).mockReturnValue(0);
      (metricsCalculator.calculateConversionRate as jest.Mock).mockReturnValue(0);
      (metricsCalculator.calculateGrowthRate as jest.Mock).mockReturnValue(0);

      const query = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const result = await SalesMetricsService.getMetrics(query);

      expect(result.totalSales).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.averageTicket).toBe(0);
    });
  });

  describe('Performance Tests', () => {
    it('deve processar cálculos grandes em menos de 1 segundo', async () => {
      const mockAggregated = {
        totalSales: 10000,
        totalRevenue: 50000000,
        totalCommission: 2500000,
        salesByDay: Array(365).fill(0).map((_, i) => ({
          _id: `2024-01-${String(i + 1).padStart(2, '0')}`,
          count: 27,
          revenue: 137000
        })),
        salesByPaymentMethod: [
          { _id: 'cash', count: 6000, revenue: 30000000 },
          { _id: 'financing', count: 4000, revenue: 20000000 }
        ],
        topSellers: Array(100).fill(0).map((_, i) => ({
          _id: `seller${i}`,
          name: `Seller ${i}`,
          salesCount: 100,
          revenue: 500000,
          commission: 25000
        }))
      };

      (SalesRepository.aggregateMetrics as jest.Mock).mockResolvedValue(mockAggregated);
      (SalesRepository.calculateAverageSaleTime as jest.Mock).mockResolvedValue(48);
      (SalesRepository.countByFilters as jest.Mock).mockResolvedValue(12000);
      (SalesRepository.findPreviousPeriodMetrics as jest.Mock).mockResolvedValue({ totalSales: 9000, totalRevenue: 45000000, totalCommission: 2250000 });

      (metricsCalculator.calculateAverageTicket as jest.Mock).mockReturnValue(5000);
      (metricsCalculator.calculateConversionRate as jest.Mock).mockReturnValue(83.33);
      (metricsCalculator.calculateGrowthRate as jest.Mock).mockReturnValue(11.11);

      const query = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      const startTime = Date.now();
      await SalesMetricsService.getMetrics(query);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
