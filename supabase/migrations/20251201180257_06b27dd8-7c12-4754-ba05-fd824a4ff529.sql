-- Add new role values to the existing app_role enum
-- Note: We cannot remove existing values, so we'll add the new ones
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'content_editor';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'moderator';

-- Update admin_requests default value to 'moderator'
ALTER TABLE admin_requests
  ALTER COLUMN requested_role SET DEFAULT 'moderator'::app_role;