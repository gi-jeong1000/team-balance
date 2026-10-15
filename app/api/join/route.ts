import { NextRequest,NextResponse } from "next/server";
import {serverDb} from "@/lib/server-db";
import {hashToken,makeToken} from "@/lib/participant-auth";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 try{
  const data=await request.json();
  const joinCode=String(data.joinCode??"").trim().toUpperCase();
  const nickname=String(data.nickname??"").trim();
  const teamId=String(data.teamId??"");
  if(!/^[A-Z0-9-]{4,12}$/.test(joinCode)||nickname.length<1||nickname.length>24||!/^[0-9a-f-]{36}$/i.test(teamId))
   return NextResponse.json({error:"입력값을 확인해 주세요."},{status:400});
  const db=serverDb();
  const {data:game,error:gameError}=await db.from("games").select("id,status").eq("join_code",joinCode).maybeSingle();
  if(gameError||!game||game.status==="finished")return NextResponse.json({error:"참가할 수 없는 게임입니다."},{status:404});
  const {data:team}=await db.from("teams").select("id").eq("id",teamId).eq("game_id",game.id).maybeSingle();
  if(!team)return NextResponse.json({error:"유효하지 않은 팀입니다."},{status:400});
  const token=makeToken();
  const {data:participant,error}=await db.from("participants").insert({game_id:game.id,team_id:teamId,nickname,token_hash:hashToken(token),last_seen_at:new Date().toISOString()}).select("id").single();
  if(error)return NextResponse.json({error:error.code==="23505"?"이미 사용 중인 닉네임입니다.":"참가에 실패했습니다."},{status:error.code==="23505"?409:500});
  return NextResponse.json({gameId:game.id,participantId:participant.id,token},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"요청을 처리할 수 없습니다."},{status:500})}
}
