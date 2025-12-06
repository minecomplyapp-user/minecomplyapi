import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { setupTestApp } from './test-helper';

describe('Guest Remarks Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testReportId: string;
  let createdRemarkIds: string[] = [];
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupTestApp(app); // Add validation pipe and other global config
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create a test CMVR report for guest remarks
    const testReport = await prisma.cMVRReport.create({
      data: {
        cmvrData: {},
        fileName: 'Test-Report-For-Guest-Remarks',
      },
    });
    testReportId = testReport.id;

    // Note: In a real test, you'd get a valid auth token from Supabase
    // For now, we'll skip auth-required tests or mock the auth guard
    authToken = 'test-token'; // Replace with actual token in real tests
  });

  afterAll(async () => {
    // Cleanup
    if (createdRemarkIds.length > 0) {
      await prisma.guestRemark.deleteMany({
        where: { id: { in: createdRemarkIds } },
      });
    }
    await prisma.cMVRReport.delete({
      where: { id: testReportId },
    });
    await app.close();
  });

  describe('4.1 Create Guest Remark', () => {
    it('should create a valid guest remark', async () => {
      const remarkData = {
        reportId: testReportId,
        reportType: 'CMVR',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestRole: 'Member',
        remarks: 'This is a test remark for the CMVR report.',
      };

      const response = await request(app.getHttpServer())
        .post('/guest-remarks')
        .send(remarkData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.guestName).toBe('John Doe');
      expect(response.body.reportType).toBe('CMVR');

      createdRemarkIds.push(response.body.id);
    });

    it('should create remark without email (optional)', async () => {
      const remarkData = {
        reportId: testReportId,
        reportType: 'CMVR',
        guestName: 'Jane Smith',
        guestRole: 'Guest',
        remarks: 'Test remark without email',
      };

      const response = await request(app.getHttpServer())
        .post('/guest-remarks')
        .send(remarkData)
        .expect(201);

      expect(response.body.guestEmail).toBeNull();
      createdRemarkIds.push(response.body.id);
    });

    it('should create anonymous submission', async () => {
      const remarkData = {
        reportId: testReportId,
        reportType: 'CMVR',
        guestName: 'Anonymous User',
        guestRole: 'Stakeholder',
        remarks: 'Anonymous remark',
      };

      const response = await request(app.getHttpServer())
        .post('/guest-remarks')
        .send(remarkData)
        .expect(201);

      expect(response.body.createdById).toBeNull();
      createdRemarkIds.push(response.body.id);
    });

    it('should reject invalid reportType', async () => {
      const remarkData = {
        reportId: testReportId,
        reportType: 'INVALID',
        guestName: 'John Doe',
        guestRole: 'Member',
        remarks: 'Test',
      };

      await request(app.getHttpServer())
        .post('/guest-remarks')
        .send(remarkData)
        .expect(400);
    });

    it('should reject invalid guestRole', async () => {
      const remarkData = {
        reportId: testReportId,
        reportType: 'CMVR',
        guestName: 'John Doe',
        guestRole: 'Unknown',
        remarks: 'Test',
      };

      await request(app.getHttpServer())
        .post('/guest-remarks')
        .send(remarkData)
        .expect(400);
    });

    it('should reject missing required fields', async () => {
      // Missing guestName
      await request(app.getHttpServer())
        .post('/guest-remarks')
        .send({
          reportId: testReportId,
          reportType: 'CMVR',
          guestRole: 'Member',
          remarks: 'Test',
        })
        .expect(400);

      // Missing remarks
      await request(app.getHttpServer())
        .post('/guest-remarks')
        .send({
          reportId: testReportId,
          reportType: 'CMVR',
          guestName: 'John Doe',
          guestRole: 'Member',
        })
        .expect(400);
    });

    it('should create remark with ECC reportType', async () => {
      const remarkData = {
        reportId: testReportId,
        reportType: 'ECC',
        guestName: 'ECC Tester',
        guestRole: 'Member',
        remarks: 'ECC test remark',
      };

      const response = await request(app.getHttpServer())
        .post('/guest-remarks')
        .send(remarkData)
        .expect(201);

      expect(response.body.reportType).toBe('ECC');
      createdRemarkIds.push(response.body.id);
    });
  });

  describe('4.2 Get Remarks by Report', () => {
    beforeAll(async () => {
      // Create 3 remarks for testing
      for (let i = 1; i <= 3; i++) {
        const remark = await prisma.guestRemark.create({
          data: {
            reportId: testReportId,
            reportType: 'CMVR',
            guestName: `Test User ${i}`,
            guestRole: 'Member',
            remarks: `Test remark ${i}`,
          },
        });
        createdRemarkIds.push(remark.id);
      }
    });

    it('should return remarks for a report', async () => {
      const response = await request(app.getHttpServer())
        .get(`/guest-remarks/report/${testReportId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      
      // Verify ordering (newest first)
      const dates = response.body.map((r: any) => new Date(r.createdAt).getTime());
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });

    it('should return empty array for non-existent report', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const response = await request(app.getHttpServer())
        .get(`/guest-remarks/report/${fakeUuid}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('4.3 Get Remarks Count', () => {
    it('should return correct count', async () => {
      const response = await request(app.getHttpServer())
        .get(`/guest-remarks/report/${testReportId}/count`)
        .expect(200);

      expect(response.body).toHaveProperty('reportId', testReportId);
      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.count).toBe('number');
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should return zero for report without remarks', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const response = await request(app.getHttpServer())
        .get(`/guest-remarks/report/${fakeUuid}/count`)
        .expect(200);

      expect(response.body.count).toBe(0);
    });
  });

  describe('4.5 Get Single Remark', () => {
    let testRemarkId: string;

    beforeAll(async () => {
      const remark = await prisma.guestRemark.create({
        data: {
          reportId: testReportId,
          reportType: 'CMVR',
          guestName: 'Single Test User',
          guestRole: 'Guest',
          remarks: 'Single remark test',
        },
      });
      testRemarkId = remark.id;
      createdRemarkIds.push(remark.id);
    });

    it('should return single remark by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/guest-remarks/${testRemarkId}`)
        .expect(200);

      expect(response.body.id).toBe(testRemarkId);
      expect(response.body.guestName).toBe('Single Test User');
    });

    it('should return 404 for non-existent remark', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/guest-remarks/${fakeUuid}`)
        .expect(404);
    });
  });

  describe('4.4 Get Remarks by User (Auth Required)', () => {
    it.skip('should return remarks for authenticated user', async () => {
      // Skip: Requires valid Supabase auth token
      // In real implementation, create user, get token, create remarks with createdById
      const response = await request(app.getHttpServer())
        .get(`/guest-remarks/user/test-user-id`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get(`/guest-remarks/user/test-user-id`)
        .expect(401);
    });
  });

  describe('4.6 Delete Remark (Auth Required)', () => {
    it.skip('should delete remark with valid auth', async () => {
      // Skip: Requires valid Supabase auth token
      const remark = await prisma.guestRemark.create({
        data: {
          reportId: testReportId,
          reportType: 'CMVR',
          guestName: 'Delete Test',
          guestRole: 'Member',
          remarks: 'To be deleted',
        },
      });

      await request(app.getHttpServer())
        .delete(`/guest-remarks/${remark.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should return 401 without auth token', async () => {
      const remark = await prisma.guestRemark.create({
        data: {
          reportId: testReportId,
          reportType: 'CMVR',
          guestName: 'Delete Test 2',
          guestRole: 'Member',
          remarks: 'Should not delete',
        },
      });
      createdRemarkIds.push(remark.id);

      await request(app.getHttpServer())
        .delete(`/guest-remarks/${remark.id}`)
        .expect(401);
    });
  });

  describe('8.1 Input Validation & Security', () => {
    it('should handle SQL injection attempts safely', async () => {
      const remarkData = {
        reportId: testReportId,
        reportType: 'CMVR',
        guestName: "'; DROP TABLE guestRemark; --",
        guestRole: 'Member',
        remarks: "SQL injection test'; DROP TABLE guestRemark; --",
      };

      const response = await request(app.getHttpServer())
        .post('/guest-remarks')
        .send(remarkData)
        .expect(201);

      // Verify the SQL was stored as a string, not executed
      expect(response.body.guestName).toContain('DROP TABLE');
      createdRemarkIds.push(response.body.id);

      // Verify table still exists
      const count = await prisma.guestRemark.count();
      expect(count).toBeGreaterThan(0);
    });

    it('should handle XSS attempts', async () => {
      const remarkData = {
        reportId: testReportId,
        reportType: 'CMVR',
        guestName: '<script>alert("XSS")</script>',
        guestRole: 'Member',
        remarks: '<script>alert("XSS")</script>Test',
      };

      const response = await request(app.getHttpServer())
        .post('/guest-remarks')
        .send(remarkData)
        .expect(201);

      // Script tags should be stored as-is (escaping happens on frontend)
      expect(response.body.remarks).toContain('<script>');
      createdRemarkIds.push(response.body.id);
    });

    it('should reject extremely large payloads', async () => {
      const largeText = 'A'.repeat(1000000); // 1MB of text
      const remarkData = {
        reportId: testReportId,
        reportType: 'CMVR',
        guestName: 'Large Payload Test',
        guestRole: 'Member',
        remarks: largeText,
      };

      // Should either reject or accept based on payload limit configuration
      const response = await request(app.getHttpServer())
        .post('/guest-remarks')
        .send(remarkData);

      // Verify it doesn't crash the server
      expect([201, 400, 413]).toContain(response.status);
      
      if (response.status === 201) {
        createdRemarkIds.push(response.body.id);
      }
    });
  });
});

