-- MasterChess migration 003
-- A small starter bank of curated puzzles so Browse isn't empty on day one.
-- Each of these was generated and verified programmatically with chess.js
-- (legal setup moves, legal solution moves, checkmate confirmed at the end)
-- rather than typed from memory. Add more any time with the same shape.

insert into puzzles (fen, moves, rating, themes, title, source, is_verified) values
  ('r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
   array['h5f7'], 500, array['mateIn1','opening'], 'Scholar''s Mate Finish', 'curated', true),

  ('rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2',
   array['d8h4'], 400, array['mateIn1','opening'], 'Fool''s Mate Finish', 'curated', true),

  ('rn1qkbnr/ppp2p1p/3p2p1/4N3/2B1P3/2N5/PPPP1PPP/R1BbK2R w KQkq - 0 6',
   array['c4f7','e8e7','c3d5'], 1300, array['mateIn2','sacrifice','opening'], 'Legal''s Mate', 'curated', true)
on conflict do nothing;
