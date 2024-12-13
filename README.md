# Value Index - Microservice Architecture

A price tracking and analysis system built with TypeScript and microservices.

## Architecture Overview

The system is composed of independent microservices:
- **Price Monitor**: Tracks product price changes
- **Retailer Integration**: Manages connections to retail platforms
- **Value Analysis**: Analyzes price trends and value metrics
- **Shared**: Common utilities and configurations

## Project Structure
```
src/
├── services/
    ├── price-monitor/
    │   ├── interfaces/
    │   └── repositories/
    ├── retailer-integration/
    │   ├── interfaces/
    │   ├── implementations/
    │   ├── repositories/
    │   └── tests/
    ├── shared/
    │   ├── config/
    │   │   └── settings.ts      # Centralized settings management
    │   ├── types/
    │   │   └── errors.ts        # Custom error types
    │   ├── utils/
    │   │   ├── logger.ts        # Logging utility
    │   │   ├── search.ts        # File/directory search utility
    │   │   └── verify-env.ts    # Environment verification
    │   └── db/
    │       └── migrations/      # Database migrations
```

## Key Features
- Environment-based configuration with `.env` file support
- Smart file and directory search functionality
- Comprehensive logging system
- Type-safe database operations
- Automated testing infrastructure

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

3. Create `.env` file with required variables:
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

# Retailer API Keys
AMAZON_API_KEY=your_key
AMAZON_BASE_URL=api_url
AMAZON_RATE_LIMIT=60

WALMART_API_KEY=your_key
WALMART_BASE_URL=api_url
WALMART_RATE_LIMIT=60
```

4. Set up database:
```bash
chmod +x scripts/db-setup.sh
./scripts/db-setup.sh
```

## Development

### Running Tests
```bash
bun test                # All tests
bun test src/services/retailer-integration/tests  # Specific service tests
```

### Utility Features

#### Search Service
The search utility provides file and directory search functionality:
```typescript
import { search } from 'u/file-name-search';

// Find a specific file
const envPath = await search.findFile('.env');

// Find all files in a directory
const migrations = await search.findDirectoryFiles('migrations');
```

#### Environment Verification
```typescript
import { verifyEnv } from '../utils/verify-env';

// Verifies all required environment variables are present
verifyEnv();
```

#### Logging
```typescript
import { logger } from 'u/logger';

logger.info('Operation successful');
logger.error('Operation failed');
logger.startSection('Starting process');
logger.endSection('Process complete');
```

## Testing
The project includes comprehensive test coverage:
- Database connection and operations
- Repository CRUD operations
- Configuration validation
- Error handling

Tests use a separate test database and clean up after themselves.

## Contributing
1. Follow the established directory structure
2. Add tests for new functionality
3. Use the provided utilities for consistency
4. Update appropriate interfaces and types
5. Ensure all tests pass before submitting changes