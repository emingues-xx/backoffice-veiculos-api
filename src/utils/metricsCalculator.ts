/**
 * Calcula o ticket médio (receita média por venda)
 * @param totalRevenue - Receita total
 * @param totalSales - Número total de vendas
 * @returns Ticket médio arredondado para 2 casas decimais
 */
export function calculateAverageTicket(totalRevenue: number, totalSales: number): number {
  if (totalSales === 0) return 0;
  return Math.round((totalRevenue / totalSales) * 100) / 100;
}

/**
 * Calcula a taxa de conversão (%)
 * @param completedSales - Número de vendas completadas
 * @param totalAttempts - Número total de tentativas (incluindo pendentes e canceladas)
 * @returns Taxa de conversão em % (0-100)
 */
export function calculateConversionRate(completedSales: number, totalAttempts: number): number {
  if (totalAttempts === 0) return 0;
  return Math.round((completedSales / totalAttempts) * 10000) / 100;
}

/**
 * Calcula a taxa de crescimento entre dois períodos (%)
 * @param previousValue - Valor do período anterior
 * @param currentValue - Valor do período atual
 * @returns Taxa de crescimento em % (pode ser negativa)
 */
export function calculateGrowthRate(previousValue: number, currentValue: number): number {
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }
  return Math.round(((currentValue - previousValue) / previousValue) * 10000) / 100;
}

/**
 * Calcula a margem de lucro (%)
 * @param revenue - Receita total
 * @param cost - Custo total
 * @returns Margem de lucro em %
 */
export function calculateProfitMargin(revenue: number, cost: number): number {
  if (revenue === 0) return 0;
  return Math.round(((revenue - cost) / revenue) * 10000) / 100;
}

/**
 * Calcula a taxa de comissão média (%)
 * @param totalCommission - Comissão total
 * @param totalRevenue - Receita total
 * @returns Taxa de comissão em %
 */
export function calculateCommissionRate(totalCommission: number, totalRevenue: number): number {
  if (totalRevenue === 0) return 0;
  return Math.round((totalCommission / totalRevenue) * 10000) / 100;
}

/**
 * Calcula média ponderada
 * @param values - Array de valores
 * @param weights - Array de pesos
 * @returns Média ponderada
 */
export function calculateWeightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length || values.length === 0) return 0;

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = values.reduce((sum, value, index) => sum + value * weights[index], 0);
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Calcula o desvio padrão de um conjunto de valores
 * @param values - Array de valores
 * @returns Desvio padrão
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;

  return Math.round(Math.sqrt(variance) * 100) / 100;
}

/**
 * Calcula percentis de um conjunto de valores
 * @param values - Array de valores
 * @param percentile - Percentil desejado (0-100)
 * @returns Valor no percentil especificado
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  if (percentile < 0 || percentile > 100) {
    throw new Error('Percentile must be between 0 and 100');
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) {
    return sorted[lower];
  }

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calcula ROI (Return on Investment)
 * @param profit - Lucro obtido
 * @param investment - Investimento inicial
 * @returns ROI em %
 */
export function calculateROI(profit: number, investment: number): number {
  if (investment === 0) return 0;
  return Math.round((profit / investment) * 10000) / 100;
}

/**
 * Calcula tempo médio em formato legível
 * @param hours - Tempo em horas
 * @returns Objeto com dias, horas e minutos
 */
export function formatAverageTime(hours: number): { days: number; hours: number; minutes: number } {
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  const minutes = Math.round((hours % 1) * 60);

  return { days, hours: remainingHours, minutes };
}

/**
 * Calcula diferença percentual simples
 * @param value1 - Primeiro valor
 * @param value2 - Segundo valor
 * @returns Diferença percentual
 */
export function calculatePercentageDifference(value1: number, value2: number): number {
  if (value1 === 0 && value2 === 0) return 0;
  if (value1 === 0) return 100;

  const average = (value1 + value2) / 2;
  return Math.round((Math.abs(value1 - value2) / average) * 10000) / 100;
}

/**
 * Agrupa valores por período de tempo
 * @param data - Array de objetos com data e valor
 * @param period - Período de agrupamento ('day' | 'week' | 'month' | 'year')
 * @returns Map com valores agrupados por período
 */
export function groupByTimePeriod(
  data: Array<{ date: Date; value: number }>,
  period: 'day' | 'week' | 'month' | 'year'
): Map<string, number> {
  const grouped = new Map<string, number>();

  data.forEach(({ date, value }) => {
    let key: string;
    const d = new Date(date);

    switch (period) {
      case 'day':
        key = d.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = String(d.getFullYear());
        break;
    }

    grouped.set(key, (grouped.get(key) || 0) + value);
  });

  return grouped;
}

/**
 * Calcula taxa de retenção
 * @param returningCustomers - Clientes que retornaram
 * @param totalCustomers - Total de clientes
 * @returns Taxa de retenção em %
 */
export function calculateRetentionRate(returningCustomers: number, totalCustomers: number): number {
  if (totalCustomers === 0) return 0;
  return Math.round((returningCustomers / totalCustomers) * 10000) / 100;
}

/**
 * Calcula CAGR (Compound Annual Growth Rate)
 * @param beginningValue - Valor inicial
 * @param endingValue - Valor final
 * @param numberOfYears - Número de anos
 * @returns CAGR em %
 */
export function calculateCAGR(beginningValue: number, endingValue: number, numberOfYears: number): number {
  if (beginningValue === 0 || numberOfYears === 0) return 0;
  return Math.round((Math.pow(endingValue / beginningValue, 1 / numberOfYears) - 1) * 10000) / 100;
}

/**
 * Calcula tendência linear usando regressão simples
 * @param values - Array de valores
 * @returns Coeficiente angular (slope) e intercepto
 */
export function calculateTrend(values: number[]): { slope: number; intercept: number; trend: 'up' | 'down' | 'stable' } {
  if (values.length < 2) {
    return { slope: 0, intercept: 0, trend: 'stable' };
  }

  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((sum, y) => sum + y, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = i - xMean;
    numerator += xDiff * (values[i] - yMean);
    denominator += xDiff * xDiff;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (slope > 0.01) trend = 'up';
  else if (slope < -0.01) trend = 'down';

  return {
    slope: Math.round(slope * 100) / 100,
    intercept: Math.round(intercept * 100) / 100,
    trend
  };
}

/**
 * Normaliza valores para uma escala de 0 a 100
 * @param values - Array de valores
 * @returns Array de valores normalizados
 */
export function normalizeValues(values: number[]): number[] {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) return values.map(() => 50);

  return values.map(value => Math.round(((value - min) / (max - min)) * 100));
}
