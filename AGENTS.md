# Project Architecture Rules

- Keep all AI inference inside Supabase Edge Functions using the server-only Lovable AI Gateway SDK so provider credentials stay server-side and the browser calls only app functions.