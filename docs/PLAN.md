# Testing Plan — Device Dashboard

**Project:** IT Assets Management — Device Dashboard  
**Version:** 1.0.0  
**Last Updated:** 16/02/2026  
**Tech Stack:** Next.js 16 + Supabase + React Query + shadcn/ui

---

## 📊 Testing Strategy Overview

This project implements a comprehensive testing strategy following the **Testing Pyramid** approach:

```
        /
       /  \        E2E (10-20%)
      /----\        Critical user workflows
     /      \       Integration (20-30%)
    /--------\      API endpoints, database operations
   /          \
  /------------\    Unit (50-70%)
                  React components, utilities
```

### Testing Philosophy

- **Behavior over Implementation**: Focus on what the app does, not how it does it
- **Test Independence**: Each test should be isolated and repeatable
- **Fast Feedback**: Unit tests run in <100ms, integration in <1s
- **Realistic Scenarios**: E2E tests reflect actual user workflows
- **Supabase Integration**: Mock external dependencies while testing database interactions

---

## 🧪 Unit Testing Plan

### Target Areas

#### 1. **React Components** (shadcn/ui + Custom)

- **Location**: `src/components/ui/`, `src/components/dashboard/`
- **Focus**: Component rendering, props handling, user interactions
- **Tools**: Vitest + React Testing Library
- **Coverage Goal**: 80% for complex components, 60% for simple ones

**Components to Test:**

- `DeviceList.tsx` - Table rendering, filtering, sorting
- `DeviceDetail.tsx` - Modal interactions, tab switching
- `ImportDevice.tsx` - File upload, Excel parsing
- UI components: `Button`, `Input`, `Dialog`, `Table`

#### 2. **Utility Functions** (`src/lib/`)

- **Location**: `src/lib/utils.ts`, `src/lib/time.ts`, `src/lib/deviceUtils.ts`
- **Focus**: Pure functions, data transformations
- **Tools**: Vitest
- **Coverage Goal**: 90%

**Key Utilities:**

- `export-utils.ts` - Excel export functionality
- `excel-import.ts` - Excel parsing and validation
- `deviceUtils.ts` - Device data processing
- `time.ts` - Date/time formatting

#### 3. **Custom Hooks** (`src/hooks/`)

- **Location**: `src/hooks/`, `src/hooks/queries/`, `src/hooks/mutations/`
- **Focus**: Hook behavior, state management
- **Tools**: Vitest + React Testing Library
- **Coverage Goal**: 85%

**Key Hooks:**

- `useDevicesQuery.ts` - Data fetching, caching
- `useDeviceMutations.ts` - CRUD operations
- `use-theme.ts` - Theme management
- `useEndUsersQuery.ts` - User data fetching

#### 4. **Store Functions** (`src/stores/`)

- **Location**: `src/stores/useUIStore.ts`, `src/stores/useAppearanceStore.ts`
- **Focus**: State management, persistence
- **Tools**: Vitest
- **Coverage Goal**: 80%

### Test Structure

```typescript
// Example unit test structure
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

describe('DeviceList Component', () => {
  describe('Rendering', () => {
    it('should display device table with correct columns', () => {
      // Arrange
      const devices = mockDeviceData()

      // Act
      render(<DeviceList devices={devices} />)

      // Assert
      expect(screen.getByText('Device Name')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should filter devices by status', () => {
      // Arrange
      const { getByRole } = render(<DeviceList devices={mockData} />)
      const statusFilter = getByRole('combobox', { name: 'Status' })

      // Act
      fireEvent.change(statusFilter, { target: { value: 'active' } })

      // Assert
      expect(screen.getAllByRole('row')).toHaveLength(expectedActiveCount)
    })
  })
})
```

---

## 🔌 Integration Testing Plan

### Target Areas

#### 1. **API Routes** (`src/app/api/`)

