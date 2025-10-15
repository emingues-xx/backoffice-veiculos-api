import SaleModel, { SaleDocument } from '@/models/Sale';
import { MetricsQuery } from '@/types/metrics.types';
import { FilterQuery, PipelineStage } from 'mongoose';

export interface SalesFilter {
  startDate: Date;
  endDate: Date;
  sellerId?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'financing' | 'trade-in';
}

export interface SalesAggregationResult {
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  salesByDay: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  salesByPaymentMethod: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  topSellers: Array<{
    _id: string;
    name: string;
    salesCount: number;
    revenue: number;
    commission: number;
  }>;
}

export class SalesRepository {
  /**
   * Busca vendas com filtros otimizados
   */
  async findByFilters(filters: SalesFilter): Promise<SaleDocument[]> {
    const query: FilterQuery<SaleDocument> = {
      saleDate: {
        $gte: filters.startDate,
        $lte: filters.endDate
      }
    };

    if (filters.sellerId) {
      query['seller.id'] = filters.sellerId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.paymentMethod) {
      query.paymentMethod = filters.paymentMethod;
    }

    return SaleModel
      .find(query)
      .sort({ saleDate: -1 })
      .lean()
      .exec();
  }

  /**
   * Agrega métricas de vendas usando pipeline MongoDB otimizado
   */
  async aggregateMetrics(filters: SalesFilter): Promise<SalesAggregationResult> {
    const matchStage: PipelineStage.Match = {
      $match: {
        saleDate: {
          $gte: filters.startDate,
          $lte: filters.endDate
        }
      }
    };

    if (filters.sellerId) {
      matchStage.$match['seller.id'] = filters.sellerId;
    }

    if (filters.status) {
      matchStage.$match.status = filters.status;
    }

    if (filters.paymentMethod) {
      matchStage.$match.paymentMethod = filters.paymentMethod;
    }

    const pipeline: PipelineStage[] = [
      matchStage,
      {
        $facet: {
          // Totais gerais
          totals: [
            {
              $group: {
                _id: null,
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: '$salePrice' },
                totalCommission: { $sum: '$commission' }
              }
            }
          ],
          // Vendas por dia
          salesByDay: [
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$saleDate' }
                },
                count: { $sum: 1 },
                revenue: { $sum: '$salePrice' }
              }
            },
            { $sort: { _id: 1 } }
          ],
          // Vendas por método de pagamento
          salesByPaymentMethod: [
            {
              $group: {
                _id: '$paymentMethod',
                count: { $sum: 1 },
                revenue: { $sum: '$salePrice' }
              }
            }
          ],
          // Top vendedores
          topSellers: [
            {
              $group: {
                _id: '$seller.id',
                name: { $first: '$seller.name' },
                salesCount: { $sum: 1 },
                revenue: { $sum: '$salePrice' },
                commission: { $sum: '$commission' }
              }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ];

    const result = await SaleModel.aggregate(pipeline).exec();

    if (!result || result.length === 0) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        totalCommission: 0,
        salesByDay: [],
        salesByPaymentMethod: [],
        topSellers: []
      };
    }

    const aggregated = result[0];
    const totals = aggregated.totals[0] || { totalSales: 0, totalRevenue: 0, totalCommission: 0 };

    return {
      totalSales: totals.totalSales,
      totalRevenue: totals.totalRevenue,
      totalCommission: totals.totalCommission,
      salesByDay: aggregated.salesByDay || [],
      salesByPaymentMethod: aggregated.salesByPaymentMethod || [],
      topSellers: aggregated.topSellers || []
    };
  }

  /**
   * Conta total de vendas com filtros
   */
  async countByFilters(filters: SalesFilter): Promise<number> {
    const query: FilterQuery<SaleDocument> = {
      saleDate: {
        $gte: filters.startDate,
        $lte: filters.endDate
      }
    };

    if (filters.sellerId) {
      query['seller.id'] = filters.sellerId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.paymentMethod) {
      query.paymentMethod = filters.paymentMethod;
    }

    return SaleModel.countDocuments(query).exec();
  }

  /**
   * Calcula tempo médio de venda (da criação até a conclusão)
   */
  async calculateAverageSaleTime(filters: SalesFilter): Promise<number> {
    const matchStage: FilterQuery<SaleDocument> = {
      saleDate: {
        $gte: filters.startDate,
        $lte: filters.endDate
      },
      status: 'completed'
    };

    if (filters.sellerId) {
      matchStage['seller.id'] = filters.sellerId;
    }

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $project: {
          timeInHours: {
            $divide: [
              { $subtract: ['$saleDate', '$createdAt'] },
              1000 * 60 * 60 // Converte ms para horas
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageTime: { $avg: '$timeInHours' }
        }
      }
    ];

    const result = await SaleModel.aggregate(pipeline).exec();

    return result.length > 0 ? Math.round(result[0].averageTime * 100) / 100 : 0;
  }

  /**
   * Busca vendas de um período anterior para comparação
   */
  async findPreviousPeriodMetrics(filters: SalesFilter): Promise<{ totalSales: number; totalRevenue: number }> {
    const periodDuration = filters.endDate.getTime() - filters.startDate.getTime();
    const previousStartDate = new Date(filters.startDate.getTime() - periodDuration);
    const previousEndDate = new Date(filters.startDate.getTime());

    const pipeline: PipelineStage[] = [
      {
        $match: {
          saleDate: {
            $gte: previousStartDate,
            $lt: previousEndDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$salePrice' }
        }
      }
    ];

    if (filters.sellerId) {
      (pipeline[0] as any).$match['seller.id'] = filters.sellerId;
    }

    const result = await SaleModel.aggregate(pipeline).exec();

    return result.length > 0
      ? { totalSales: result[0].totalSales, totalRevenue: result[0].totalRevenue }
      : { totalSales: 0, totalRevenue: 0 };
  }

  /**
   * Busca venda por ID
   */
  async findById(id: string): Promise<SaleDocument | null> {
    return SaleModel.findById(id).lean().exec();
  }

  /**
   * Cria nova venda
   */
  async create(saleData: Partial<SaleDocument>): Promise<SaleDocument> {
    const sale = new SaleModel(saleData);
    return sale.save();
  }

  /**
   * Atualiza venda existente
   */
  async update(id: string, saleData: Partial<SaleDocument>): Promise<SaleDocument | null> {
    return SaleModel.findByIdAndUpdate(
      id,
      { $set: saleData },
      { new: true, runValidators: true }
    ).lean().exec();
  }

  /**
   * Remove venda
   */
  async delete(id: string): Promise<boolean> {
    const result = await SaleModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

export default new SalesRepository();
