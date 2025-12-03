# MineComply API - Development Guide

> Last Updated: December 2025

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Running the API](#running-the-api)
- [Development Workflow](#development-workflow)
- [Adding New Features](#adding-new-features)
- [PDF/DOCX Generation](#pdfdocx-generation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Code Style and Standards](#code-style-and-standards)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Git**: Latest version
- **Supabase Account**: For database and authentication
- **Code Editor**: VS Code recommended with extensions:
  - ESLint
  - Prettier
  - Prisma

### Initial Setup

1. **Clone the Repository**

```bash
git clone <repository-url>
cd minecomplyapi
```

2. **Install Dependencies**

```bash
npm install
```

3. **Set Up Environment Variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Setup](#environment-setup))

4. **Generate Prisma Client**

```bash
npm run prisma:generate
```

5. **Run Migrations**

```bash
npm run prisma:migrate
```

6. **Apply RLS Policies** (if needed)

```bash
npx prisma db execute --file prisma/policies/enable_rls.sql --schema prisma/schema.prisma
```

7. **Start the Development Server**

```bash
npm run start:dev
```

The API should now be running at `http://localhost:3000`

---

## Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Application
NODE_ENV=development
PORT=3000
GLOBAL_PREFIX=api
CORS_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081

# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Supabase Authentication
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWKS_URL=https://your-project.supabase.co/rest/v1/

# Supabase Storage
SUPABASE_STORAGE_BUCKET=minecomplyapp-bucket
SUPABASE_STORAGE_UPLOADS_PATH=uploads/
```

### Getting Supabase Credentials

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and keys

2. **Get Database URL**:
   - In Supabase Dashboard → Settings → Database
   - Copy the Connection String (URI format)
   - Replace `[YOUR-PASSWORD]` with your database password

3. **Get API Keys**:
   - In Supabase Dashboard → Settings → API
   - Copy `anon` key (public key)
   - Copy `service_role` key (secret key - never expose to clients!)

4. **JWKS URL**:
   - Format: `https://YOUR_PROJECT_REF.supabase.co/rest/v1/`
   - Replace `YOUR_PROJECT_REF` with your project reference ID

### Supabase Storage Setup

1. **Create Storage Bucket**:

```sql
-- In Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('minecomplyapp-bucket', 'minecomplyapp-bucket', false);
```

2. **Add Storage Policies**:

```sql
-- Allow service role to insert files
CREATE POLICY "Service role can insert"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'service_role'
  AND bucket_id = 'minecomplyapp-bucket'
);

-- Allow service role to select files
CREATE POLICY "Service role can select"
ON storage.objects FOR SELECT
USING (
  auth.role() = 'service_role'
  AND bucket_id = 'minecomplyapp-bucket'
);

-- Allow service role to delete files
CREATE POLICY "Service role can delete"
ON storage.objects FOR DELETE
USING (
  auth.role() = 'service_role'
  AND bucket_id = 'minecomplyapp-bucket'
);
```

### CORS Configuration

Update `CORS_ORIGINS` with your mobile app's Metro bundler addresses:

- Local development: `http://localhost:8081`
- LAN testing: `exp://192.168.1.x:8081` (your LAN IP)
- Multiple origins: Comma-separated list

---

## Running the API

### Development Mode

Start the server with hot-reload:

```bash
npm run start:dev
```

The API will automatically restart when you make changes to the code.

### Production Mode

Build and run in production mode:

```bash
# Build the project
npm run build

# Start production server
npm run start:prod
```

### Debug Mode

Start with Node.js debugger:

```bash
npm run start:debug
```

Then attach your debugger on port `9229`.

### View Swagger Documentation

Once the server is running, visit:

```
http://localhost:3000/api/docs
```

### Test Database Connection

```bash
# Open Prisma Studio
npm run prisma:studio
```

This opens a visual database editor at `http://localhost:5555`

---

## Development Workflow

### Daily Development Cycle

1. **Pull Latest Changes**

```bash
git pull origin main
```

2. **Install New Dependencies** (if package.json changed)

```bash
npm install
```

3. **Run Migrations** (if schema changed)

```bash
npm run prisma:migrate
```

4. **Start Development Server**

```bash
npm run start:dev
```

5. **Make Changes and Test**

6. **Run Linter**

```bash
npm run lint
```

7. **Format Code**

```bash
npm run format
```

8. **Commit Changes**

```bash
git add .
git commit -m "Description of changes"
git push origin your-branch
```

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/<name>` - New features
- `bugfix/<name>` - Bug fixes
- `hotfix/<name>` - Critical production fixes

### Commit Message Format

Follow conventional commits:

```
feat: Add CMVR duplicate endpoint
fix: Correct validation error in ECC DTO
docs: Update API reference for storage endpoints
refactor: Extract PDF generation helpers
test: Add unit tests for attendance service
```

---

## Adding New Features

### Creating a New Module

1. **Generate Module Scaffold**

```bash
nest generate module <module-name>
nest generate controller <module-name>
nest generate service <module-name>
```

2. **Create DTOs**

```bash
mkdir src/<module-name>/dto
touch src/<module-name>/dto/create-<entity>.dto.ts
touch src/<module-name>/dto/update-<entity>.dto.ts
```

Example DTO:

```typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEntityDto {
  @ApiProperty({ description: 'Entity name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Entity description' })
  @IsString()
  @IsOptional()
  description?: string;
}
```

3. **Update Prisma Schema**

Edit `prisma/schema.prisma`:

```prisma
model Entity {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

4. **Create Migration**

```bash
npm run prisma:migrate -- --name add_entity_table
```

5. **Implement Service Logic**

```typescript
@Injectable()
export class EntityService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateEntityDto) {
    return this.prisma.entity.create({
      data: createDto,
    });
  }

  async findAll() {
    return this.prisma.entity.findMany();
  }

  async findOne(id: string) {
    const entity = await this.prisma.entity.findUnique({
      where: { id },
    });
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }
}
```

6. **Create Controller Endpoints**

```typescript
@Controller('entities')
@ApiTags('Entities')
export class EntityController {
  constructor(private readonly service: EntityService) {}

  @Post()
  @ApiOperation({ summary: 'Create new entity' })
  @ApiResponse({ status: 201, description: 'Entity created' })
  create(@Body() createDto: CreateEntityDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all entities' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }
}
```

7. **Import Module**

Add your module to `app.module.ts`:

```typescript
@Module({
  imports: [
    // ... existing imports
    EntityModule,
  ],
})
export class AppModule {}
```

### Adding Authentication to Routes

By default, all routes are protected. To make a route public:

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Get('public-endpoint')
publicEndpoint() {
  return { message: 'This is public' };
}
```

To access the current user:

```typescript
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';

@Get('me')
getCurrentUser(@CurrentUser() user: SupabaseUser) {
  return user;
}
```

---

## PDF/DOCX Generation

### Adding a New PDF Generator

1. **Create Generator Service**

```bash
touch src/<module>/pdf-generator.service.ts
```

2. **Implement PDF Logic**

```typescript
import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class EntityPdfGeneratorService {
  async generate(entityData: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 50,
      });

      const buffers: Buffer[] = [];
      
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Add content
      doc.fontSize(20).text(entityData.title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(entityData.description);

      // Add table
      this.addTable(doc, entityData.items);

      doc.end();
    });
  }

  private addTable(doc: PDFKit.PDFDocument, items: any[]) {
    // Table rendering logic
    const tableTop = doc.y;
    const colWidth = 150;
    
    items.forEach((item, index) => {
      const y = tableTop + (index * 20);
      doc.text(item.name, 50, y, { width: colWidth });
      doc.text(item.value, 50 + colWidth, y, { width: colWidth });
    });
  }
}
```

3. **Register in Module**

```typescript
@Module({
  providers: [EntityService, EntityPdfGeneratorService],
  controllers: [EntityController],
})
export class EntityModule {}
```

4. **Add Controller Endpoint**

```typescript
@Get(':id/pdf')
@Header('Content-Type', 'application/pdf')
async generatePdf(
  @Param('id') id: string,
  @Res() res: Response,
) {
  const entity = await this.service.findOne(id);
  const pdfBuffer = await this.pdfGenerator.generate(entity);
  
  res.set({
    'Content-Disposition': `attachment; filename="entity-${id}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });
  
  res.end(pdfBuffer);
}
```

### Adding a New DOCX Generator

Similar process using the `docx` library:

```typescript
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from 'docx';

@Injectable()
export class EntityDocxGeneratorService {
  async generate(entityData: any): Promise<Buffer> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: entityData.title,
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({ text: entityData.description }),
            this.createTable(entityData.items),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  private createTable(items: any[]): Table {
    return new Table({
      rows: items.map(
        (item) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(item.name)] }),
              new TableCell({ children: [new Paragraph(item.value)] }),
            ],
          }),
      ),
    });
  }
}
```

---

## Testing

### Unit Tests

Run unit tests:

```bash
npm run test
```

Run with coverage:

```bash
npm run test:cov
```

Run in watch mode:

```bash
npm run test:watch
```

### Writing Unit Tests

Example service test:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { EntityService } from './entity.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EntityService', () => {
  let service: EntityService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntityService,
        {
          provide: PrismaService,
          useValue: {
            entity: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EntityService>(EntityService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an entity', async () => {
      const createDto = { name: 'Test', description: 'Test description' };
      const expected = { id: '1', ...createDto };
      
      jest.spyOn(prisma.entity, 'create').mockResolvedValue(expected);
      
      const result = await service.create(createDto);
      
      expect(result).toEqual(expected);
      expect(prisma.entity.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });
});
```

### E2E Tests

Run E2E tests:

```bash
npm run test:e2e
```

Example E2E test:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('EntityController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/entities (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/entities')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
```

---

## Deployment

### Render.com Deployment

1. **Create Web Service**:
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect your Git repository

2. **Configure Service**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Environment**: Node

3. **Add Environment Variables**:
   - Add all variables from `.env` to Render dashboard
   - Use **Secret File** for sensitive configs if needed

4. **Deploy**:
   - Click "Create Web Service"
   - Render will auto-deploy on every push to main

### Manual Deployment

1. **Build the Application**:

```bash
npm run build
```

2. **Run Database Migrations**:

```bash
npx prisma migrate deploy
```

3. **Start Production Server**:

```bash
npm run start:prod
```

### Health Check Configuration

Render uses health checks to ensure your service is running:

- **Path**: `/health/live`
- **Expected Status**: 200

### Environment-Specific Configs

Use `NODE_ENV` to switch configurations:

```typescript
if (process.env.NODE_ENV === 'production') {
  // Production-only code
}
```

---

## Troubleshooting

### Common Issues

**1. Prisma Client Out of Sync**

```bash
npm run prisma:generate
```

**2. Migration Errors**

```bash
# Reset database (development only!)
npx prisma migrate reset

# Mark migration as resolved
npx prisma migrate resolve --rolled-back <migration_name>
```

**3. Port Already in Use**

```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

**4. CORS Errors**

Update `CORS_ORIGINS` in `.env`:

```bash
CORS_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081
```

**5. Supabase Connection Issues**

Verify credentials:
- Check `DATABASE_URL` is correct
- Ensure Supabase project is running
- Verify firewall isn't blocking connections

**6. JWT Validation Failures**

- Ensure `SUPABASE_JWKS_URL` is correct
- Check token expiry (tokens expire after 1 hour)
- Verify `SUPABASE_URL` matches token issuer

### Debug Mode

Enable detailed logging:

```typescript
// In main.ts
app.useLogger(['error', 'warn', 'log', 'debug', 'verbose']);
```

### Database Query Logging

```typescript
// In prisma.service.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

## Code Style and Standards

### ESLint Configuration

ESLint is configured in `eslint.config.mjs`. Run linter:

```bash
npm run lint
```

Auto-fix issues:

```bash
npm run lint -- --fix
```

### Prettier Configuration

Prettier is configured in `prettier.config.cjs`. Format code:

```bash
npm run format
```

### TypeScript Best Practices

1. **Use strict mode**: Enabled in `tsconfig.json`
2. **Avoid `any`**: Use proper types or `unknown`
3. **Use interfaces for DTOs**: Prefer interfaces over classes for data shapes
4. **Enable strict null checks**: Catch potential null/undefined errors

### NestJS Best Practices

1. **Use dependency injection**: Never instantiate services manually
2. **Use DTOs for validation**: Always validate input with class-validator
3. **Use pipes for transformation**: Parse UUIDs, numbers, etc.
4. **Handle exceptions properly**: Use NestJS exception filters
5. **Document with Swagger**: Use `@ApiProperty` decorators

### Code Organization

```
src/
├── <module>/
│   ├── <module>.module.ts       # Module definition
│   ├── <module>.controller.ts   # HTTP endpoints
│   ├── <module>.service.ts      # Business logic
│   ├── dto/                      # Data transfer objects
│   │   ├── create-<entity>.dto.ts
│   │   └── update-<entity>.dto.ts
│   └── <module>-generator.service.ts  # Document generators
```

### Git Ignore Patterns

Ensure the following are in `.gitignore`:

```
.env
.env.local
node_modules/
dist/
coverage/
*.log
.DS_Store
```

---

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [PDFKit Documentation](https://pdfkit.org)
- [docx Library](https://docx.js.org)

---

## Getting Help

- Review the [Architecture Documentation](ARCHITECTURE.md)
- Check the [API Reference](API_REFERENCE.md)
- Review the [Database Documentation](DATABASE.md)
- Contact the development team

