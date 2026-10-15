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
  return NextResponse.json({state:data?.[0]??null});
 }catch{return NextResponse.json({error:"단계 변경 실패"},{status:500})}
}
