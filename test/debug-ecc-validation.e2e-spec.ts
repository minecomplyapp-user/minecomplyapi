import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupTestApp } from './test-helper';
import { createValidECCData } from './ecc-test-data-factory';

describe('Debug ECC Validation (e2e)', () => {
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

  it('should log ECC validation errors', async () => {
    const eccData = createValidECCData({
      generalInfo: {
        companyName: 'Debug Test',
      },
    });

    const response = await request(app.getHttpServer())
      .post('/ecc/createEccReport')
      .send(eccData);

    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
  });
});
