export const BOTS = [
  {
    id: "alex_rookie",
    name: "Alex",
    elo: 400,
    skill: 0,
    depth: 1,
    style: "Beginner",
    avatar: "AL",
    color: "#94a3b8",
    comments: {
      start: ["Hi! I just started playing last month.", "The knights still confuse me a little."],
      check: ["Is that check? Oh no!", "My king is under attack!"],
      capture: ["I took a piece! Was that okay?", "Got one!"],
      blunder: ["Oops, I didn't mean to do that.", "Why did I move there?"],
      win: ["I won? Wow!", "Beginner's luck I guess."],
      loss: ["Thanks for the game, I learned a lot.", "I'll practice more."],
      good: ["Nice move!", "You're really good."]
    }
  },
  {
    id: "maya_solid",
    name: "Maya",
    elo: 800,
    skill: 3,
    depth: 3,
    style: "Solid",
    avatar: "MY",
    color: "#a78bfa",
    comments: {
      start: ["Pawns are the soul of the game.", "Let's build a solid position."],
      check: ["Check, but my structure holds."],
      capture: ["A fair trade.", "Keeping the balance."],
      blunder: ["That weakened my pawn chain."],
      win: ["Patience paid off.", "The small advantages added up."],
      loss: ["I pushed a pawn too far.", "Good pressure from you."],
      good: ["Clean technique."]
    }
  },
  {
    id: "jake_tactical",
    name: "Jake",
    elo: 1100,
    skill: 5,
    depth: 5,
    style: "Tactical",
    avatar: "JK",
    color: "#f97316",
    comments: {
      start: ["Looking for forks and pins!", "Knights create chaos."],
      check: ["Check from an unexpected square!"],
      capture: ["Forked and taken!", "Knight magic."],
      blunder: ["Missed the simple tactic."],
      win: ["Out-calculated you.", "Tactics win games."],
      loss: ["My knight got trapped."],
      good: ["Sharp eye."]
    }
  },
  {
    id: "sofia_pair",
    name: "Sofia",
    elo: 1300,
    skill: 7,
    depth: 6,
    style: "Positional",
    avatar: "SF",
    color: "#22d3ee",
    comments: {
      start: ["Open diagonals for the bishops.", "The bishop pair is strong."],
      check: ["Long-range check."],
      capture: ["Cleared the diagonal."],
      blunder: ["Closed the position by mistake."],
      win: ["Bishops dominated the endgame."],
      loss: ["I needed more space."],
      good: ["Beautiful coordination."]
    }
  },
  {
    id: "diego_gambit",
    name: "Diego",
    elo: 1500,
    skill: 9,
    depth: 8,
    style: "Aggressive",
    avatar: "DG",
    color: "#e11d48",
    comments: {
      start: ["I love gambits and initiative.", "Attack is the best defense."],
      check: ["Check! Feel the pressure."],
      capture: ["Material is temporary."],
      blunder: ["Overextended a bit."],
      win: ["The attack crashed through."],
      loss: ["Your counterattack was strong."],
      good: ["You defended well."]
    }
  },
  {
    id: "elena_endgame",
    name: "Elena",
    elo: 1700,
    skill: 12,
    depth: 10,
    style: "Technical",
    avatar: "EL",
    color: "#84cc16",
    comments: {
      start: ["Let's reach a pure endgame.", "Technique first."],
      check: ["Checking to improve the king."],
      capture: ["Simplifying is progress."],
      blunder: ["Miscounted the opposition."],
      win: ["Textbook conversion."],
      loss: ["I lost the opposition."],
      good: ["Precise play."]
    }
  },
  {
    id: "kai_speed",
    name: "Kai",
    elo: 1900,
    skill: 14,
    depth: 12,
    style: "Blitz",
    avatar: "KI",
    color: "#fbbf24",
    comments: {
      start: ["Play fast, think faster.", "Bullet energy!"],
      check: ["Check — and the clock is ticking."],
      capture: ["Instant decision."],
      blunder: ["Almost flagged myself."],
      win: ["Speed kills."],
      loss: ["I played too fast."],
      good: ["Clutch defense."]
    }
  },
  {
    id: "noah_coach",
    name: "Noah",
    elo: 2000,
    skill: 15,
    depth: 14,
    style: "Coach",
    avatar: "NH",
    color: "#8b5cf6",
    comments: {
      start: ["Let's learn something today.", "I'll point out ideas as we go."],
      check: ["Check! Notice the weakness."],
      capture: ["Interesting trade."],
      blunder: ["That was a teachable moment."],
      win: ["Review the opening later."],
      loss: ["Great fight. Look at move 17."],
      good: ["That's the idea!"]
    }
  },
  {
    id: "iris_engine",
    name: "Iris",
    elo: 2200,
    skill: 18,
    depth: 16,
    style: "Engine",
    avatar: "IR",
    color: "#10b981",
    comments: {
      start: ["Evaluating at depth 16.", "Calculating best moves."],
      check: ["Evaluation rising after the check."],
      capture: ["Material advantage confirmed."],
      blunder: ["Evaluation dropped."],
      win: ["Game over. High accuracy."],
      loss: ["Unexpected human resource."],
      good: ["You found the engine move."]
    }
  },
  {
    id: "rio_chaos",
    name: "Rio",
    elo: 1400,
    skill: 8,
    depth: 7,
    style: "Unorthodox",
    avatar: "RO",
    color: "#ec4899",
    comments: {
      start: ["Let's create some imbalance.", "Rules are flexible."],
      check: ["Surprise check!"],
      capture: ["Took the shiny piece."],
      blunder: ["Beautiful chaos... for you."],
      win: ["Order from disorder."],
      loss: ["You controlled the chaos."],
      good: ["Creative!"]
    }
  },
  {
    id: "zane_quiet",
    name: "Zane",
    elo: 1800,
    skill: 13,
    depth: 11,
    style: "Quiet",
    avatar: "ZN",
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
    id: "priya_theory",
    name: "Priya",
    elo: 1600,
    skill: 10,
    depth: 9,
    style: "Opening",
    avatar: "PR",
    color: "#0ea5e9",
    comments: {
      start: ["I know twenty moves of this line.", "Theory is fine here."],
      check: ["Not in the book, but okay."],
      capture: ["Standard in this variation."],
      blunder: ["Left theory too early."],
      win: ["Prepared line paid off."],
      loss: ["You found a novelty."],
      good: ["Excellent preparation."]
    }
  },
  {
    id: "marcus_hunter",
    name: "Marcus",
    elo: 1650,
    skill: 11,
    depth: 10,
    style: "Attacking",
    avatar: "MC",
    color: "#ef4444",
    comments: {
      start: ["Your king is the target.", "Mating nets incoming."],
      check: ["Check! The hunt continues."],
      capture: ["Removing a defender."],
      blunder: ["Missed the mate threat."],
      win: ["Checkmate. The king has fallen."],
      loss: ["Your king escaped."],
      good: ["You saw the threat."]
    }
  },
  {
    id: "lena_draw",
    name: "Lena",
    elo: 1550,
    skill: 9,
    depth: 8,
    style: "Defensive",
    avatar: "LN",
    color: "#a1a1aa",
    comments: {
      start: ["A draw is fine against stronger players.", "Solid first."],
      check: ["Check, easily covered."],
      capture: ["Equal material is comfortable."],
      blunder: ["Created unnecessary weaknesses."],
      win: ["Even I can convert sometimes."],
      loss: ["Held longer than expected."],
      good: ["You forced the issue."]
    }
  },
  {
    id: "viktor_nuke",
    name: "Viktor",
    elo: 1750,
    skill: 12,
    depth: 11,
    style: "Tactical",
    avatar: "VK",
    color: "#f43f5e",
    comments: {
      start: ["Looking for combinations.", "Tactics decide everything."],
      check: ["Double check possible?"],
      capture: ["The combination starts."],
      blunder: ["Hung a piece for a phantom attack."],
      win: ["Tactical explosion."],
      loss: ["You calculated deeper."],
      good: ["Nice save."]
    }
  },
  {
    id: "aria_positional",
    name: "Aria",
    elo: 1850,
    skill: 14,
    depth: 12,
    style: "Positional",
    avatar: "AR",
    color: "#6366f1",
    comments: {
      start: ["Improve the worst piece first.", "Prophylaxis matters."],
      check: ["Check that improves my structure."],
      capture: ["Trading into a better ending."],
      blunder: ["Created a permanent weakness."],
      win: ["The better structure won."],
      loss: ["You seized the initiative."],
      good: ["Excellent restraint."]
    }
  },
  {
    id: "tom_scramble",
    name: "Tom",
    elo: 1450,
    skill: 9,
    depth: 6,
    style: "Time",
    avatar: "TM",
    color: "#ca8a04",
    comments: {
      start: ["I play better in time trouble.", "Let's scramble."],
      check: ["Check with seconds left!"],
      capture: ["Instant decision."],
      blunder: ["Flag threat made me slip."],
      win: ["You flagged first."],
      loss: ["You managed the clock better."],
      good: ["Cool under pressure."]
    }
  },
  {
    id: "mira_mirror",
    name: "Mira",
    elo: 1400,
    skill: 8,
    depth: 7,
    style: "Copy",
    avatar: "MR",
    color: "#6b7280",
    comments: {
      start: ["I will copy you until I don't.", "Symmetry is beautiful."],
      check: ["Mirror check."],
      capture: ["Same capture."],
      blunder: ["Broke symmetry at the wrong time."],
      win: ["You broke first and paid."],
      loss: ["You forced the asymmetry."],
      good: ["Smart break."]
    }
  }
];

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
