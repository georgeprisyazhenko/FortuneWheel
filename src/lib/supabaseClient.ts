import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  const errorMsg = 
    "Missing Supabase environment variables. " +
    "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
    "in your Vercel project settings (Settings → Environment Variables).";
  
  if (typeof window === "undefined") {
    // На сервере - выбрасываем ошибку с понятным сообщением
    throw new Error(errorMsg);
  } else {
    // В браузере - просто предупреждение
    console.error(errorMsg);
  }
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-key",
  {
    auth: { persistSession: false },
  }
);

