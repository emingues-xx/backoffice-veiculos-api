import { connectDatabase, disconnectDatabase } from '@/config/database';
import { config } from '@/config/config';

beforeAll(async () => {
  // Use test database
  process.env.NODE_ENV = 'test';
  await connectDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections
  const mongoose = require('mongoose');
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
