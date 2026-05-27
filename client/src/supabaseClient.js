import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gsnqkavfdcyykzmfnkjh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbnFrYXZmZGN5eWt6bWZua2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDU0NjgsImV4cCI6MjA5NTM4MTQ2OH0.XTKr0uUvliBDHDbXPiSU0YwU-CpBKaBmrd9gh2MdRv4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);