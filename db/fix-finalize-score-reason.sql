-- Fix only the literal that violates score_events_reason_check.
-- No point values, eligibility rules, permissions, or existing rows change.
BEGIN;
DO $$
DECLARE definition text;
BEGIN
 SELECT pg_get_functiondef('public.finalize_game_round(uuid)'::regprocedure) INTO definition;
 IF position('''winning_ratio''' IN definition) = 0 THEN
  RAISE EXCEPTION 'Expected scoring reason not found; inspect function before applying';
 END IF;
 EXECUTE replace(definition, '''winning_ratio''', '''majority''');
END $$;
COMMIT;
-- Rollback: replace the 'majority' literal back with 'winning_ratio' in this
-- function only. This restores the prior (broken) behavior without row changes.
