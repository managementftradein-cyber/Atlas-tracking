if (!window.supabase || !window.ATLAS_CONFIG) {
  throw new Error("Supabase configuration is missing.");
}
const supabaseClient = window.supabase.createClient(
  window.ATLAS_CONFIG.SUPABASE_URL,
  window.ATLAS_CONFIG.SUPABASE_ANON_KEY
);
