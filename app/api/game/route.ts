import {NextRequest,NextResponse} from "next/server";
import {serverDb} from "@/lib/server-db";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 const code=request.nextUrl.searchParams.get("code")?.trim().toUpperCase();
 if(!code||!/^[A-Z0-9-]{4,12}$/.test(code))return NextResponse.json({error:"게임 코드를 입력하세요."},{status:400});
 try{
  const db=serverDb();
  const {data:game}=await db.from("games").select("id,name,status,phase,phase_version,current_question_id").eq("join_code",code).maybeSingle();
  if(!game)return NextResponse.json({error:"게임을 찾을 수 없습니다."},{status:404});
  const [{data:teams},{data:questions},{data:runtime}]=await Promise.all([
   db.from("teams").select("id,name,display_order").eq("game_id",game.id).order("display_order"),
   db.from("questions").select("id,body,option_a,option_b,display_order").eq("game_id",game.id).order("display_order"),
   game.current_question_id?db.from("round_runtime").select("ends_at,is_paused,remaining_ms").eq("question_id",game.current_question_id).maybeSingle():Promise.resolve({data:null})
  ]);
  return NextResponse.json({game,teams:teams??[],questions:questions??[],runtime:runtime??null},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"게임 조회에 실패했습니다."},{status:500})}
}
