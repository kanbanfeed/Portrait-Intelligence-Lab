

const SUPABASE_URL = "https://qhzfmslylxjfzsdolbqw.supabase.co";
const SUPABASE_ANON_KEY= "sb_publishable_C7DeLvBK6B2k1lK4zlT99A_Q-j-75uu";


window.supabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);