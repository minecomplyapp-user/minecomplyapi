import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { setupTestApp } from './test-helper';
import { createValidCMVRData } from './test-data-factory';

describe('CMVR Quarter/Year Filtering (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdReportIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupTestApp(app); // Add validation pipe and other global config
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Cleanup: Delete test reports
    if (createdReportIds.length > 0) {
      await prisma.cMVRReport.deleteMany({
        where: { id: { in: createdReportIds } },
      });
    }
    await app.close();
  });

  describe('2.1 Quarter/Year Extraction', () => {
    it('should create CMVR with quarter "1st" and store as "Q1"', async () => {
      const response = await request(app.getHttpServer())
        .post('/cmvr')
        .send(createValidCMVRData({
          quarter: '1st',
          year: 2025,
        }))
        .expect(201);

      createdReportIds.push(response.body.id);

      // Verify in database
      const report = await prisma.cMVRReport.findUnique({
        where: { id: response.body.id },
      });

      expect(report.quarter).toBe('Q1');
      expect(report.year).toBe(2025);
    });

    it('should create CMVR with quarter "Q2" and store as "Q2"', async () => {
      const response = await request(app.getHttpServer())
        .post('/cmvr')
        .send(createValidCMVRData({
          quarter: 'Q2',
          year: 2025,
        }))
        .expect(201);

      createdReportIds.push(response.body.id);

      const report = await prisma.cMVRReport.findUnique({
        where: { id: response.body.id },
      });

      expect(report.quarter).toBe('Q2');
      expect(report.year).toBe(2025);
    });

    it('should create CMVR without quarter/year and store as null', async () => {
      // Note: quarter and year are now required fields in DTO validation
      // This test needs to be reconsidered or DTOs updated to make them optional
      const response = await request(app.getHttpServer())
        .post('/cmvr')
        .send(createValidCMVRData({
          quarter: '',  // Empty string might be stored as null
          year: 0,      // Zero might be stored as null
        }))
        .expect(201);

      createdReportIds.push(response.body.id);

      const report = await prisma.cMVRReport.findUnique({
        where: { id: response.body.id },
      });

      expect(report.quarter).toBeNull();
      expect(report.year).toBeNull();
    });

    it('should handle invalid quarter values gracefully', async () => {
      const response = await request(app.getHttpServer())
        .post('/cmvr')
        .send(createValidCMVRData({
          quarter: '5th', // Invalid quarter value
          year: 2025,
        }))
        .expect(201);

      createdReportIds.push(response.body.id);

      const report = await prisma.cMVRReport.findUnique({
        where: { id: response.body.id },
      });

      expect(report.quarter).toBeNull(); // Should store null for invalid values
    });

    it('should extract "Q3" from "3rd" or "third"', async () => {
      const response = await request(app.getHttpServer())
        .post('/cmvr')
        .send(createValidCMVRData({
          quarter: '3rd',
          year: 2025,
        }))
        .expect(201);

      createdReportIds.push(response.body.id);

      const report = await prisma.cMVRReport.findUnique({
        where: { id: response.body.id },
      });

      expect(report.quarter).toBe('Q3');
    });
  });

  describe('2.2 Quarter Filtering Endpoints', () => {
    let q1Report2025: string;
    let q2Report2025: string;
    let q1Report2024: string;

    beforeAll(async () => {
      // Create test data
      const r1 = await prisma.cMVRReport.create({
        data: {
          quarter: 'Q1',
          year: 2025,
          cmvrData: {},
          fileName: 'Q1-2025-Test',
        },
      });
      q1Report2025 = r1.id;
      createdReportIds.push(r1.id);

      const r2 = await prisma.cMVRReport.create({
        data: {
          quarter: 'Q2',
          year: 2025,
          cmvrData: {},
          fileName: 'Q2-2025-Test',
        },
      });
      q2Report2025 = r2.id;
      createdReportIds.push(r2.id);

      const r3 = await prisma.cMVRReport.create({
        data: {
          quarter: 'Q1',
          year: 2024,
          cmvrData: {},
          fileName: 'Q1-2024-Test',
        },
      });
      q1Report2024 = r3.id;
      createdReportIds.push(r3.id);
    });

    it('should filter by quarter only', async () => {
      const response = await request(app.getHttpServer())
        .get('/cmvr?quarter=Q1')
        .expect(200);

      const reportIds = response.body.map((r: any) => r.id);
      expect(reportIds).toContain(q1Report2025);
      expect(reportIds).toContain(q1Report2024);
      expect(reportIds).not.toContain(q2Report2025);
    });

    it('should filter by year only', async () => {
      const response = await request(app.getHttpServer())
        .get('/cmvr?year=2025')
        .expect(200);

      const reportIds = response.body.map((r: any) => r.id);
      expect(reportIds).toContain(q1Report2025);
      expect(reportIds).toContain(q2Report2025);
      expect(reportIds).not.toContain(q1Report2024);
    });

    it('should filter by both quarter and year', async () => {
      const response = await request(app.getHttpServer())
        .get('/cmvr?quarter=Q1&year=2025')
        .expect(200);

      const reportIds = response.body.map((r: any) => r.id);
      expect(reportIds).toContain(q1Report2025);
      expect(reportIds).not.toContain(q2Report2025);
      expect(reportIds).not.toContain(q1Report2024);
    });

    it('should return all reports with no filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/cmvr')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return grouped reports by quarter', async () => {
      const response = await request(app.getHttpServer())
        .get('/cmvr/grouped-by-quarter?year=2025')
        .expect(200);

      expect(response.body['2025']).toBeDefined();
      expect(response.body['2025']['Q1']).toBeDefined();
      expect(response.body['2025']['Q2']).toBeDefined();
      expect(Array.isArray(response.body['2025']['Q1'])).toBe(true);
    });

    it('should return empty array for invalid quarter', async () => {
      const response = await request(app.getHttpServer())
        .get('/cmvr?quarter=Q5')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });
});

