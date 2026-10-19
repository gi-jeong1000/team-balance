import {serverDb} from './server-db';
export async function getDrawData(gameId:string,questionId:string){
 const db=serverDb();
 const [{data:people,error:pe},{data:votes,error:ve},{data:reps,error:re}]=await Promise.all([
  db.from('participants').select('id,nickname').eq('game_id',gameId).order('joined_at'),
  db.from('votes').select('option').eq('game_id',gameId).eq('question_id',questionId).eq('round_no',1),
  db.from('representatives').select('participant_id,option,speech_order').eq('question_id',questionId).order('speech_order')
 ]);
 if(pe||ve||re)throw Error('추첨 정보를 불러올 수 없습니다.');
 return {names:(people??[]).map(p=>p.nickname),representatives:(reps??[]).map(r=>({...r,nickname:people?.find(p=>p.id===r.participant_id)?.nickname??'참가자',fallback:!(votes??[]).some(v=>v.option===r.option)}))};
}
