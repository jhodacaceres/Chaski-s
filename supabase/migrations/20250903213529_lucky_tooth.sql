/*
  # Add location tracking for products

  1. Changes
    - Add `pickup_location` column to products table for storing pickup coordinates
    - Add `pickup_address` column for human-readable pickup address
    - Update existing products to have default location

  2. Security
    - Maintain existing RLS policies
    - No additional security changes needed
*/

-- Add pickup location columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'pickup_location'
  ) THEN
    ALTER TABLE products ADD COLUMN pickup_location point;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'pickup_address'
  ) THEN
    ALTER TABLE products ADD COLUMN pickup_address text;
  END IF;
END $$;

-- Set default location for existing products (Cochabamba center)
UPDATE products 
SET pickup_location = point(-66.1568, -17.3895),
    pickup_address = 'Cochabamba, Bolivia'
WHERE pickup_location IS NULL;