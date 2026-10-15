import {NextRequest,NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {serverDb} from "@/lib/server-db";
import {randomBytes} from "node:crypto";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isAdmin(req))return NextResponse.json({error:"관리자 인증이 필요합니다."},{status:401});
 try{
  const body=await req.json();const name=String(body.name??"").trim();const teamNames=body.teams;
  if(name.length<2||name.length>80||!Array.isArray(teamNames)||teamNames.length<2||teamNames.length>12||teamNames.some((v:unknown)=>typeof v!=="string"||v.trim().length<1||v.trim().length>30))
   return NextResponse.json({error:"게임명과 팀 이름을 확인해 주세요."},{status:400});
  const db=serverDb();const joinCode=randomBytes(5).toString("hex").toUpperCase();
  const {data:game,error}=await db.from("games").insert({name,join_code:joinCode,status:"lobby",phase:"lobby"}).select("id,join_code").single();
  if(error||!game)return NextResponse.json({error:"게임 생성 실패"},{status:500});
  const {error:teamsError}=await db.from("teams").insert(teamNames.map((t:string,i:number)=>({game_id:game.id,name:t.trim(),display_order:i+1})));
  if(teamsError){await db.from("games").delete().eq("id",game.id);return NextResponse.json({error:"팀 생성 실패"},{status:500})}
  return NextResponse.json({gameId:game.id,joinCode:game.join_code},{status:201});
 }catch{return NextResponse.json({error:"게임 생성 중 오류가 발생했습니다."},{status:500})}
}
