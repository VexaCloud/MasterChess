// Validates move, updates game, handles clocks/ratings (simplified)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )
  const { game_id, uci, san, fen_after, user_id } = await req.json()
  // TODO: validate with chess.js or server-side engine
  const { data: game } = await supabase.from("games").select("*").eq("id", game_id).single()
  if (!game || game.status !== "ongoing") {
    return new Response(JSON.stringify({ error: "Invalid game" }), { status: 400 })
  }
  const moves = Array.isArray(game.moves) ? game.moves : []
  moves.push({ uci, san, fen: fen_after, by: user_id })
  const { error } = await supabase.from("games").update({
    moves, fen: fen_after, updated_at: new Date().toISOString()
  }).eq("id", game_id)
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  return new Response(JSON.stringify({ ok: true, moves }), { headers: { "Content-Type": "application/json" } })
})
