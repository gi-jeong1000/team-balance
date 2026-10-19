begin;
do $$
declare g uuid; t uuid; q uuid; p uuid[]; scenario integer; i integer; n integer; first_a uuid; first_b uuid;
begin
 for scenario in 0..4 loop
  insert into games(name,join_code,phase) values('ROLLBACK 추첨 검증',upper(substr(md5(random()::text),1,10)),'draw') returning id into g;
  insert into teams(game_id,name,display_order) values(g,'검증팀',1) returning id into t;
  insert into questions(game_id,body,option_a,option_b,display_order) values(g,'추첨 검증','A','B',1) returning id into q;
  update games set current_question_id=q where id=g;
  p:=array[]::uuid[];
  for i in 1..(case when scenario=4 then 1 else 3 end) loop
   insert into participants(game_id,team_id,nickname,token_hash) values(g,t,'검증'||i,repeat(md5(random()::text),2)) returning id into first_a;
   p:=array_append(p,first_a);
  end loop;
  if scenario=1 then insert into votes(game_id,question_id,participant_id,round_no,option) values(g,q,p[1],1,1),(g,q,p[2],1,1),(g,q,p[3],1,1);end if;
  if scenario=2 then insert into votes(game_id,question_id,participant_id,round_no,option) values(g,q,p[1],1,2),(g,q,p[2],1,2),(g,q,p[3],1,2);end if;
  if scenario=3 then insert into votes(game_id,question_id,participant_id,round_no,option) values(g,q,p[1],1,1),(g,q,p[2],1,2);end if;
  if scenario=4 then
   begin
    perform * from draw_game_representatives(g);
    raise exception 'Single-participant draw unexpectedly succeeded';
   exception when sqlstate 'P0001' then
    if sqlerrm<>'at least two participants required' then raise;end if;
   end;
  else
   perform * from draw_game_representatives(g);
   select count(distinct r.participant_id) into n from representatives r where r.question_id=q;
   if n<>2 then raise exception 'Representatives must be distinct: %',scenario;end if;
   select r.participant_id into first_a from representatives r where r.question_id=q and r.option=1;
   select r.participant_id into first_b from representatives r where r.question_id=q and r.option=2;
   if scenario=3 and (first_a<>p[1] or first_b<>p[2]) then raise exception 'Normal voter pool changed';end if;
   perform * from draw_game_representatives(g);
   if exists(select 1 from representatives r where r.question_id=q and ((r.option=1 and r.participant_id<>first_a) or (r.option=2 and r.participant_id<>first_b))) then raise exception 'Idempotency failed';end if;
  end if;
 end loop;
end;
$$;
rollback;
select 'PASS: no votes, all A, all B, normal vote pools, distinct picks, idempotency, insufficient participants; test data rolled back' as verification;
