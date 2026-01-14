-- Add RFC 2606 reserved domains to the email blocklist
INSERT INTO public.email_domain_blocklist (domain, category, reason, is_active)
VALUES 
  ('example.com', 'custom', 'RFC 2606 reserved domain - not allowed for registration', true),
  ('example.org', 'custom', 'RFC 2606 reserved domain - not allowed for registration', true),
  ('example.net', 'custom', 'RFC 2606 reserved domain - not allowed for registration', true),
  ('test.com', 'custom', 'RFC 2606 reserved domain - not allowed for registration', true),
  ('test.org', 'custom', 'RFC 2606 reserved domain - not allowed for registration', true),
  ('test.net', 'custom', 'RFC 2606 reserved domain - not allowed for registration', true),
  ('localhost', 'custom', 'Local development domain - not allowed for registration', true),
  ('invalid', 'custom', 'RFC 2606 reserved TLD - not allowed for registration', true),
  ('example', 'custom', 'RFC 2606 reserved TLD - not allowed for registration', true),
  ('test', 'custom', 'RFC 2606 reserved TLD - not allowed for registration', true)
ON CONFLICT (domain) DO NOTHING;