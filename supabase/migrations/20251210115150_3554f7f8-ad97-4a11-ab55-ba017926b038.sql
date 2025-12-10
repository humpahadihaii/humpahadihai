-- Create admin_activity_logs table for tracking all admin actions
CREATE TABLE public.admin_activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL,
    user_email text NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    action text NOT NULL,
    summary text NOT NULL,
    metadata jsonb DEFAULT NULL
);

-- Create indexes for common queries
CREATE INDEX idx_admin_activity_logs_created_at ON public.admin_activity_logs (created_at DESC);
CREATE INDEX idx_admin_activity_logs_user_id ON public.admin_activity_logs (user_id);
CREATE INDEX idx_admin_activity_logs_entity_type ON public.admin_activity_logs (entity_type);
CREATE INDEX idx_admin_activity_logs_action ON public.admin_activity_logs (action);

-- Enable RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admin-panel users can read logs
CREATE POLICY "Admin panel users can view activity logs"
ON public.admin_activity_logs
FOR SELECT
TO authenticated
USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'content_manager'::app_role) OR
    has_role(auth.uid(), 'content_editor'::app_role) OR
    has_role(auth.uid(), 'moderator'::app_role) OR
    has_role(auth.uid(), 'editor'::app_role) OR
    has_role(auth.uid(), 'author'::app_role) OR
    has_role(auth.uid(), 'reviewer'::app_role)
);

-- Only admin-panel users can insert logs
CREATE POLICY "Admin panel users can insert activity logs"
ON public.admin_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'content_manager'::app_role) OR
    has_role(auth.uid(), 'content_editor'::app_role) OR
    has_role(auth.uid(), 'moderator'::app_role) OR
    has_role(auth.uid(), 'editor'::app_role) OR
    has_role(auth.uid(), 'author'::app_role) OR
    has_role(auth.uid(), 'reviewer'::app_role)
);

-- No one can update or delete logs (audit trail integrity)
-- No UPDATE or DELETE policies means these operations are denied