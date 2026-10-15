import {NextRequest,NextResponse} from "next/server";
import {serverDb} from "@/lib/server-db";
import {sameToken} from "@/lib/participant-auth";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 try{
  const body=await request.json();
  const {participantId,questionId,token}=body;
  const roundNo=Number(body.roundNo),option=Number(body.option);
  if(![1,2].includes(roundNo)||![1,2].includes(option)||typeof token!=="string"||token.length>200||typeof participantId!=="string"||typeof questionId!=="string")
   return NextResponse.json({error:"잘못된 투표 요청입니다."},{status:400});
  const db=serverDb();
  const {data:participant}=await db.from("participants").select("id,game_id,token_hash,status").eq("id",participantId).maybeSingle();
  if(!participant||!sameToken(token,participant.token_hash)||participant.status!=="active")return NextResponse.json({error:"참가자 인증에 실패했습니다."},{status:401});
  const {data:game}=await db.from("games").select("id,phase,current_question_id").eq("id",participant.game_id).maybeSingle();
  if(!game||game.current_question_id!==questionId||game.phase!==(roundNo===1?"vote1":"vote2"))
   return NextResponse.json({error:"현재 투표할 수 없는 단계입니다."},{status:409});
  if(roundNo===2){
   const {data:first}=await db.from("votes").select("id").eq("question_id",questionId).eq("participant_id",participantId).eq("round_no",1).maybeSingle();
   if(!first)return NextResponse.json({error:"1차 투표 참여자만 재투표할 수 있습니다."},{status:403});
  }
  const {error}=await db.from("votes").insert({game_id:participant.game_id,question_id:questionId,participant_id:participantId,round_no:roundNo,option});
  if(error)return NextResponse.json({error:error.code==="23505"?"이미 투표했습니다.":"투표를 저장하지 못했습니다."},{status:error.code==="23505"?409:500});
  return NextResponse.json({ok:true},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"투표 처리 중 오류가 발생했습니다."},{status:500})}
}
