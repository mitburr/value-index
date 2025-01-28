-- 003_add_tracked_products.sql
CREATE TABLE tracked_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) NOT NULL,
    retailer_id UUID REFERENCES retailers(id),
    product_id UUID REFERENCES products(id),
    name VARCHAR(255) NOT NULL,
    validation_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(retailer_id, sku)
);

CREATE TRIGGER update_tracked_products_timestamp
    BEFORE UPDATE ON tracked_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_tracked_products_retailer ON tracked_products(retailer_id);