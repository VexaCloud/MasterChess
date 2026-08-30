// Supabase Edge Function: create-game
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )
  const { white_id, black_id, time_control, rated, variant } = await req.json()
  const { data, error } = await supabase.from("games").insert({
    white_id, black_id, time_control, rated, variant: variant || "standard",
    status: "ongoing", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  }).select().single()
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } })
})
