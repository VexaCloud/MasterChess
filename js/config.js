// MasterChess config — set your Supabase credentials
window.MasterChessConfig = {
  supabaseUrl: 'https://ikbblffrtgemyktrkgae.supabase.co',
  supabaseAnonKey: 'sb_publishable_mOT9PUzKPUYHGY2oKdAS9g_-ZS1yiCh',
  // Stockfish path (download from https://github.com/nmrugg/stockfish.js)
  stockfishPath: 'js/stockfish/stockfish.js',
  // Default time controls
  timeControls: {
    bullet: [
      { label: '1+0', base: 60, increment: 0 },
      { label: '2+1', base: 120, increment: 1 },
      { label: '30s', base: 30, increment: 0 }
    ],
    blitz: [
      { label: '3+0', base: 180, increment: 0 },
      { label: '3+2', base: 180, increment: 2 },
      { label: '5+0', base: 300, increment: 0 },
      { label: '5+5', base: 300, increment: 5 }
    ],
    rapid: [
      { label: '10+0', base: 600, increment: 0 },
      { label: '15+10', base: 900, increment: 10 },
      { label: '30+0', base: 1800, increment: 0 }
    ]
  }
};
