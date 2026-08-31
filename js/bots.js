/**
 * MasterChess Bot Personalities
 * Unique styles, strengths (Stockfish skill/depth), and comment banks.
 */

export const BOTS = [
  {
    id: "rook_rookie",
    name: "Rook Rookie",
    elo: 400,
    skill: 0,
    depth: 1,
    style: "beginner",
    avatar: "RR",
    color: "#94a3b8",
    comments: {
      start: ["Let's learn together!", "I just learned how the horsey moves."],
      check: ["Is that check? Cool!", "Oh no, my king!"],
      capture: ["I took something!", "Was that a good take?"],
      blunder: ["Oops, I messed up again.", "Why did I do that?"],
      win: ["I won? Really?!", "Beginner's luck!"],
      loss: ["I'll get better next time.", "Thanks for the lesson."],
      good: ["Nice move!", "You're teaching me."]
    }
  },
  {
    id: "pawn_pusher",
    name: "Pawn Pusher",
    elo: 800,
    skill: 3,
    depth: 3,
    style: "solid",
    avatar: "PP",
    color: "#a78bfa",
    comments: {
      start: ["Pawns are the soul of chess.", "Let's advance slowly."],
      check: ["Check — but my structure is solid."],
      capture: ["Traded a pawn for activity."],
      blunder: ["My chain broke..."],
      win: ["Patience wins.", "The pawns decided it."],
      loss: ["I pushed too far.", "Structure collapsed."],
      good: ["Clean technique."]
    }
  },
  {
    id: "knight_norris",
    name: "Knight Norris",
    elo: 1100,
    skill: 5,
    depth: 5,
    style: "tactical",
    avatar: "KN",
    color: "#f97316",
    comments: {
      start: ["Time for some forks!", "Knights love chaos."],
      check: ["Check from the jumping piece!"],
      capture: ["Forked and taken!", "Knight magic."],
      blunder: ["Missed the fork opportunity."],
      win: ["Out-jumped you.", "Tactics rule."],
      loss: ["My knight got trapped."],
      good: ["Sharp eye."]
    }
  },
  {
    id: "bishop_pair",
    name: "Bishop Pair",
    elo: 1300,
    skill: 7,
    depth: 6,
    style: "positional",
    avatar: "BP",
    color: "#22d3ee",
    comments: {
      start: ["Open diagonals, please.", "The pair will decide."],
      check: ["Long-range check."],
      capture: ["Cleaned the diagonal."],
      blunder: ["Closed the position by mistake."],
      win: ["Bishops dominate.", "Endgame conversion."],
      loss: ["I needed more space."],
      good: ["Beautiful coordination."]
    }
  },
  {
    id: "queen_gambit",
    name: "Queen Gambit",
    elo: 1500,
    skill: 9,
    depth: 8,
    style: "aggressive",
    avatar: "QG",
    color: "#e11d48",
    comments: {
      start: ["I sacrifice for initiative.", "Attack is the best defense."],
      check: ["Check! Feel the pressure."],
      capture: ["Material is temporary, initiative is forever."],
      blunder: ["Overextended..."],
      win: ["Attack crashed through.", "King hunt successful."],
      loss: ["Counterattack was too strong."],
      good: ["You defended well."]
    }
  },
  {
    id: "endgame_expert",
    name: "Endgame Expert",
    elo: 1700,
    skill: 12,
    depth: 10,
    style: "technical",
    avatar: "EE",
    color: "#84cc16",
    comments: {
      start: ["Let's reach a pure endgame.", "Technique first."],
      check: ["Checking to improve the king."],
      capture: ["Simplifying is progress."],
      blunder: ["Miscounted the opposition."],
      win: ["Textbook conversion.", "King activity won."],
      loss: ["I lost the opposition."],
      good: ["Precise play."]
    }
  },
  {
    id: "hikaru_clone",
    name: "Speed Demon",
    elo: 1900,
    skill: 14,
    depth: 12,
    style: "blitz",
    avatar: "SD",
    color: "#fbbf24",
    comments: {
      start: ["Bullet time!", "Play fast, think faster."],
      check: ["Check — and the clock is ticking."],
      capture: ["Taken on time pressure."],
      blunder: ["Flagged myself almost."],
      win: ["Speed kills.", "You ran out of time ideas."],
      loss: ["I played too fast."],
      good: ["Clutch defense."]
    }
  },
  {
    id: "levy_coach",
    name: "Gotham Coach",
    elo: 2000,
    skill: 15,
    depth: 14,
    style: "coach",
    avatar: "GC",
    color: "#8b5cf6",
    comments: {
      start: ["Let's learn something today.", "I'll explain as we go."],
      check: ["Check! Notice the weakness you created."],
      capture: ["Good trade — or was it?"],
      blunder: ["That was a teachable moment."],
      win: ["You almost had me. Review the opening."],
      loss: ["Great game. Look at move 17."],
      good: ["That's the idea!"],
      hint: ["Try looking at the weak square near the king.", "What if you developed the last piece?"]
    }
  },
  {
    id: "stockfish_lite",
    name: "Stockfish Lite",
    elo: 2200,
    skill: 18,
    depth: 16,
    style: "engine",
    avatar: "SF",
    color: "#10b981",
    comments: {
      start: ["Evaluating... depth 16.", "Best move calculation engaged."],
      check: ["+1.8 after the check."],
      capture: ["Material advantage confirmed."],
      blunder: ["Evaluation dropped sharply."],
      win: ["Game over. Accuracy 98%."],
      loss: ["Unexpected human brilliance."],
      good: ["Human found the engine move."]
    }
  },
  {
    id: "chaos_theory",
    name: "Chaos Theory",
    elo: 1400,
    skill: 8,
    depth: 7,
    style: "wild",
    avatar: "CT",
    color: "#ec4899",
    comments: {
      start: ["Rules are suggestions.", "Let's create imbalance."],
      check: ["Surprise check from nowhere!"],
      capture: ["I took the shiny piece."],
      blunder: ["Beautiful chaos... for you."],
      win: ["Order from disorder.", "I love this mess."],
      loss: ["You controlled the chaos better."],
      good: ["Creative!"]
    }
  },
  {
    id: "silent_assassin",
    name: "Silent Assassin",
    elo: 1800,
    skill: 13,
    depth: 11,
    style: "quiet",
    avatar: "SA",
    color: "#64748b",
    comments: {
      start: ["..."],
      check: ["."],
      capture: ["Taken."],
      blunder: ["..."],
      win: ["Done."],
      loss: ["..."],
      good: ["."]
    }
  },
  {
    id: "opening_nerd",
    name: "Opening Nerd",
    elo: 1600,
    skill: 10,
    depth: 9,
    style: "opening",
    avatar: "ON",
    color: "#0ea5e9",
    comments: {
      start: ["Theory says this is fine.", "I know 20 moves of this line."],
      check: ["Not in the book, but okay."],
      capture: ["Standard capture in this variation."],
      blunder: ["I left theory too early."],
      win: ["Prepared variation paid off."],
      loss: ["You found a novelty."],
      good: ["Excellent preparation."]
    }
  },
  {
    id: "king_hunter",
    name: "King Hunter",
    elo: 1650,
    skill: 11,
    depth: 10,
    style: "attacking",
    avatar: "KH",
    color: "#ef4444",
    comments: {
      start: ["Your king is my target.", "Mating nets incoming."],
      check: ["Check! The hunt continues."],
      capture: ["Removing a defender."],
      blunder: ["Missed the mate in 3."],
      win: ["Checkmate. The king has fallen."],
      loss: ["Your king escaped."],
      good: ["You saw the threat."]
    }
  },
  {
    id: "draw_master",
    name: "Draw Master",
    elo: 1550,
    skill: 9,
    depth: 8,
    style: "defensive",
    avatar: "DM",
    color: "#a1a1aa",
    comments: {
      start: ["A draw is a success against stronger players.", "Solid first."],
      check: ["Check, but easily covered."],
      capture: ["Equal material is fine."],
      blunder: ["I created weaknesses."],
      win: ["Even I can win sometimes."],
      loss: ["I held longer than expected."],
      good: ["You forced the issue."]
    }
  },
  {
    id: "tactical_nuke",
    name: "Tactical Nuke",
    elo: 1750,
    skill: 12,
    depth: 11,
    style: "tactical",
    avatar: "TN",
    color: "#f43f5e",
    comments: {
      start: ["Looking for combinations.", "Tactics decide everything."],
      check: ["Double check incoming?"],
      capture: ["The combination starts."],
      blunder: ["I hung a piece for a phantom attack."],
      win: ["Tactical explosion.", "You missed the intermezzo."],
      loss: ["You calculated deeper."],
      good: ["Nice save."]
    }
  },
  {
    id: "positional_master",
    name: "Positional Master",
    elo: 1850,
    skill: 14,
    depth: 12,
    style: "positional",
    avatar: "PM",
    color: "#14b8a6",
    comments: {
      start: ["Improve the worst piece.", "Prophylaxis first."],
      check: ["Check that improves my structure."],
      capture: ["Improving the pawn structure."],
      blunder: ["I created a permanent weakness."],
      win: ["Strategic dominance.", "You had no counterplay."],
      loss: ["You found the only break."],
      good: ["Excellent prophylaxis."]
    }
  },
  {
    id: "random_genius",
    name: "Random Genius",
    elo: 1200,
    skill: 6,
    depth: 5,
    style: "unpredictable",
    avatar: "RG",
    color: "#d946ef",
    comments: {
      start: ["I might play anything.", "Expect the unexpected."],
      check: ["Random check!"],
      capture: ["Why not?"],
      blunder: ["That was intentional... maybe."],
      win: ["Genius or luck? Yes."],
      loss: ["The universe decided."],
      good: ["You adapted."]
    }
  },
  {
    id: "coach_hikaru",
    name: "Coach Hikaru",
    elo: 2100,
    skill: 16,
    depth: 15,
    style: "coach",
    avatar: "CH",
    color: "#f59e0b",
    comments: {
      start: ["Let's cook.", "I'm going to challenge you."],
      check: ["Check — did you see it coming?"],
      capture: ["That was the only move."],
      blunder: ["Okay, that was a blunder. Let's go back."],
      win: ["GG. Review the critical moment."],
      loss: ["You played great. That endgame was clean."],
      good: ["That's it!"],
      hint: ["Look at the hanging piece.", "Can you force a trade of queens?"]
    }
  },
  {
    id: "coach_levy",
    name: "Coach Levy",
    elo: 2050,
    skill: 15,
    depth: 14,
    style: "coach",
    avatar: "CL",
    color: "#7c3aed",
    comments: {
      start: ["Welcome to the classroom.", "I'll give feedback as we play."],
      check: ["Check — and the reason is..."],
      capture: ["Interesting capture. Let's see why."],
      blunder: ["Classic mistake. Here's what to look for next time."],
      win: ["Good game. Key lesson today was piece activity."],
      loss: ["You outplayed me in the middlegame."],
      good: ["Textbook!"],
      hint: ["Develop with tempo.", "The e-file is open for a reason."]
    }
  },
  {
    id: "grandmaster_ai",
    name: "Grandmaster AI",
    elo: 2400,
    skill: 20,
    depth: 18,
    style: "engine",
    avatar: "GM",
    color: "#059669",
    comments: {
      start: ["Deep calculation engaged.", "Playing for the advantage."],
      check: ["Forcing sequence."],
      capture: ["Only move according to the lines."],
      blunder: ["Human found a resource."],
      win: ["Technical win."],
      loss: ["Impressive defense."],
      good: ["Engine-level accuracy."]
    }
  },
  {
    id: "blitz_king",
    name: "Blitz King",
    elo: 1950,
    skill: 15,
    depth: 10,
    style: "blitz",
    avatar: "BK",
    color: "#ea580c",
    comments: {
      start: ["No time to think deeply.", "Instinct mode."],
      check: ["Check on the clock!"],
      capture: ["Instant take."],
      blunder: ["Mouse slip energy."],
      win: ["Flagged or outplayed — either works."],
      loss: ["You were faster."],
      good: ["Clutch."]
    }
  },
  {
    id: "endgame_god",
    name: "Endgame God",
    elo: 2300,
    skill: 19,
    depth: 20,
    style: "technical",
    avatar: "EG",
    color: "#0d9488",
    comments: {
      start: ["Let's go to the endgame.", "I tablebase everything."],
      check: ["Checking to gain opposition."],
      capture: ["Simplifying to a won ending."],
      blunder: ["Rare miscalculation in the ending."],
      win: ["Converted the pawn ending."],
      loss: ["You knew the theoretical draw."],
      good: ["Perfect technique."]
    }
  },
  {
    id: "swindler",
    name: "The Swindler",
    elo: 1450,
    skill: 8,
    depth: 7,
    style: "tricky",
    avatar: "SW",
    color: "#c026d3",
    comments: {
      start: ["I only need one chance.", "Swindles incoming."],
      check: ["Perpetual? Or worse?"],
      capture: ["Poisoned pawn?"],
      blunder: ["I set a trap and fell in it."],
      win: ["Swindle of the year.", "You were winning..."],
      loss: ["No swindle this time."],
      good: ["You avoided the traps."]
    }
  },
  {
    id: "solid_rock",
    name: "Solid Rock",
    elo: 1600,
    skill: 10,
    depth: 9,
    style: "solid",
    avatar: "SR",
    color: "#57534e",
    comments: {
      start: ["Nothing gets through.", "I don't take risks."],
      check: ["Covered."],
      capture: ["Equal trade."],
      blunder: ["I finally cracked."],
      win: ["You overpressed.", "Solid wins."],
      loss: ["You found the breakthrough."],
      good: ["Patient play."]
    }
  },
  {
    id: "artist",
    name: "The Artist",
    elo: 1700,
    skill: 11,
    depth: 10,
    style: "creative",
    avatar: "AR",
    color: "#db2777",
    comments: {
      start: ["Chess is art.", "Let's create something beautiful."],
      check: ["Aesthetic check."],
      capture: ["The composition continues."],
      blunder: ["Ugly move — I regret it."],
      win: ["A masterpiece.", "Poetry in motion."],
      loss: ["You painted a better picture."],
      good: ["Beautiful idea."]
    }
  },
  {
    id: "calculator",
    name: "The Calculator",
    elo: 2000,
    skill: 16,
    depth: 15,
    style: "calculating",
    avatar: "CA",
    color: "#2563eb",
    comments: {
      start: ["Counting every tempo.", "Lines upon lines."],
      check: ["Forced sequence calculated."],
      capture: ["Material count updated."],
      blunder: ["Miscalculated the depth."],
      win: ["The numbers favored me."],
      loss: ["You calculated further."],
      good: ["Accurate."]
    }
  },
  {
    id: "romantic",
    name: "Romantic Era",
    elo: 1350,
    skill: 7,
    depth: 6,
    style: "romantic",
    avatar: "RE",
    color: "#be123c",
    comments: {
      start: ["Sacrifice everything for the attack!", "19th century style."],
      check: ["Check! King hunt begins."],
      capture: ["Who needs material?"],
      blunder: ["The sacrifice was unsound... this time."],
      win: ["Brilliancy prize!", "Mate with the last piece."],
      loss: ["Sound defense beats romance."],
      good: ["You declined the gambit wisely."]
    }
  },
  {
    id: "hypermodern",
    name: "Hypermodern",
    elo: 1550,
    skill: 9,
    depth: 8,
    style: "hypermodern",
    avatar: "HM",
    color: "#4f46e5",
    comments: {
      start: ["Control the center from afar.", "Fianchetto everything."],
      check: ["Pressure from the flank."],
      capture: ["Undermining the center."],
      blunder: ["I allowed a classical center."],
      win: ["The center collapsed.", "Hypermodern triumph."],
      loss: ["You occupied the center successfully."],
      good: ["Good restraint."]
    }
  },
  {
    id: "time_scrambler",
    name: "Time Scrambler",
    elo: 1500,
    skill: 9,
    depth: 6,
    style: "time",
    avatar: "TS",
    color: "#ca8a04",
    comments: {
      start: ["I play better in time trouble.", "Let's scramble."],
      check: ["Check with 5 seconds left!"],
      capture: ["Instant decision."],
      blunder: ["Flag threat made me blunder."],
      win: ["You flagged first.", "Scramble victory."],
      loss: ["You managed the clock better."],
      good: ["Cool under pressure."]
    }
  },
  {
    id: "mirror",
    name: "The Mirror",
    elo: 1400,
    skill: 8,
    depth: 7,
    style: "copy",
    avatar: "MI",
    color: "#6b7280",
    comments: {
      start: ["I will copy you... until I don't.", "Symmetry is beautiful."],
      check: ["Mirror check."],
      capture: ["Same capture."],
      blunder: ["I broke symmetry at the wrong time."],
      win: ["You broke first and paid.", "Symmetry wins."],
      loss: ["You forced the asymmetry."],
      good: ["Smart break."]
    }
  }
];

// Helper to get a random comment
export function getBotComment(bot, event) {
  if (!bot || !bot.comments) return null;
  const pool = bot.comments[event] || bot.comments.good || ["..."];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getBotById(id) {
  return BOTS.find(b => b.id === id) || BOTS[0];
}

export function getBotsByEloRange(min, max) {
  return BOTS.filter(b => b.elo >= min && b.elo <= max);
}
