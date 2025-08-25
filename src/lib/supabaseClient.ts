import { createClient } from "@supabase/supabase-js";

// It's recommended to store these in environment variables
const supabaseUrl = "https://lsvwsgshkfhybbssnfsg.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndzZ3Noa2ZoeWJic3NuZnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTQxMDYsImV4cCI6MjA3MTczMDEwNn0.bkHE7-N-YY-HIqxjIb7EgQsxJu00mX5DKCUucF-BMcU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
