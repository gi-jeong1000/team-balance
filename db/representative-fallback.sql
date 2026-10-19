-- Keep the existing row lock, idempotency and least-used voter preference.
create or replace function public.draw_game_representatives(p_game_id uuid)
returns table(participant_id uuid, option smallint, speech_order smallint)
language plpgsql set search_path to 'public' as $$
declare v_question uuid; v_phase text; v_a uuid; v_b uuid;
begin
 select g.current_question_id,g.phase into v_question,v_phase from public.games g where g.id=p_game_id for update;
 if v_question is null or v_phase<>'draw' then raise exception 'not draw phase' using errcode='P0001'; end if;
 if exists(select 1 from public.representatives r where r.question_id=v_question) then
  return query select r.participant_id,r.option,r.speech_order from public.representatives r where r.question_id=v_question order by r.speech_order;
  return;
 end if;
 select v.participant_id into v_a from public.votes v join public.participants p on p.id=v.participant_id
 where v.question_id=v_question and v.round_no=1 and v.option=1 and p.game_id=p_game_id
 order by (select count(*) from public.representatives old where old.participant_id=v.participant_id),random() limit 1;
 select v.participant_id into v_b from public.votes v join public.participants p on p.id=v.participant_id
 where v.question_id=v_question and v.round_no=1 and v.option=2 and p.game_id=p_game_id
 order by (select count(*) from public.representatives old where old.participant_id=v.participant_id),random() limit 1;
 if v_a is null then
  select p.id into v_a from public.participants p where p.game_id=p_game_id and (v_b is null or p.id<>v_b) order by random() limit 1;
 end if;
 if v_b is null then
  select p.id into v_b from public.participants p where p.game_id=p_game_id and p.id<>v_a order by random() limit 1;
 end if;
 if v_a is null or v_b is null then raise exception 'at least two participants required' using errcode='P0001'; end if;
 if random()<0.5 then
  insert into public.representatives(question_id,participant_id,option,speech_order) values(v_question,v_a,1,1),(v_question,v_b,2,2);
 else
  insert into public.representatives(question_id,participant_id,option,speech_order) values(v_question,v_a,1,2),(v_question,v_b,2,1);
 end if;
 return query select r.participant_id,r.option,r.speech_order from public.representatives r where r.question_id=v_question order by r.speech_order;
end;
$$;
