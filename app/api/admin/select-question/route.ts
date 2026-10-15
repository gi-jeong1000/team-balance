import {NextRequest,NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {serverDb} from "@/lib/server-db";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isAdmin(req))return NextResponse.json({error:"관리자 인증이 필요합니다."},{status:401});
 try{
  const {gameId,questionId,expectedVersion}=await req.json();
  if(typeof gameId!=="string"||typeof questionId!=="string"||!Number.isInteger(expectedVersion))
   return NextResponse.json({error:"잘못된 요청"},{status:400});
  const {data,error}=await serverDb().rpc("select_game_question",{p_game_id:gameId,p_question_id:questionId,p_expected_version:expectedVersion});
  if(error)return NextResponse.json({error:"게임 상태가 변경됐거나 선택할 수 없는 질문입니다."},{status:409});
  return NextResponse.json({ok:true,phaseVersion:data});
 }catch{return NextResponse.json({error:"질문 선택 실패"},{status:500})}
}
