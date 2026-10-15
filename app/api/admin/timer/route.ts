import {NextRequest,NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {serverDb} from "@/lib/server-db";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isAdmin(req))return NextResponse.json({error:"관리자 인증 필요"},{status:401});
 try{
  const body=await req.json();
  if(typeof body.gameId!=="string"||!["start","pause","resume","extend"].includes(body.action))
   return NextResponse.json({error:"요청 형식이 잘못됐습니다."},{status:400});
  const duration=body.durationSeconds;
  if(["start","extend"].includes(body.action)&&(!Number.isInteger(duration)||duration<1||duration>3600))
   return NextResponse.json({error:"시간은 1~3600초여야 합니다."},{status:400});
  const {data,error}=await serverDb().rpc("control_game_timer",{p_game_id:body.gameId,p_action:body.action,p_duration_seconds:duration??null});
  if(error)return NextResponse.json({error:"현재 단계에서 해당 타이머 작업을 실행할 수 없습니다."},{status:409});
  return NextResponse.json({timer:data},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"타이머 처리 실패"},{status:500})}
}
