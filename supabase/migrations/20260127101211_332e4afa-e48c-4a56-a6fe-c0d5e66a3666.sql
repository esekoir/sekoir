-- Add card_settings to site_settings for card customization
INSERT INTO public.site_settings (key, value)
VALUES ('card_settings', '{
  "background_type": "gradient",
  "gradient_from": "#10b981",
  "gradient_via": "#059669",
  "gradient_to": "#14b8a6",
  "background_image": null
}'::jsonb)
ON CONFLICT (key) DO NOTHING;