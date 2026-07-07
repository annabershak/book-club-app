import { createClient } from '@supabase/supabase-js';

// Использовать ТОЛЬКО в серверном коде (API routes), никогда во фронтенде —
// у этого ключа полный доступ к базе.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
