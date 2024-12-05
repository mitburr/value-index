# Bun TypeScript Project Template

A modern, high-performance TypeScript project template built with Bun. This template provides a robust foundation for building server-side applications, taking advantage of Bun's superior performance characteristics and native TypeScript support.

## Core Features

### Development Environment

The template comes preconfigured with a complete development environment that includes:

- **Native TypeScript Support**: Leverages Bun's built-in TypeScript compiler, eliminating the need for additional compilation steps or build tools
- **Hot Reloading**: Automatic server restart on file changes using Bun's native watch mode
- **Type Safety**: Strict TypeScript configuration ensuring type safety across your entire application
- **VS Code Integration**: Properly configured TypeScript settings for optimal Visual Studio Code development experience
- **Modern JavaScript Features**: Access to the latest ECMAScript features through Bun's modern JavaScript runtime

### Project Structure

The template implements a scalable project structure:

```
my-typescript-project/
├── src/
│   ├── index.ts           # Application entry point
│   ├── types/             # Type definitions
│   │   └── index.ts       # Shared types and interfaces
│   ├── utils/             # Utility functions
│   │   └── logger.ts      # Logging utility
│   └── tests/             # Test files
│       └── basic.test.ts  # Example test
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project configuration
└── .gitignore            # Git ignore rules
```

### Built-in Features

#### High-Performance Server
- Native HTTP server implementation using Bun's server API
- Extremely low latency request handling
- Automatic handling of async operations

#### Logging System
- Structured logging with timestamp and log levels
- Asynchronous file writing using Bun's optimized filesystem API
- Support for different log levels (info, error, debug)

#### Testing Framework
- Built-in test runner using Bun's native testing capabilities
- Support for modern testing patterns
- Async test support
- Fast test execution

#### Type System
- Comprehensive type definitions for Bun's API
- Strict type checking enabled by default
- Interface-first development approach
- Type inference optimization

## Getting Started

### Prerequisites

Ensure you have Bun installed on your system. If not, install it using:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Installation

1. Create a new project using this template:
```bash
bun create typescript my-project-name
cd my-project-name
```

2. Install dependencies:
```bash
bun install
```

### Running the Project

The template includes several predefined scripts in `package.json`:

- **Development Mode**: Run the server with hot reloading
```bash
bun run dev
```

- **Production Mode**: Run the server in production mode
```bash
bun run start
```

- **Run Tests**: Execute the test suite
```bash
bun test
```

- **Clean**: Remove build artifacts
```bash
bun run clean
```

## Next Steps for Development

Here are some recommended next steps to enhance your server:

1. **Add Environment Configuration**
   - Create a `.env` file for environment variables
   - Implement environment-specific configurations
   - Use Bun.env for efficient environment variable access

2. **Implement Routing**
   - Create a `routes` directory
   - Implement route handlers
   - Add middleware support
   Example structure:
   ```typescript
   // src/routes/index.ts
   export async function handleRequest(req: Request): Promise<Response> {
     const url = new URL(req.url);
     switch(url.pathname) {
       case '/api/users':
         return handleUsers(req);
       default:
         return new Response('Not Found', { status: 404 });
     }
   }
   ```

3. **Add Database Integration**
   - Leverage Bun's built-in SQLite support
   - Implement database models
   - Create a connection pool
   Example:
   ```typescript
   // src/db/index.ts
   import { Database } from 'bun:sqlite';
   
   export const db = new Database('app.db');
   ```

4. **Implement Error Handling**
   - Create a centralized error handling system
   - Add error logging
   - Implement custom error types
   ```typescript
   // src/utils/errors.ts
   export class AppError extends Error {
     constructor(
       message: string,
       public status: number = 500,
       public code?: string
     ) {
       super(message);
     }
   }
   ```

5. **Add Security Features**
   - Implement request validation
   - Add rate limiting
   - Set up CORS configuration
   - Add authentication middleware

6. **Enhance Testing**
   - Add integration tests
   - Implement test factories
   - Add API endpoint tests
   - Set up test coverage reporting

7. **Performance Optimization**
   - Implement request caching
   - Add compression middleware
   - Optimize database queries
   - Add performance monitoring

8. **API Documentation**
   - Add OpenAPI/Swagger documentation
   - Implement API versioning
   - Create endpoint documentation
   - Add response examples

## Performance Considerations

This template is built with performance in mind:

- Uses Bun's native APIs for optimal performance
- Minimizes dependencies to reduce overhead
- Leverages async operations where beneficial
- Uses efficient file system operations
- Takes advantage of Bun's built-in optimizations

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For more information about Bun, visit the [official Bun documentation](https://bun.sh/docs).