- **Location**: `src/app/api/auth/`, `src/app/api/devices/`, etc.
- **Focus**: HTTP endpoints, request/response handling
- **Tools**: Supertest + Vitest
- **Coverage Goal**: 90% for critical endpoints

**API Endpoints to Test:**

- `POST /api/auth/sign-in` - Authentication flow
- `GET /api/devices` - Device listing with filters
- `POST /api/devices` - Device creation
- `PUT /api/devices/[id]` - Device updates
- `POST /api/devices/import` - Excel import
- `GET /api/devices/export` - Excel export

#### 2. **Database Operations** (Supabase Integration)

- **Location**: `src/hooks/queries/`, `src/hooks/mutations/`, `src/app/actions/`
- **Focus**: Database queries, mutations, error handling
- **Tools**: Supertest + Test database
- **Coverage Goal**: 85%

**Database Operations:**

- Device CRUD operations
- User authentication and authorization
- Excel import/export workflows
- Activity log creation
- Real-time data synchronization

#### 3. **Server Actions** (`src/app/actions/`)

- **Location**: `src/app/actions/devices.ts`, `src/app/actions/auth.ts`
- **Focus**: Server-side logic, data validation
- **Tools**: Supertest + Vitest
- **Coverage Goal**: 80%

### Integration Test Structure

```typescript
// Example integration test structure
describe('Device API Integration', () => {
  describe('GET /api/devices', () => {
    it('should return paginated device list', async () => {
      // Arrange
      const response = await request(app).get('/api/devices').expect(200)

      // Assert
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body).toHaveProperty('pagination')
    })

    it('should filter devices by status', async () => {
      // Arrange
      const filter = { status: 'active' }

      // Act
      const response = await request(app).get('/api/devices').query(filter).expect(200)

      // Assert
      const devices = response.body.data
      expect(devices.every((device) => device.status === 'active')).toBe(true)
    })
  })

  describe('Device Creation', () => {
    it('should create new device with valid data', async () => {
      // Arrange
      const deviceData = validDeviceData()

      // Act
      const response = await request(app).post('/api/devices').send(deviceData).expect(201)

      // Assert
      expect(response.body).toHaveProperty('id')
      expect(response.body.name).toBe(deviceData.name)
    })
  })
})
```

---

## 🎯 E2E Testing Plan

### Target Workflows

#### 1. **Authentication Flow**

- **Test Cases**: Sign-in, Sign-up, Password validation, Session persistence
- **Tools**: Playwright
- **Coverage**: 100% of authentication paths

#### 2. **Device Management Workflow**

- **Test Cases**: Device creation, editing, deletion, bulk operations
- **Tools**: Playwright
- **Coverage**: Core device management functionality

#### 3. **Excel Import/Export Workflow**

- **Test Cases**: File upload, data validation, export generation
- **Tools**: Playwright + Test files
- **Coverage**: Complete import/export cycle

#### 4. **Theme Switching**

- **Test Cases**: Dark/light mode toggle, theme persistence
- **Tools**: Playwright
- **Coverage**: Theme functionality across all pages

#### 5. **Drag-and-Drop Functionality**

- **Test Cases**: Sheet reordering, device assignment drag
- **Tools**: Playwright
- **Coverage**: Core drag-and-drop interactions

### E2E Test Structure

