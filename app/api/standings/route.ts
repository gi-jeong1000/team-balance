import {NextRequest,NextResponse} from "next/server";
import {serverDb} from "@/lib/server-db";
import {calculateStandings} from "@/lib/standings";
export const runtime="nodejs";
export async function GET(req:NextRequest){
 const code=req.nextUrl.searchParams.get("code")?.trim().toUpperCase();
 if(!code||!/^[A-Z0-9-]{4,12}$/.test(code))return NextResponse.json({error:"게임 코드 오류"},{status:400});
 try{
 const db=serverDb();
 const {data:game}=await db.from("games").select("id,name,phase").eq("join_code",code).maybeSingle();
 if(!game)return NextResponse.json({error:"게임을 찾을 수 없습니다."},{status:404});
 if(game.phase!=="finished")return NextResponse.json({error:"아직 게임이 종료되지 않았습니다."},{status:409});
 const [{data:teams,error:teamError},{data:events,error:eventError}]=await Promise.all([
 db.from("teams").select("id,name").eq("game_id",game.id),
 db.from("score_events").select("team_id,points,reason").eq("game_id",game.id).eq("is_valid",true)
 ]);
 if(teamError||eventError)return NextResponse.json({error:"순위 조회 실패"},{status:500});
 return NextResponse.json({gameName:game.name,standings:calculateStandings(teams??[],events??[])},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"순위 조회 실패"},{status:500})}
}
