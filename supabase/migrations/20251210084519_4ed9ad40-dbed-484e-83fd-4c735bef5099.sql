-- Add whatsapp_number field to cms_site_settings for booking contact
ALTER TABLE cms_site_settings 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT NULL;