```typescript
// Example E2E test structure
import { test, expect } from '@playwright/test'

test.describe('Device Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-in')
    await page.fill('[data-testid=email]', 'test@example.com')
    await page.fill('[data-testid=password]', 'password123')
    await page.click('[data-testid=sign-in-button]')
    await page.waitForURL('/dashboard')
  })

  test('should create new device and verify in list', async ({ page }) => {
    // Navigate to devices page
    await page.click('[data-testid=nav-devices]')
    await page.waitForURL('/devices')

    // Click create device button
    await page.click('[data-testid=create-device-button]')

    // Fill device form
    await page.fill('[data-testid=device-name]', 'Test Device')
    await page.fill('[data-testid=device-code]', 'TEST-001')
    await page.selectOption('[data-testid=device-type]', 'Laptop')
    await page.click('[data-testid=save-device-button]')

    // Verify device appears in list
    await expect(page.locator('[data-testid=device-row]').first()).toContainText('Test Device')
  })

  test('should import devices from Excel file', async ({ page }) => {
    // Navigate to import page
    await page.click('[data-testid=nav-devices]')
    await page.click('[data-testid=import-button]')

    // Upload Excel file
    const fileInput = page.locator('[data-testid=file-upload]')
    await fileInput.setInputFiles('tests/data/sample-devices.xlsx')

    // Confirm import
    await page.click('[data-testid=confirm-import-button]')
    await page.waitForTimeout(3000) // Wait for import to complete

    // Verify devices were imported
    const deviceRows = page.locator('[data-testid=device-row]')
    expect(await deviceRows.count()).toBeGreaterThan(0)
  })
})
```

---

## 🛠️ Test Environment Setup

### 1. **Development Environment**

#### Dependencies Installation

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test supertest @types/supertest
```

#### Test Configuration Files

**vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/test/**',
      ],
    },
  },
})
```

**playwright.config.ts**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

### 2. **Test Database Setup**

Create a separate test database for integration tests:

```bash
# Environment variables for testing
cp .env.example .env.test.local
# Update .env.test.local with test database credentials
```

**Test Database Schema** (`tests/e2e/test-db.sql`):

```sql
-- Create test database schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Test tables with sample data
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add test data
INSERT INTO profiles (email, full_name, role) VALUES
('test@example.com', 'Test User', 'user'),
('admin@example.com', 'Admin User', 'admin');
```

### 3. **Test Data Management**

Create test data factories for consistent test data:

**tests/factories/device.factory.ts**

```typescript
export const deviceFactory = (overrides: Partial<Device> = {}): Device => ({
  id: crypto.randomUUID(),
  user_id: crypto.randomUUID(),
  code: 'TEST-001',
  name: 'Test Device',
  type: 'Laptop',
  status: 'active',
  device_info: {},
  file_name: null,
  metadata: {},
  specs: {},
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
})
```

---

## 🧰 Testing Tools & Libraries

### Unit Testing

| Tool                      | Purpose           | Why Selected                              |
| ------------------------- | ----------------- | ----------------------------------------- |
| **Vitest**                | Unit test runner  | Fast, Vite-compatible, TypeScript support |
| **React Testing Library** | Component testing | Tests user behavior, not implementation   |
| **Jest DOM**              | DOM assertions    | Comprehensive DOM testing utilities       |
| **User Event**            | User interactions | Simulates real user events                |

### Integration Testing

| Tool          | Purpose         | Why Selected                  |
| ------------- | --------------- | ----------------------------- |
| **Supertest** | HTTP assertions | Full request/response testing |
| **MSW**       | API mocking     | Network request mocking       |

### E2E Testing

| Tool           | Purpose     | Why Selected                           |
| -------------- | ----------- | -------------------------------------- |
| **Playwright** | E2E testing | Cross-browser, auto-waits, screenshots |
| **Test Files** | Test data   | Real Excel files for import/export     |

### Code Quality

| Tool           | Purpose         | Why Selected                      |
| -------------- | --------------- | --------------------------------- |
| **ESLint**     | Linting         | Code consistency, error detection |
| **Prettier**   | Code formatting | Consistent code style             |
| **TypeScript** | Type checking   | Type safety, better IDE support   |

---

## 📊 Test Coverage Goals & Metrics

### Coverage Targets

| Category                | Target | Rationale                                |
| ----------------------- | ------ | ---------------------------------------- |
| **Critical Paths**      | 100%   | Authentication, core CRUD operations     |
| **Business Logic**      | 80%+   | Device management, Excel processing      |
| **Utilities**           | 90%+   | Pure functions, data transformations     |
| **Components**          | 70%+   | Complex UI components, user interactions |
| **API Endpoints**       | 90%+   | All public endpoints                     |
| **Database Operations** | 85%+   | Core database interactions               |

