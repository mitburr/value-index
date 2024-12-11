# Value Index - Microservice Architecture

A price tracking and analysis system built with TypeScript and microservices.

## Architecture Overview

The system is composed of independent microservices:

- **Price Monitor**: Tracks product price changes
- **Retailer Integration**: Manages connections to retail platforms
- **Value Analysis**: Analyzes price trends and value metrics
- **User Preferences**: Manages user settings and tracking preferences
- **Notification**: Handles user alerts
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
    ├── value-analysis/
    │   ├── interfaces/
    │   └── analyzers/
    ├── user-preferences/
    │   ├── interfaces/
    │   └── repositories/
    ├── notification/
    │   ├── interfaces/
    │   └── providers/
    └── shared/
        ├── config/
        ├── utils/
        └── db/
```

## Setup & Configuration

1. Environment Setup:
```bash
cp .env.example .env
# Edit .env with your settings
```

2. Install Dependencies:
```bash
bun install
```

3. Database Setup:
```bash
./scripts/db-setup.sh
```

## Development

Each service can be developed and tested independently:

```bash
# Run all tests
bun test

# Test specific service
bun test src/services/retailer-integration/tests
```

## Service Communication

Services communicate through well-defined interfaces and maintain their own:
- Database tables
- Business logic
- Tests
- Type definitions

## Contributing

When adding features:
1. Identify the appropriate service
2. Follow the service's interface definitions
3. Add tests in the service's test directory
4. Update shared components only when necessary