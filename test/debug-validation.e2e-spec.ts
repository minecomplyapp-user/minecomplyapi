import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupTestApp } from './test-helper';
import { createValidCMVRData } from './test-data-factory';

describe('Debug Validation (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupTestApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should log validation errors for factory data', async () => {
    const cmvrData = createValidCMVRData({
      companyName: 'Debug Test Company',
    });

    const response = await request(app.getHttpServer())
      .post('/cmvr')
      .send(cmvrData);

    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
  });
});