### Metrics Tracking

#### Coverage Reports

- **HTML Reports**: Detailed coverage breakdown
- **CI Integration**: Coverage thresholds in GitHub Actions
- **Branch Coverage**: Test conditional logic
- **Function Coverage**: Test all functions

#### Performance Metrics

- **Test Execution Time**: Unit <100ms, Integration <1s, E2E <5s
- **Test Stability**: <5% flaky tests
- **Test Maintenance**: <10% test code changes per sprint

#### Quality Metrics

- **Test Coverage Trend**: Week-over-week improvement
- **Bug Detection Rate**: Tests catching regressions
- **Test Documentation**: Tests as living documentation

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

**`.github/workflows/ci.yml`**

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm test
        env:
          CI: true

      - name: Coverage report
        run: npm run test:coverage

      - name: Build
        run: npm run build

      - name: Integration tests
        run: npm run test:integration
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: E2E tests
        run: npm run test:e2e
        env:
          CI: true
```

### Pre-commit Hooks

**`.husky/pre-commit`**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linting and type checking
npm run lint && npm run typecheck

# Run unit tests for changed files
npx vitest run --reporter=verbose
```

### Coverage Gates

**`package.json`**

```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage && npx coverage-checker"
  }
}
```

---

## 🛡️ Testing Best Practices for This Tech Stack

### 1. **Supabase Testing Strategy**

#### Mocking Supabase

```typescript
// tests/mocks/supabase.mock.ts
import { createMockClient, MockClient } from 'supabase-js/mock'

export const mockSupabase = createMockClient({
  profiles: {
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
    insert: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
  devices: {
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
})

// Usage in tests
import { mockSupabase } from './mocks/supabase.mock'

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
}))
```

#### Test Database Isolation

- Use separate test database for integration tests
- Clean database between test runs
- Use transactions with rollback for test isolation

### 2. **Excel Import/Export Testing**

#### Test Files Strategy

```typescript
// tests/data/sample-devices.xlsx
// tests/data/invalid-devices.xlsx
// tests/data/large-devices.xlsx
```

#### Testing Scenarios

- Valid Excel files with different formats
- Invalid data handling
- Large file performance
- Different sheet structures

### 3. **Drag-and-Drop Testing**

#### Testing Approach

```typescript
// tests/unit/DeviceList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { DragDropContext } from '@dnd-kit/core'

describe('Drag and Drop', () => {
  it('should reorder sheets correctly', () => {
    const { getByTestId } = render(
      <DragDropContext>
        <SheetTable sheets={mockSheets} />
      </DragDropContext>
    )

    const sheet1 = getByTestId('sheet-1')
    const sheet2 = getByTestId('sheet-2')

    // Simulate drag and drop
    fireEvent.dragStart(sheet1)
    fireEvent.dragOver(sheet2)
    fireEvent.drop(sheet2)

    // Verify order changed
    expect(getByTestId('sheet-1')).toHaveTextContent('Sheet 2')
    expect(getByTestId('sheet-2')).toHaveTextContent('Sheet 1')
  })
})
```

### 4. **Theme Testing**

#### Dark/Light Mode Testing

```typescript
// tests/unit/theme.test.ts
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'

describe('Theme Switching', () => {
  it('should apply dark theme correctly', () => {
    render(
      <ThemeProvider attribute="class">
        <div className="dark:bg-gray-900">Test</div>
      </ThemeProvider>
    )

    // Verify dark theme classes are applied
    expect(screen.getByText('Test')).toHaveClass('dark:bg-gray-900')
  })
})
```

### 5. **Real-time Data Testing**

#### Testing React Query

