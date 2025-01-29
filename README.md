# Value Index 

A price tracking and analysis system built with TypeScript and microservices.
Currently supports Best Buy product tracking with real-time price monitoring.

## Architecture Overview

The system consists of several integrated services:
- **CLI Service**: Interactive command-line interface for product search and management
- **Price Monitor**: Automated price tracking and history recording
- **Retailer Integration**: Best Buy API integration with rate limiting
- **Shared**: Common utilities, database migrations, and configurations


## Key Features
- Direct Best Buy product search by SKU
- Automated price tracking with configurable intervals
- Price history recording in PostgreSQL
- Interactive CLI for product search and management
- Rate-limited API requests with request queuing
- Type-safe database operations
- Comprehensive logging system
- Automated testing with mocked and live API calls

## Prerequisites
- PostgreSQL 14+
- Bun 1.1.38+
- Best Buy API key
- Docker and Docker compose (for containerized deployment)

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

3. Create `.env` file with required variables (HMU for the BBY Key):
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

# Best Buy API Configuration
BESTBUY_API_KEY=your_key
BESTBUY_BASE_URL=https://api.bestbuy.com/v1
```

4. Initialize database and create retailer:
```bash
bun run scripts/setup-db.ts
```

## Usage

### Starting the Price Tracking Server
```bash
bun run src/server.ts
```

### Using the CLI
```bash
bun run src/services/cli/index.ts

# Search for a product by SKU
search -p sku:6525421

# General product search
search -p "iPhone 15 Pro Max"
```

### Adding Products to Track
```bash
bun run scripts/add-products.ts
```

## Development

### Running Tests
```bash
# Run all tests
bun test

# Run specific test suites
bun test src/tests/services/price-monitor/price-polling.test.ts
bun test src/tests/services/retailer-integration/integration-tests/bestBuyService.test.ts
```

### Project Structure
The project follows a microservices architecture with clear separation of concerns:
- `/services/cli`: Command-line interface implementation
- `/services/price-monitor`: Price tracking and recording
- `/services/retailer-integration`: Retailer API integrations
- `/services/shared`: Common utilities and configurations
- `/scripts`: Database setup and product management
- `/tests`: Unit and integration tests

## Current Status
- ✅ Best Buy API integration
- ✅ Product price tracking
- ✅ CLI interface
- ✅ Price history recording
- 🚧 Price analysis tools (in development)
- 🚧 Additional retailer support (planned)

## How It Works: Adding a Product

Here's a detailed walkthrough of how the application tracks product prices:

1. **Adding a Product to Track**
   ```typescript
   // Using scripts/add-products.ts
   const product = await productRepo.create({
     sku: '6525421',  // Best Buy SKU
     retailerId: settings.retailers.bestbuy.retailerId,
     name: 'iPhone 15 Pro Max',
     validationRules: {
       exactNameMatch: 'iPhone 15 Pro Max',
       priceRange: { min: 900, max: 1500 }
     }
   });
   ```
   This creates records in both `products` and `tracked_products` tables.

2. **Price Tracking Flow**
   When the server starts (`src/server.ts`), the following happens:
   ```typescript
   // 1. Price polling service initializes
   const pollingService = new PricePollingService(
     productRepo,
     priceRepo,
     bestBuyService
   );

   // 2. Polling begins at configured interval
   await pollingService.start();
   ```

   For each poll:
   - Finds all tracked products for the retailer
   - Queries Best Buy API for current prices
   - Records prices in `price_history` table
   - Updates metrics for monitoring

3. **Data Model Relationships**
   ```
   retailers
     ↓
   products ← tracked_products
     ↓
   price_history
   ```
   - `retailers`: Stores API credentials and rate limits
   - `products`: Base product information
   - `tracked_products`: Products we're actively monitoring
   - `price_history`: Historical price data

## Contributing

### Using the Logger

The logger provides structured, consistent logging across the application:

```typescript
import { logger } from 'u/logger';

// Basic logging with emoji indicators
logger.info('Operation started');  // ℹ️ Operation started
logger.error('Failed to connect'); // ❌ Failed to connect
logger.success('Data saved');      // ✅ Data saved

// Section logging for process flows
logger.startSection('Price Update');  // 🚀 === Starting: Price Update ===
logger.endSection('Price Update');    // 🏁 === Completed: Price Update ===

