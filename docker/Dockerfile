FROM oven/bun:1.1.38

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy application files
COPY . .

# Create logs directory
RUN mkdir -p logs

# Set environment variable to force single .env file usage
ENV NODE_ENV=production

# Run database migrations, add product, and start the application
CMD ["sh", "-c", "bun run scripts/setup-db.ts && bun run scripts/add-product.ts && bun run src/server.ts"]