```typescript
// tests/unit/useDevicesQuery.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

describe('useDevicesQuery', () => {
  it('should fetch devices from Supabase', async () => {
    const queryClient = new QueryClient()

    const { result } = renderHook(() => useDevicesQuery(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
  })
})
```

---

## 📋 Test Documentation Standards

### Test File Organization

```
tests/
├── unit/
│   ├── components/
│   │   ├── DeviceList.test.tsx
│   │   └── DeviceDetail.test.tsx
│   ├── hooks/
│   │   ├── useDevicesQuery.test.ts
│   │   └── useDeviceMutations.test.ts
│   ├── lib/
│   │   ├── export-utils.test.ts
│   │   └── excel-import.test.ts
│   └── stores/
│       ├── useUIStore.test.ts
│       └── useAppearanceStore.test.ts
├── integration/
│   ├── api/
│   │   ├── devices.test.ts
│   │   └── auth.test.ts
│   └── database/
│       ├── device-queries.test.ts
│       └── user-operations.test.ts
└── e2e/
    ├── authentication.spec.ts
    ├── device-management.spec.ts
    └── excel-import-export.spec.ts
```

### Test Naming Conventions

```typescript
// Good
describe('DeviceList', () => {
  describe('Rendering', () => {
    it('should display device table with correct columns', () => {
      // Test implementation
    })
  })

  describe('Filtering', () => {
    it('should filter devices by status', () => {
      // Test implementation
    })
  })
})

// Avoid
describe('DeviceList', () => {
  it('works', () => {
    // Unclear what this tests
  })
})
```

### Test Documentation

Each test file should include:

1. **Purpose**: What functionality is being tested
2. **Dependencies**: External services or mocks required
3. **Test Scenarios**: Happy path and edge cases
4. **Expected Behavior**: What the test verifies

---

## 🔄 Test Maintenance Strategy

### Regular Test Reviews

- **Weekly**: Review test coverage and identify gaps
- **Monthly**: Refactor flaky tests and improve performance
- **Quarterly**: Audit test effectiveness and update strategies

### Test Debt Management

- **Technical Debt**: Address flaky tests immediately
- **Coverage Gaps**: Prioritize untested critical paths
- **Test Performance**: Optimize slow tests

### Knowledge Sharing

- **Documentation**: Maintain up-to-date testing guidelines
- **Code Reviews**: Test quality as part of PR reviews
- **Training**: Regular testing best practices sessions

---

## 📈 Success Metrics

### Quality Metrics

- **Test Coverage**: >80% overall, 100% critical paths
- **Test Stability**: <5% flaky tests
- **Bug Detection**: Tests catching >50% of regressions
- **Test Performance**: Unit <100ms, Integration <1s, E2E <5s

### Process Metrics

- **Test Execution Time**: <10 minutes for full suite
- **Test Maintenance**: <10% test code changes per sprint
- **Team Adoption**: 100% of developers writing tests
- **CI/CD Integration**: Tests running on every PR

---

## 🎯 Next Steps

### Phase 1: Foundation (Week 1-2)

1. Set up testing infrastructure
2. Create test database and environment
3. Write unit tests for core utilities
4. Set up CI/CD pipeline

### Phase 2: Component Testing (Week 3-4)

1. Write unit tests for React components
2. Test custom hooks and stores
3. Achieve 70% component coverage

### Phase 3: Integration Testing (Week 5-6)

1. Write integration tests for API endpoints
2. Test database operations
3. Test Excel import/export workflows

### Phase 4: E2E Testing (Week 7-8)

1. Write E2E tests for critical user workflows
2. Test authentication and device management
3. Achieve 100% critical path coverage

### Phase 5: Optimization (Week 9-10)

1. Optimize test performance
2. Improve test documentation
3. Establish maintenance processes

---

**Prepared by:** Test Engineering Team  
**Status:** Ready for Implementation  
**Review Date:** 16/02/2026  
**Next Review:** 16/03/2026
