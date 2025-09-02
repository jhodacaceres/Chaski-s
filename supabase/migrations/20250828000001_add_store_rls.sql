-- Add RLS policies for stores table

-- Enable RLS on stores table
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to read stores
CREATE POLICY "Anyone can read stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow any authenticated user to create stores
CREATE POLICY "Anyone can create stores"
  ON stores
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow store owners to update their stores
CREATE POLICY "Store owners can update their stores"
  ON stores
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Allow store owners to delete their stores (soft delete)
CREATE POLICY "Store owners can delete their stores"
  ON stores
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Ensure stores have point coordinates column
ALTER TABLE stores ALTER COLUMN coordinates TYPE point USING point(0, 0);

-- Add RLS policies for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to read products
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow store owners to manage products for their stores
CREATE POLICY "Store owners can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  );
