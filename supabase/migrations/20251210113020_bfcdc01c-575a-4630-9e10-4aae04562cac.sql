-- Fix IP-based authorization bypass in thought_likes DELETE policy
-- Remove the spoofable X-Forwarded-For header check

DROP POLICY IF EXISTS "Users can delete their own likes" ON thought_likes;

CREATE POLICY "Users can delete their own likes" 
ON thought_likes 
FOR DELETE 
USING (auth.uid() = user_id);