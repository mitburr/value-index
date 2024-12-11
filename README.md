# Value Index

Tracks product prices across multiple retailers to generate value indices and identify optimal purchase timing.

## Project Goals
- Monitor product prices across retailers
- Generate value indices for price comparison
- Identify price trends and optimal purchase times
- Support multiple retailer integrations

## Current Implementation
- Database schema for retailers, products, and price history
- Repository pattern for data access
- Type-safe TypeScript implementation
- Test coverage for core functionality
- Environment-based configuration system
- Logging system for application events

## Prerequisites
- PostgreSQL 14+
- Bun 1.1.38+
- Node.js 18+

## Setup
1. Clone repository:
```bash
git clone [repository-url]
cd value-index
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
Create a `.env` file in the project root with the following variables:
```bash
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=price_tracker
POSTGRES_TEST_DB=price_tracker_test

# Logging Configuration
LOG_LEVEL=debug
LOG_FILE=app.log
```

4. Set up databases:
```bash
chmod +x scripts/db-setup.sh
./scripts/db-setup.sh
```

## Configuration System
The project uses a centralized settings management system:
- Environment variables loaded from `.env` file
- Type-safe configuration via `src/config/settings.ts`
- Separate configurations for development and testing
- Validation of required environment variables

Access settings anywhere in the application:
```typescript
import { settings } from '../config/settings';

// Database settings
const dbConfig = settings.database;

// Logging settings
const logLevel = settings.logging.level;
```

## Development
Run tests:
```bash
bun test                # All tests
bun test src/tests/db.test.ts  # Specific test
```

## Project Structure
```
src/
├── config/            # Configuration management
│   └── settings.ts    # Central settings handler
├── db/                # Database operations
├── models/            # TypeScript interfaces
├── repositories/      # Data access layer
├── services/          # Business logic
├── utils/            # Helper functions
└── tests/            # Test suites
```

## Core Features

### Retailer Management
```typescript
const retailer = await retailerRepo.create({
  name: "Example Store",
  base_url: "http://example.com",
  rate_limit: 60
});
```

### Product Tracking
```typescript
const product = await productRepo.create({
  retailerId: retailer.id,
  externalId: "SKU123",
  name: "Example Product",
  category: "Electronics"
});
```

### Price History
```typescript
const priceEntry = await priceRepo.create({
  productId: product.id,
  price: 99.99,
  currency: "USD"
});

const history = await priceRepo.getPriceHistory(
  product.id,
  startDate,
  endDate
);
```

## Coming Soon
- Retailer-specific data fetching
- Scheduler for regular price checks
- Price analysis service
- CLI interface