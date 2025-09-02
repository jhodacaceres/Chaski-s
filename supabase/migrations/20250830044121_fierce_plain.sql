/*
  # Update profiles table to support additional fields

  1. Changes
    - Add `ci` column for Bolivian identity card number
    - Update existing policies to handle new fields
    - Add validation constraints for CI format

  2. Security
    - Maintain existing RLS policies
    - Ensure users can only update their own profiles
*/

-- Add CI column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'ci'
  ) THEN
    ALTER TABLE profiles ADD COLUMN ci text;
  END IF;
END $$;

-- Add constraint for CI format (7-8 digits)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_ci_format_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_ci_format_check 
    CHECK (ci IS NULL OR ci ~ '^\d{7,8}$');
  END IF;
END $$;

-- Add constraint for phone number format (8 digits starting with 6 or 7)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_phone_format_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_phone_format_check 
    CHECK (phone_number IS NULL OR phone_number ~ '^[67]\d{7}$');
  END IF;
END $$;

-- Update the profiles table policies to allow reading profiles by other users (for public profiles)
DROP POLICY IF EXISTS "Users can read any profile" ON profiles;
CREATE POLICY "Users can read any profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);