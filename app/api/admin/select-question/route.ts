import {NextRequest,NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {serverDb} from "@/lib/server-db";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isAdmin(req))return NextResponse.json({error:"관리자 인증이 필요합니다."},{status:401});
 try{
  const {gameId,questionId}=await req.json();
  if(typeof gameId!=="string"||typeof questionId!=="string")return NextResponse.json({error:"잘못된 요청"},{status:400});
  const db=serverDb();const {data:q}=await db.from("questions").select("id").eq("id",questionId).eq("game_id",gameId).maybeSingle();
  if(!q)return NextResponse.json({error:"질문 없음"},{status:404});
  const {data:game}=await db.from("games").select("phase").eq("id",gameId).maybeSingle();
  if(!game||!["lobby","round_complete"].includes(game.phase))return NextResponse.json({error:"지금은 질문을 변경할 수 없습니다."},{status:409});
  const {error}=await db.from("games").update({current_question_id:questionId,phase:"lobby",status:"lobby"}).eq("id",gameId).eq("phase",game.phase);
  if(error)return NextResponse.json({error:"질문 선택 실패"},{status:500});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"질문 선택 실패"},{status:500})}
}
