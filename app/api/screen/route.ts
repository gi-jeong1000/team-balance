import {NextRequest,NextResponse} from 'next/server';
import {serverDb} from '@/lib/server-db';
import {calculateStandings} from '@/lib/standings';
import {getDrawData} from '@/lib/draw-data';
export const runtime='nodejs';
export async function GET(req:NextRequest){
 const code=req.nextUrl.searchParams.get('code')?.trim().toUpperCase();
 if(!code||!/^[A-Z0-9-]{4,12}$/.test(code))return NextResponse.json({error:'올바른 참가 코드를 입력하세요.'},{status:400});
 try{
 const db=serverDb();const {data:g,error}=await db.from('games').select('id,name,phase,phase_version,current_question_id,reveal_mode').eq('join_code',code).maybeSingle();
 if(error||!g)return NextResponse.json({error:'게임을 찾을 수 없습니다.'},{status:404});
 const id=g.current_question_id;const showResult=['reveal','round_complete','finished'].includes(g.phase);
 const [{data:questions},{data:timer},{data:result},{data:teams},{data:reps},{data:people},{data:scores}]=await Promise.all([
 db.from('questions').select('id,body,option_a,option_b,image_a_path,image_b_path,display_order').eq('game_id',g.id).order('display_order'),
 id?db.from('round_runtime').select('ends_at,is_paused,remaining_ms').eq('question_id',id).eq('phase',g.phase).maybeSingle():Promise.resolve({data:null}),
 id&&showResult?db.from('round_results').select('winner,reversal,vote1_a,vote1_b,vote2_a,vote2_b,flow_a_to_b,flow_b_to_a').eq('question_id',id).maybeSingle():Promise.resolve({data:null}),
 db.from('teams').select('id,name').eq('game_id',g.id),
 id&&['draw','speech1','speech2', 'reveal','round_complete','finished'].includes(g.phase)?db.from('representatives').select('participant_id,option,speech_order').eq('question_id',id).order('speech_order'):Promise.resolve({data:[]}),
 db.from('participants').select('id,nickname,team_id').eq('game_id',g.id),
 showResult?db.from('score_events').select('team_id,question_id,points,reason').eq('game_id',g.id).eq('is_valid',true):Promise.resolve({data:[]})
 ]);
 const question=questions?.find(q=>q.id===id)??null;const teamName=new Map((teams??[]).map(t=>[t.id,t.name]));
 const standings=calculateStandings(teams??[],scores??[]);
 const representatives=(reps??[]).map(r=>({option:r.option,speech_order:r.speech_order,nickname:people?.find(p=>p.id===r.participant_id)?.nickname??'대표자 없음',team:teamName.get(people?.find(p=>p.id===r.participant_id)?.team_id??'')??''}));
 let disclosure:null|{mode:string;rows:Record<string,unknown>[]} = null;
 if(result&&g.reveal_mode!=='anonymous'){
  const {data:votes}=await db.from('votes').select('participant_id,option').eq('game_id',g.id).eq('question_id',id).eq('round_no',2);
  if(g.reveal_mode==='person')disclosure={mode:'person',rows:(votes??[]).map(v=>({nickname:people?.find(p=>p.id===v.participant_id)?.nickname??'참가자',option:v.option}))};
  else disclosure={mode:'team',rows:(teams??[]).map(t=>{const ids=new Set(people?.filter(p=>p.team_id===t.id).map(p=>p.id));const rows=votes?.filter(v=>ids.has(v.participant_id))??[];return {name:t.name,a:rows.filter(v=>v.option===1).length,b:rows.filter(v=>v.option===2).length}})};
 }
 const draw=g.phase==='draw'&&id?await getDrawData(g.id,id):null;
 return NextResponse.json({draw,game:{name:g.name,phase:g.phase,phaseVersion:g.phase_version,revealMode:g.reveal_mode},question,round:question?(questions?.findIndex(q=>q.id===id)??0)+1:0,totalRounds:questions?.length??0,runtime:timer??null,result:result??null,representatives,standings:showResult?standings:[],awards:result?(scores??[]).filter(s=>s.question_id===id).map(s=>({name:teamName.get(s.team_id),points:s.points,reason:s.reason})):[],disclosure},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'화면 조회에 실패했습니다.'},{status:500})}
}
