import {NextRequest,NextResponse} from "next/server";
import {serverDb} from "@/lib/server-db";
export const runtime="nodejs";
export async function GET(req:NextRequest){
 const code=req.nextUrl.searchParams.get("code")?.trim().toUpperCase();
 if(!code||!/^[A-Z0-9-]{4,12}$/.test(code))return NextResponse.json({error:"올바른 참가 코드를 입력하세요."},{status:400});
 try{
 const db=serverDb();
 const {data:game,error}=await db.from("games").select("id,name,phase,phase_version,current_question_id").eq("join_code",code).maybeSingle();
 if(error||!game)return NextResponse.json({error:"게임을 찾을 수 없습니다."},{status:404});
 const id=game.current_question_id;
 const [{data:question},{data:runtime},{data:result},{data:teams}]=await Promise.all([
 id?db.from("questions").select("id,body,option_a,option_b").eq("id",id).eq("game_id",game.id).maybeSingle():Promise.resolve({data:null}),
 id?db.from("round_runtime").select("ends_at,is_paused,remaining_ms").eq("question_id",id).maybeSingle():Promise.resolve({data:null}),
 id&&["reveal","round_complete"].includes(game.phase)?db.from("round_results").select("winner,reversal,vote1_a,vote1_b,vote2_a,vote2_b").eq("question_id",id).maybeSingle():Promise.resolve({data:null}),
 db.from("teams").select("id,name").eq("game_id",game.id)
 ]);
 const standings= result? await db.from("score_events").select("team_id,points,reason").eq("game_id",game.id).eq("is_valid",true):{data:[]};
 const sums=new Map<string,number>();for(const row of standings.data??[])sums.set(row.team_id,(sums.get(row.team_id)??0)+row.points);
 return NextResponse.json({game:{name:game.name,phase:game.phase,phaseVersion:game.phase_version},question,runtime:runtime??null,result:result??null,standings:result?(teams??[]).map(t=>({name:t.name,points:sums.get(t.id)??0})).sort((a,b)=>b.points-a.points):[]},{headers:{"Cache-Control":"no-store, max-age=0"}});
 }catch{return NextResponse.json({error:"화면 조회에 실패했습니다."},{status:500})}
}
