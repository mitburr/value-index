#!/bin/bash

# Function to safely create a directory
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo "Created directory: $1"
    else
        echo "Directory already exists: $1"
    fi
}

# Function to safely create a file
create_file() {
    if [ ! -f "$1" ]; then
        touch "$1"
        echo "Created file: $1"
    else
        echo "File already exists: $1"
    fi
}

# Create the new directory structure alongside existing files
directories=(
    "src/db/migrations"
    "src/db/repositories"
    "src/models"
    "src/retailers"
    "src/services"
    "src/cli/commands"
    "src/cli/prompts"
    "src/config"
)

# Safely create all directories
for dir in "${directories[@]}"; do
    create_dir "$dir"
done

# Safely create all necessary files
files=(
    "src/db/index.ts"
    "src/db/repositories/products.ts"
    "src/db/repositories/prices.ts"
    "src/models/product.ts"
    "src/models/price.ts"
    "src/models/retailer.ts"
    "src/retailers/amazonRetailer.ts"
    "src/retailers/walmartRetailer.ts"
    "src/services/scheduler.ts"
    "src/services/priceAnalysis.ts"
    "src/services/cache.ts"
    "src/cli/index.ts"
    "src/config/index.ts"
    "src/config/default.ts"
)

# Safely create each file
for file in "${files[@]}"; do
    create_file "$file"
done

# Create or update .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOL
node_modules/
dist/
.env
*.log
.DS_Store
bun.lockb
EOL
    echo "Created .gitignore file"
else
    echo ".gitignore already exists"
fi

# Display the final structure, excluding node_modules
if command -v tree &> /dev/null; then
    tree -I "node_modules|dist" src/
else
    find src/ -type d -o -type f | grep -v "node_modules\|dist"
fi