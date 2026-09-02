import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function requireUser(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { error: json({ error: "Missing Authorization header" }, 401) };

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) return { error: json({ error: "Invalid or expired session" }, 401) };

  return { user: data.user, admin: createClient(supabaseUrl, serviceKey) };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user, admin } = auth;

  const { bot_id, color, time_control } = await req.json().catch(() => ({}));
  if (!bot_id) return json({ error: "bot_id is required" }, 400);

  const playerIsWhite = color === "random" ? Math.random() < 0.5 : color !== "black";
  const [baseStr] = (time_control || "unlimited|0").split("|");
  const base = time_control === "unlimited" ? null : parseInt(baseStr, 10) || null;

  const { data: game, error } = await admin
    .from("games")
    .insert({
      white_id: playerIsWhite ? user.id : null,
      black_id: playerIsWhite ? null : user.id,
      bot_id,
      rated: false,
      time_control: time_control || "unlimited",
      variant: "standard",
      status: "ongoing",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      turn: "w",
      white_clock: base,
      black_clock: base,
      moves: [],
      last_move_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return json({ error: error.message }, 400);
  return json({ game, player_color: playerIsWhite ? "w" : "b" });
});
