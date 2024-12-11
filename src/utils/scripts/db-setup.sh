#!/bin/bash

# Load environment variables from .env
export "$(cat .env | grep -v '^#' | xargs)"

# Set PostgreSQL password from env
export PGPASSWORD=$POSTGRES_PASSWORD

# Path to psql (adjust based on your installation)
PSQL="/opt/homebrew/bin/psql"

# Create databases (using env variables)
$PSQL -U "$POSTGRES_USER" -c "DROP DATABASE IF EXISTS $POSTGRES_DB"
$PSQL -U $POSTGRES_USER -c "DROP DATABASE IF EXISTS $POSTGRES_TEST_DB"
$PSQL -U $POSTGRES_USER -c "CREATE DATABASE $POSTGRES_DB"
$PSQL -U $POSTGRES_USER -c "CREATE DATABASE $POSTGRES_TEST_DB"

# Run migrations on both databases
$PSQL -U $POSTGRES_USER -d $POSTGRES_DB -f src/db/migrations/001_initial_schema.sql
$PSQL -U $POSTGRES_USER -d $POSTGRES_TEST_DB -f src/db/migrations/001_initial_schema.sql