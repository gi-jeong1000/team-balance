import {NextRequest,NextResponse} from "next/server";
import {serverDb} from "@/lib/server-db";
import {sameToken} from "@/lib/participant-auth";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 try{
  const body=await req.json();
  const {participantId,token,gameId}=body;
  if(typeof participantId!=="string"||typeof gameId!=="string"||typeof token!=="string"||token.length>200)
   return NextResponse.json({error:"잘못된 요청입니다."},{status:400});
  const db=serverDb();
  const {data:participant,error}=await db.from("participants").select("id,game_id,team_id,nickname,token_hash,status").eq("id",participantId).maybeSingle();
  if(error||!participant||participant.game_id!==gameId||!sameToken(token,participant.token_hash)||participant.status!=="active")
   return NextResponse.json({error:"참가자 세션이 만료되었거나 유효하지 않습니다."},{status:401});
  const {data:votes,votesError}=await (async()=>{const result=await db.from("votes").select("question_id,round_no,option").eq("participant_id",participantId).eq("game_id",gameId);return {data:result.data,votesError:result.error}})();
  if(votesError)return NextResponse.json({error:"투표 복원 실패"},{status:500});
  const submitted:Record<string,number>={};
  for(const vote of votes??[])submitted[vote.question_id+":"+vote.round_no]=vote.option;
  await db.from("participants").update({last_seen_at:new Date().toISOString()}).eq("id",participantId);
  return NextResponse.json({participant:{id:participant.id,nickname:participant.nickname,teamId:participant.team_id},submitted},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"세션 복원 실패"},{status:500})}
}