// Debug logging with context
logger.debug(`Processing SKU: ${sku}`, 'database');

// Structured data logging
logger.list('Found products', products, 'info', 'database');

// Common logging patterns
logger.info(`Added request to queue. Length: ${length}`);
logger.error(`API error: ${error.message}`);
logger.success('Successfully recorded price', 'database');
```

Logger features:
- Emoji indicators for log types
- Timestamp prefixing
- Optional context prefixes
- Structured data formatting
- Color coding by level
- File and console output

Best practices:
1. Use appropriate log levels:
   - `debug`: Detailed flow information
   - `info`: Normal operations
   - `warn`: Handled issues
   - `error`: Failures and exceptions
   - `success`: Completed operations
2. Include relevant context
3. Structure data for readability
4. Use sections for process flows


## Development

### Running Tests
There are several test suites available. You can run them individually or together using the following commands:

```bash
# Run all tests
bun test

# Run tests with coverage report
bun run test:coverage

# Individual test files
bun run test:basic          # Basic functionality tests
bun run test:settings      # Settings and configuration tests
bun run test:retailer      # Core retailer functionality tests

# Database tests
bun run test:db            # All database tests
bun run test:db:core       # Core database functionality
bun run test:db:product    # Product-specific database tests

# Price Monitor tests
bun run test:price-monitor           # All price monitoring tests
bun run test:price-monitor:polling   # Price polling functionality
bun run test:price-monitor:tracked   # Tracked product repository tests

# Retailer Integration tests
bun run test:retailer-integration          # All retailer integration tests
bun run test:retailer-integration:unit     # Unit tests for retailer service
bun run test:retailer-integration:integration # Live API integration tests

# Group tests by type
bun run test:unit         # All unit tests
bun run test:integration  # All integration tests
```

### Test Organization
The test suite follows a structured organization:
```
/tests
├── basic.test.ts             # Basic functionality tests
├── db/                       # Database tests
│   ├── db.test.ts
│   └── product.test.ts
├── services/
│   ├── price-monitor/        # Price monitoring service tests
│   │   ├── price-polling.test.ts
│   │   └── tracked-product-repository.test.ts
│   └── retailer-integration/ # Retailer integration tests
│       ├── integration-tests/
│       │   └── bestBuyService.test.ts
│       └── unit-tests/
│           └── retailer.test.ts
├── settings/                 # Configuration tests
│   └── settings.test.ts
└── utils/                   # Test utilities
    ├── mockPool.ts
    └── testDb.ts
```

The tests are organized by domain and split between unit tests and integration tests where appropriate. Integration tests that interact with external APIs (like Best Buy) are kept separate from unit tests to maintain test isolation and reliability.
```

## Deployment
### Docker Deployment
The application can be deployed using Docker for consistent environments and easy management:

1. Ensure Docker and Docker Compose are installed:
```bash
# Arch Linux
sudo pacman -S docker docker-compose

# Enable and start Docker service
sudo systemctl enable docker
sudo systemctl start docker
```

2. Build and start containers:
```bash
# From project root
sudo docker compose -f docker/docker-compose.yml up -d --build
```

3. Check container status:
```bash
sudo docker compose -f docker/docker-compose.yml ps
```

4. View logs:
```bash
sudo docker compose -f docker/docker-compose.yml logs -f
```

### Automatic Startup
To configure the application to start automatically on system boot:

1. Create systemd service:
```bash
sudo nano /etc/systemd/system/value-index.service
```

2. Add service configuration:
```ini
[Unit]
Description=Value Index Price Tracker
After=docker.service network-online.target
Requires=docker.service
StartLimitIntervalSec=300
StartLimitBurst=5

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/value-index
ExecStart=/usr/bin/docker compose -f docker/docker-compose.yml up -d
ExecStop=/usr/bin/docker compose -f docker/docker-compose.yml down
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
```

3. Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable value-index
sudo systemctl start value-index
```

4. Check service status:
```bash
sudo systemctl status value-index
```

### Database Management
Connect to the database in the container:
```bash
# Connect to PostgreSQL
sudo docker compose -f docker/docker-compose.yml exec db psql -U your_username -d price_tracker

# Common commands inside psql:
\dt                    # List tables
\d table_name         # Describe table
SELECT * FROM retailers;   # Query retailers
SELECT * FROM tracked_products;  # Query tracked products
```