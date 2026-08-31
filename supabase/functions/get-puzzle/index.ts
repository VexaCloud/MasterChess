// Authenticated: fetch the next puzzle for the caller.
//   mode "regular": next puzzle near the user's puzzle rating that they
//     haven't solved yet, drawn from the whole bank (curated + community +
//     previously Stockfish-generated). If nothing unseen is left near their
//     rating, tells the client to generate a fresh one locally with Stockfish.
//   mode "browse": paged/filterable browsing, most recent first, ignores solve history.
import { requireUser, json, corsHeaders } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user, admin } = auth;

  const { mode, theme, cursor } = await req.json().catch(() => ({}));

  if (mode === "browse") {
    let query = admin.from("puzzles").select("*").order("created_at", { ascending: false }).limit(20);
    if (theme) query = query.contains("themes", [theme]);
    if (cursor) query = query.lt("created_at", cursor);
    const { data, error } = await query;
    if (error) return json({ error: error.message }, 400);
    return json({ puzzles: data });
  }

  // "regular" mode
  const { data: profile } = await admin.from("profiles").select("ratings").eq("id", user.id).single();
  const targetRating = profile?.ratings?.puzzle ?? 1000;

  const { data: solved } = await admin.from("puzzle_solves").select("puzzle_id").eq("user_id", user.id);
  const solvedIds = (solved || []).map((s) => s.puzzle_id);

  let query = admin
    .from("puzzles")
    .select("*")
    .gte("rating", targetRating - 150)
    .lte("rating", targetRating + 150)
    .order("created_at", { ascending: false })
    .limit(30);
  if (solvedIds.length) query = query.not("id", "in", `(${solvedIds.join(",")})`);

  const { data: candidates, error } = await query;
  if (error) return json({ error: error.message }, 400);

  if (candidates && candidates.length > 0) {
    const puzzle = candidates[Math.floor(Math.random() * candidates.length)];
    return json({ puzzle, source: "bank" });
  }

  return json({ puzzle: null, generate: true, target_rating: targetRating });
});
