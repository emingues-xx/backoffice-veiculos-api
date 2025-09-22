import request from 'supertest';
import app from '../app';
import Vehicle from '../models/Vehicle';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

describe('Vehicle API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'seller'
    });
    await user.save();
    userId = user._id.toString();

    // Generate auth token
    authToken = jwt.sign(
      { id: userId, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/vehicles', () => {
    it('should create a new vehicle', async () => {
      const vehicleData = {
        brand: 'Toyota',
        vehicleModel: 'Corolla',
        year: 2020,
        mileage: 50000,
        price: 80000,
        fuelType: 'gasoline',
        transmission: 'automatic',
        color: 'White',
        doors: 4,
        category: 'car',
        condition: 'used',
        description: 'Well maintained Toyota Corolla',
        images: ['https://example.com/image1.jpg'],
        features: ['Air Conditioning', 'Power Steering'],
        location: {
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        },
        seller: {
          id: userId,
          name: 'Test User',
          phone: '(11) 99999-9999',
          email: 'test@example.com'
        }
      };

      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(vehicleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.brand).toBe('Toyota');
      expect(response.body.data.model).toBe('Corolla');
    });

    it('should return 401 without authentication', async () => {
      const vehicleData = {
        brand: 'Toyota',
        vehicleModel: 'Corolla',
        year: 2020,
        mileage: 50000,
        price: 80000,
        fuelType: 'gasoline',
        transmission: 'automatic',
        color: 'White',
        doors: 4,
        category: 'car',
        condition: 'used',
        description: 'Well maintained Toyota Corolla',
        images: ['https://example.com/image1.jpg'],
        features: ['Air Conditioning'],
        location: {
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        },
        seller: {
          id: userId,
          name: 'Test User',
          phone: '(11) 99999-9999',
          email: 'test@example.com'
        }
      };

      await request(app)
        .post('/api/vehicles')
        .send(vehicleData)
        .expect(401);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should get all vehicles', async () => {
      const response = await request(app)
        .get('/api/vehicles')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
