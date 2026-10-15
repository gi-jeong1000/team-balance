import {NextRequest,NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {serverDb} from "@/lib/server-db";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isAdmin(req))return NextResponse.json({error:"관리자 인증이 필요합니다."},{status:401});
 try{
  const body=await req.json();
  if(typeof body.gameId!=="string"||!Number.isInteger(body.expectedVersion)||typeof body.nextPhase!=="string")return NextResponse.json({error:"요청 형식이 잘못됐습니다."},{status:400});
  const {data,error}=await serverDb().rpc("advance_game_phase",{p_game_id:body.gameId,p_expected_version:body.expectedVersion,p_next_phase:body.nextPhase});
  if(error)return NextResponse.json({error:"진행 단계가 변경됐거나 유효하지 않습니다."},{status:409});
  if(["vote1","speech1","speech2","vote2"].includes(body.nextPhase)){
   const db=serverDb();const {data:game}=await db.from("games").select("current_question_id").eq("id",body.gameId).single();
   const {data:q}=await db.from("questions").select("vote1_seconds,speech_seconds,vote2_seconds").eq("id",game?.current_question_id).single();
   const seconds=body.nextPhase==="vote1"?q?.vote1_seconds:body.nextPhase==="vote2"?q?.vote2_seconds:q?.speech_seconds;
   const {error:timerError}=await db.rpc("control_game_timer",{p_game_id:body.gameId,p_action:"start",p_duration_seconds:seconds??30});
   if(timerError)return NextResponse.json({error:"단계는 변경됐지만 타이머 시작에 실패했습니다. 시작 / 재설정을 눌러주세요."},{status:500});
  }
  return NextResponse.json({state:data?.[0]??null});
 }catch{return NextResponse.json({error:"단계 변경 실패"},{status:500})}
}
