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
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.SUPABASE_SECRET_KEY)
   return NextResponse.json({error:"서버의 Supabase 환경변수가 누락되었습니다. Vercel Production 환경에서 NEXT_PUBLIC_SUPABASE_URL 및 SUPABASE_SECRET_KEY를 확인하고 재배포하세요.",code:"SUPABASE_CONFIG_MISSING"},{status:503});
  const db=serverDb();const joinCode=randomBytes(5).toString("hex").toUpperCase();
  const {data:game,error}=await db.from("games").insert({name,join_code:joinCode,status:"lobby",phase:"lobby"}).select("id,join_code").single();
  if(error||!game){
   const code=error?.code;
   const hint=code==="42501"?"Supabase 서버 키의 테이블 접근 권한을 확인하세요.":code==="23505"?"참가 코드가 중복되었습니다. 다시 시도하세요.":"Supabase 연결 및 서버 키가 올바른 프로젝트에 연결됐는지 확인하세요.";
   console.error("create game failed",{code,message:error?.message});
   return NextResponse.json({error:"게임 생성 실패: "+hint,code:code??"DB_INSERT_FAILED"},{status:500});
  }
  const {error:teamsError}=await db.from("teams").insert(teamNames.map((t:string,i:number)=>({game_id:game.id,name:t.trim(),display_order:i+1})));
  if(teamsError){console.error("create teams failed",{code:teamsError.code,message:teamsError.message});await db.from("games").delete().eq("id",game.id);return NextResponse.json({error:"팀 생성 실패: 팀 테이블 접근 권한 또는 입력값을 확인하세요.",code:teamsError.code??"TEAM_INSERT_FAILED"},{status:500})}
  return NextResponse.json({gameId:game.id,joinCode:game.join_code},{status:201});
 }catch(e){console.error("create game unexpected failure",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"게임 생성 중 서버 오류가 발생했습니다. Vercel Functions 로그를 확인하세요.",code:"UNEXPECTED_ERROR"},{status:500})}
}
