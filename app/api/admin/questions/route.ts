import {NextRequest,NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {serverDb} from "@/lib/server-db";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isAdmin(req))return NextResponse.json({error:"관리자 인증이 필요합니다."},{status:401});
 try{
  const b=await req.json();const {gameId,body,optionA,optionB}=b;
  if(typeof gameId!=="string"||typeof body!=="string"||body.trim().length<3||body.length>200||typeof optionA!=="string"||optionA.trim().length<1||optionA.length>100||typeof optionB!=="string"||optionB.trim().length<1||optionB.length>100)return NextResponse.json({error:"질문 내용을 확인해 주세요."},{status:400});
  const db=serverDb();const {data:game}=await db.from("games").select("id").eq("id",gameId).maybeSingle();if(!game)return NextResponse.json({error:"게임 없음"},{status:404});
  const {count}=await db.from("questions").select("id",{count:"exact",head:true}).eq("game_id",gameId);
  const {data,error}=await db.from("questions").insert({game_id:gameId,body:body.trim(),option_a:optionA.trim(),option_b:optionB.trim(),display_order:(count??0)+1}).select("id").single();
  if(error)return NextResponse.json({error:"질문 저장 실패"},{status:500});return NextResponse.json({questionId:data.id},{status:201});
 }catch{return NextResponse.json({error:"질문 저장 실패"},{status:500})}
}
