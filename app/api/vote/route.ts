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
  const {error}=await db.rpc("submit_game_vote",{p_participant_id:participantId,p_question_id:questionId,p_round_no:roundNo,p_option:option});
  if(error)return NextResponse.json({error:error.code==="23505"?"이미 투표했습니다.":error.code==="P0001"?"투표가 마감되었거나 참가 자격이 없습니다.":"투표를 저장하지 못했습니다."},{status:error.code==="23505"||error.code==="P0001"?409:500});
  return NextResponse.json({ok:true},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"투표 처리 중 오류가 발생했습니다."},{status:500})}
}
