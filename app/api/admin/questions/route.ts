import {NextRequest,NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {serverDb} from "@/lib/server-db";
import {questionOptions} from "@/lib/question-options";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isAdmin(req))return NextResponse.json({error:"관리자 인증이 필요합니다."},{status:401});
 try{
  const b=await req.json();const {gameId,body,optionA,optionB}=b;
  if(typeof gameId!=="string"||typeof body!=="string"||body.trim().length<3||body.length>200||typeof optionA!=="string"||optionA.trim().length<1||optionA.length>100||typeof optionB!=="string"||optionB.trim().length<1||optionB.length>100)return NextResponse.json({error:"질문 내용을 확인해 주세요."},{status:400});
  let options;try{options=questionOptions(b)}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"질문 설정 오류"},{status:400})}
  const db=serverDb();const {data:game}=await db.from("games").select("id,phase").eq("id",gameId).maybeSingle();if(!game)return NextResponse.json({error:"게임 없음"},{status:404});if(game.phase!=="lobby")return NextResponse.json({error:"질문은 게임 시작 전에 추가하세요."},{status:409});
  const {count}=await db.from("questions").select("id",{count:"exact",head:true}).eq("game_id",gameId);
  const {data,error}=await db.from("questions").insert({...options,game_id:gameId,body:body.trim(),option_a:optionA.trim(),option_b:optionB.trim(),display_order:(count??0)+1}).select("id").single();
  if(error)return NextResponse.json({error:"질문 저장 실패"},{status:500});return NextResponse.json({questionId:data.id},{status:201});
 }catch{return NextResponse.json({error:"질문 저장 실패"},{status:500})}
}
export async function DELETE(req:NextRequest){
 if(!isAdmin(req))return NextResponse.json({error:'관리자 인증 필요'},{status:401});
 try{const {gameId,questionId}=await req.json();const db=serverDb();
 const {data:g}=await db.from('games').select('phase,current_question_id').eq('id',gameId).single();
 if(!g||g.phase!=='lobby'||g.current_question_id===questionId)return NextResponse.json({error:'시작 전의 선택하지 않은 질문만 삭제할 수 있습니다.'},{status:409});
 const {error}=await db.from('questions').delete().eq('id',questionId).eq('game_id',gameId);if(error)throw error;
 return NextResponse.json({ok:true});}catch{return NextResponse.json({error:'질문 삭제 실패'},{status:500})}
}
