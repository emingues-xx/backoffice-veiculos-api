import request from 'supertest';
import app from '@/app';
import mongoose from 'mongoose';
import SaleModel from '@/models/Sale';
import UserModel from '@/models/User';
import VehicleModel from '@/models/Vehicle';
import jwt from 'jsonwebtoken';
import config from '@/config/config';
import { createClient } from 'redis';

let authToken: string;
let testUserId: string;
let redisClient: any;

describe('Metrics Integration Tests', () => {
  beforeAll(async () => {
    // Conecta ao banco de teste
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/backoffice-test');
    }

    // Cria cliente Redis para testes
    if (process.env.REDIS_URL) {
      redisClient = createClient({ url: process.env.REDIS_URL });
      await redisClient.connect();
    }

    // Limpa coleções
    await Promise.all([
      SaleModel.deleteMany({}),
      UserModel.deleteMany({}),
      VehicleModel.deleteMany({})
    ]);

    // Cria usuário de teste
    const testUser = await UserModel.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'hashedPassword123',
      role: 'admin'
    });

    testUserId = testUser._id.toString();

    // Gera token JWT
    authToken = jwt.sign(
      { userId: testUserId, email: testUser.email, role: testUser.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  });

  afterAll(async () => {
    // Limpa dados de teste
    await Promise.all([
      SaleModel.deleteMany({}),
      UserModel.deleteMany({}),
      VehicleModel.deleteMany({})
    ]);

    if (redisClient) {
      await redisClient.quit();
    }

    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Limpa cache Redis antes de cada teste
    if (redisClient) {
      await redisClient.flushAll();
    }
  });

  describe('GET /api/metrics/total-sales', () => {
    beforeEach(async () => {
      // Cria vendas de teste
      const salesData = Array(50).fill(0).map((_, i) => ({
        vehicleId: new mongoose.Types.ObjectId(),
        seller: {
          id: testUserId,
          name: 'Test Admin',
          email: 'admin@test.com'
        },
        buyer: {
          name: 'Buyer Test',
          email: 'buyer@test.com',
          phone: '1234567890',
          cpf: '12345678901'
        },
        salePrice: 50000 + i * 100,
        commission: 2500 + i * 5,
        paymentMethod: i % 2 === 0 ? 'cash' : 'financing',
        status: 'completed',
        saleDate: new Date('2024-01-15'),
        vehicleSnapshot: {
          brand: 'Toyota',
          model: 'Corolla',
          year: 2024,
          price: 50000
        }
      }));

      await SaleModel.insertMany(salesData);
    });

    afterEach(async () => {
      await SaleModel.deleteMany({});
    });

    it('deve retornar métricas de vendas totais com autenticação', async () => {
      const response = await request(app)
        .get('/api/metrics/total-sales')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalSales');
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('growth');
      expect(response.body.data.totalSales).toBe(50);
    });

    it('deve responder em menos de 1 segundo', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/metrics/total-sales')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000);
    });

    it('deve retornar erro 401 sem autenticação', async () => {
      const response = await request(app)
        .get('/api/metrics/total-sales')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 400 sem parâmetros obrigatórios', async () => {
      const response = await request(app)
        .get('/api/metrics/total-sales')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve usar cache na segunda requisição', async () => {
      if (!redisClient) {
        console.log('Redis não disponível, pulando teste de cache');
        return;
      }

      const query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      // Primeira requisição
      const response1 = await request(app)
        .get('/api/metrics/total-sales')
        .set('Authorization', `Bearer ${authToken}`)
        .query(query);

      // Segunda requisição (deve vir do cache)
      const startTime = Date.now();
      const response2 = await request(app)
        .get('/api/metrics/total-sales')
        .set('Authorization', `Bearer ${authToken}`)
        .query(query);
      const responseTime = Date.now() - startTime;

      expect(response1.body).toEqual(response2.body);
      expect(responseTime).toBeLessThan(100); // Cache deve ser muito rápido
    });
  });

  describe('GET /api/metrics/daily-sales', () => {
    beforeEach(async () => {
      const salesData = [
        ...Array(10).fill(0).map((_, i) => ({
          vehicleId: new mongoose.Types.ObjectId(),
          seller: { id: testUserId, name: 'Test Admin', email: 'admin@test.com' },
          buyer: { name: 'Buyer Test', email: 'buyer@test.com', phone: '1234567890', cpf: '12345678901' },
          salePrice: 50000,
          commission: 2500,
          paymentMethod: 'cash' as const,
          status: 'completed' as const,
          saleDate: new Date('2024-01-10'),
          vehicleSnapshot: { brand: 'Toyota', model: 'Corolla', year: 2024, price: 50000 }
        })),
        ...Array(15).fill(0).map((_, i) => ({
          vehicleId: new mongoose.Types.ObjectId(),
          seller: { id: testUserId, name: 'Test Admin', email: 'admin@test.com' },
          buyer: { name: 'Buyer Test', email: 'buyer@test.com', phone: '1234567890', cpf: '12345678901' },
          salePrice: 60000,
          commission: 3000,
          paymentMethod: 'financing' as const,
          status: 'completed' as const,
          saleDate: new Date('2024-01-11'),
          vehicleSnapshot: { brand: 'Honda', model: 'Civic', year: 2024, price: 60000 }
        }))
      ];

      await SaleModel.insertMany(salesData);
    });

    afterEach(async () => {
      await SaleModel.deleteMany({});
    });

    it('deve retornar vendas diárias do período', async () => {
      const response = await request(app)
        .get('/api/metrics/daily-sales')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-10',
          endDate: '2024-01-11'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.dailyMetrics).toHaveLength(2);
    });
  });

  describe('GET /api/metrics/average-ticket', () => {
    beforeEach(async () => {
      const salesData = Array(20).fill(0).map((_, i) => ({
        vehicleId: new mongoose.Types.ObjectId(),
        seller: { id: testUserId, name: 'Test Admin', email: 'admin@test.com' },
        buyer: { name: 'Buyer Test', email: 'buyer@test.com', phone: '1234567890', cpf: '12345678901' },
        salePrice: 100000,
        commission: 5000,
        paymentMethod: 'cash' as const,
        status: 'completed' as const,
        saleDate: new Date('2024-01-15'),
        vehicleSnapshot: { brand: 'Toyota', model: 'Corolla', year: 2024, price: 100000 }
      }));

      await SaleModel.insertMany(salesData);
    });

    afterEach(async () => {
      await SaleModel.deleteMany({});
    });

    it('deve calcular ticket médio corretamente', async () => {
      const response = await request(app)
        .get('/api/metrics/average-ticket')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.averageTicket).toBe(100000);
      expect(response.body.data.totalSales).toBe(20);
      expect(response.body.data.totalRevenue).toBe(2000000);
    });
  });

  describe('GET /api/metrics/conversion-rate', () => {
    beforeEach(async () => {
      const salesData = [
        ...Array(75).fill(0).map(() => ({
          vehicleId: new mongoose.Types.ObjectId(),
          seller: { id: testUserId, name: 'Test Admin', email: 'admin@test.com' },
          buyer: { name: 'Buyer Test', email: 'buyer@test.com', phone: '1234567890', cpf: '12345678901' },
          salePrice: 50000,
          commission: 2500,
          paymentMethod: 'cash' as const,
          status: 'completed' as const,
          saleDate: new Date('2024-01-15'),
          vehicleSnapshot: { brand: 'Toyota', model: 'Corolla', year: 2024, price: 50000 }
        })),
        ...Array(15).fill(0).map(() => ({
          vehicleId: new mongoose.Types.ObjectId(),
          seller: { id: testUserId, name: 'Test Admin', email: 'admin@test.com' },
          buyer: { name: 'Buyer Test', email: 'buyer@test.com', phone: '1234567890', cpf: '12345678901' },
          salePrice: 50000,
          commission: 2500,
          paymentMethod: 'cash' as const,
          status: 'pending' as const,
          saleDate: new Date('2024-01-15'),
          vehicleSnapshot: { brand: 'Toyota', model: 'Corolla', year: 2024, price: 50000 }
        })),
        ...Array(10).fill(0).map(() => ({
          vehicleId: new mongoose.Types.ObjectId(),
          seller: { id: testUserId, name: 'Test Admin', email: 'admin@test.com' },
          buyer: { name: 'Buyer Test', email: 'buyer@test.com', phone: '1234567890', cpf: '12345678901' },
          salePrice: 50000,
          commission: 2500,
          paymentMethod: 'cash' as const,
          status: 'cancelled' as const,
          saleDate: new Date('2024-01-15'),
          vehicleSnapshot: { brand: 'Toyota', model: 'Corolla', year: 2024, price: 50000 }
        }))
      ];

      await SaleModel.insertMany(salesData);
    });

    afterEach(async () => {
      await SaleModel.deleteMany({});
    });

    it('deve calcular taxa de conversão corretamente', async () => {
      const response = await request(app)
        .get('/api/metrics/conversion-rate')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.conversionRate).toBe(75);
      expect(response.body.data.totalSales).toBe(75);
    });
  });

  describe('GET /api/metrics/summary', () => {
    beforeEach(async () => {
      const salesData = Array(100).fill(0).map((_, i) => ({
        vehicleId: new mongoose.Types.ObjectId(),
        seller: { id: testUserId, name: 'Test Admin', email: 'admin@test.com' },
        buyer: { name: 'Buyer Test', email: 'buyer@test.com', phone: '1234567890', cpf: '12345678901' },
        salePrice: 50000 + i * 100,
        commission: 2500 + i * 5,
        paymentMethod: i % 2 === 0 ? 'cash' : 'financing' as 'cash' | 'financing',
        status: 'completed' as const,
        saleDate: new Date('2024-01-15'),
        vehicleSnapshot: { brand: 'Toyota', model: 'Corolla', year: 2024, price: 50000 }
      }));

      await SaleModel.insertMany(salesData);
    });

    afterEach(async () => {
      await SaleModel.deleteMany({});
    });

    it('deve retornar resumo completo de métricas', async () => {
      const response = await request(app)
        .get('/api/metrics/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalSales');
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('averageTicket');
      expect(response.body.data).toHaveProperty('conversionRate');
      expect(response.body.data).toHaveProperty('averageTime');
      expect(response.body.data).toHaveProperty('periodComparison');
    });

    it('deve responder em menos de 1 segundo para 100 vendas', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/metrics/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('Load Testing', () => {
    beforeEach(async () => {
      const salesData = Array(500).fill(0).map((_, i) => ({
        vehicleId: new mongoose.Types.ObjectId(),
        seller: { id: testUserId, name: 'Test Admin', email: 'admin@test.com' },
        buyer: { name: 'Buyer Test', email: 'buyer@test.com', phone: '1234567890', cpf: '12345678901' },
        salePrice: 50000 + i * 100,
        commission: 2500 + i * 5,
        paymentMethod: i % 2 === 0 ? 'cash' : 'financing' as 'cash' | 'financing',
        status: 'completed' as const,
        saleDate: new Date(2024, 0, 1 + (i % 30)),
        vehicleSnapshot: { brand: 'Toyota', model: 'Corolla', year: 2024, price: 50000 }
      }));

      await SaleModel.insertMany(salesData);
    });

    afterEach(async () => {
      await SaleModel.deleteMany({});
    });

    it('deve processar 500 vendas em menos de 1 segundo', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get('/api/metrics/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(response.body.data.totalSales).toBe(500);
      expect(responseTime).toBeLessThan(1000);
    });

    it('deve processar múltiplas requisições concorrentes', async () => {
      const requests = Array(10).fill(0).map(() =>
        request(app)
          .get('/api/metrics/summary')
          .set('Authorization', `Bearer ${authToken}`)
          .query({
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.data.totalSales).toBe(500);
      });

      expect(totalTime).toBeLessThan(5000); // 10 requisições em menos de 5s
    });
  });

  describe('Error Handling', () => {
    it('deve tratar data inválida corretamente', async () => {
      const response = await request(app)
        .get('/api/metrics/total-sales')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: 'invalid-date',
          endDate: '2024-01-31'
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('deve tratar token JWT inválido', async () => {
      const response = await request(app)
        .get('/api/metrics/total-sales')
        .set('Authorization', 'Bearer invalid-token')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      expect(response.status).toBe(401);
    });
  });
});
