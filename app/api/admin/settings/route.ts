import {NextRequest,NextResponse} from 'next/server';
import {isAdmin} from '@/lib/admin-auth';
import {serverDb} from '@/lib/server-db';
export async function POST(req:NextRequest){
 if(!isAdmin(req))return NextResponse.json({error:'관리자 인증이 필요합니다.'},{status:401});
 try{
  const {gameId,name,teamNames,revealMode}=await req.json();const db=serverDb();
  const {data:game}=await db.from('games').select('id,phase').eq('id',gameId).maybeSingle();
  if(!game)return NextResponse.json({error:'게임 없음'},{status:404});
  if(revealMode!==undefined){
   if(!['anonymous','team','person'].includes(revealMode))return NextResponse.json({error:'공개 설정 오류'},{status:400});
   const {error}=await db.from('games').update({reveal_mode:revealMode}).eq('id',gameId);if(error)throw error;
  }else{
   if(game.phase!=='lobby')return NextResponse.json({error:'게임 설정은 시작 전에 변경하세요.'},{status:409});
   if(typeof name!=='string'||name.trim().length<2||name.length>80||!Array.isArray(teamNames)||teamNames.some((n:unknown)=>typeof n!=='string'||!n.trim()||n.length>30))return NextResponse.json({error:'게임명과 팀 이름을 확인하세요.'},{status:400});
   const {data:teams}=await db.from('teams').select('id').eq('game_id',gameId).order('display_order');
   if(!teams||teams.length!==teamNames.length)return NextResponse.json({error:'팀 수 변경은 새 게임 생성으로 진행하세요.'},{status:400});
   const {error}=await db.from('games').update({name:name.trim()}).eq('id',gameId).eq('phase','lobby');if(error)throw error;
   for(let i=0;i<teams.length;i++){const {error}=await db.from('teams').update({name:teamNames[i].trim()}).eq('id',teams[i].id);if(error)throw error;}
  }
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'설정 저장 실패'},{status:500})}
}
