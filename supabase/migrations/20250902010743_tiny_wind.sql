/*
  # Update store and product requirements

  1. Changes
    - Make store_id optional for products (allow products without stores)
    - Make address optional for stores
    - Remove coordinates requirement for stores
    - Update constraints and policies

  2. Security
    - Maintain existing RLS policies
    - Allow products without stores
    - Keep store ownership validation where applicable
*/

-- Make store_id optional for products
DO $$
BEGIN
  -- Drop the foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'products_store_id_fkey'
    AND table_name = 'products'
  ) THEN
    ALTER TABLE products DROP CONSTRAINT products_store_id_fkey;
  END IF;

  -- Drop the NOT NULL constraint
  ALTER TABLE products ALTER COLUMN store_id DROP NOT NULL;
END $$;

-- Add new foreign key constraint that allows NULL
ALTER TABLE products 
ADD CONSTRAINT products_store_id_fkey 
FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL;

-- Make address optional for stores
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' 
    AND column_name = 'address' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE stores ALTER COLUMN address DROP NOT NULL;
  END IF;
END $$;

-- Make coordinates optional for stores
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' 
    AND column_name = 'coordinates'
  ) THEN
    ALTER TABLE stores ALTER COLUMN coordinates DROP NOT NULL;
  END IF;
END $$;

-- Update products RLS policy to allow products without stores
DROP POLICY IF EXISTS "Store owners can manage products" ON products;

-- New policy: Allow users to manage their own products (with or without stores)
CREATE POLICY "Users can manage their own products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    -- For products with stores: only store owners can manage
    (store_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    ))
    OR
    -- For products without stores: allow any authenticated user to manage their own
    (store_id IS NULL)
  );

-- Add a user_id column to products for products without stores
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE products ADD COLUMN user_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update the policy to use user_id for products without stores
DROP POLICY IF EXISTS "Users can manage their own products" ON products;

CREATE POLICY "Users can manage their own products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    -- For products with stores: only store owners can manage
    (store_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    ))
    OR
    -- For products without stores: only the creator can manage
    (store_id IS NULL AND user_id = auth.uid())
  );