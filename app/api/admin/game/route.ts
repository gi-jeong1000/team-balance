import {NextRequest,NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {serverDb} from "@/lib/server-db";
export const runtime="nodejs";
export async function GET(req:NextRequest){
 if(!isAdmin(req))return NextResponse.json({error:"관리자 인증이 필요합니다."},{status:401});
 const code=req.nextUrl.searchParams.get("code")?.trim().toUpperCase();
 if(!code||!/^[A-Z0-9-]{4,12}$/.test(code))return NextResponse.json({error:"게임 코드 오류"},{status:400});
 try{
 const db=serverDb();
 const {data:game,error}=await db.from("games").select("id,name,status,phase,phase_version,current_question_id").eq("join_code",code).maybeSingle();
 if(error||!game)return NextResponse.json({error:"게임을 찾을 수 없습니다."},{status:404});
 const [{data:teams,error:teamsError},{data:questions,error:questionsError}]=await Promise.all([
 db.from("teams").select("id,name,display_order").eq("game_id",game.id).order("display_order"),
 db.from("questions").select("id,body,option_a,option_b,display_order").eq("game_id",game.id).order("display_order")
 ]);
 if(teamsError||questionsError)return NextResponse.json({error:"게임 조회 실패"},{status:500});
 return NextResponse.json({game,teams:teams??[],questions:questions??[]},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"게임 조회 실패"},{status:500})}
}
