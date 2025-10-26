-- Drop the existing insert policy
DROP POLICY IF EXISTS "Anyone can submit thoughts" ON thoughts;

-- Create a new insert policy that allows public access
CREATE POLICY "Anyone can submit thoughts" 
ON thoughts 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);
