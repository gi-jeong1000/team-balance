import {NextRequest,NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {serverDb} from "@/lib/server-db";
export const runtime="nodejs";
export async function GET(req:NextRequest){
 if(!isAdmin(req))return NextResponse.json({error:"관리자 인증이 필요합니다."},{status:401});
 const code=req.nextUrl.searchParams.get("code")?.trim().toUpperCase();
 if(!code||!/^[A-Z0-9-]{4,12}$/.test(code))return NextResponse.json({error:"참가 코드가 올바르지 않습니다."},{status:400});
 try{
 const db=serverDb();const {data:game,error}=await db.from("games").select("id,current_question_id").eq("join_code",code).maybeSingle();
 if(error||!game)return NextResponse.json({error:"게임을 찾을 수 없습니다."},{status:404});
 const [{data:teams,error:te},{data:people,error:pe},{data:votes,error:ve},{data:scores,error:se},{data:representatives,error:re}]=await Promise.all([
 db.from("teams").select("id,name").eq("game_id",game.id),
 db.from("participants").select("id,nickname,team_id,status,last_seen_at").eq("game_id",game.id),
 game.current_question_id?db.from("votes").select("participant_id,round_no").eq("game_id",game.id).eq("question_id",game.current_question_id):Promise.resolve({data:[],error:null}),
 db.from("score_events").select("team_id,points,reason").eq("game_id",game.id).eq("is_valid",true),
 game.current_question_id?db.from("representatives").select("participant_id,option,speech_order").eq("question_id",game.current_question_id):Promise.resolve({data:[],error:null})
 ]);
 if(te||pe||ve||se||re)return NextResponse.json({error:"관리 현황 조회 실패"},{status:500});
 const teamMap=new Map((teams||[]).map(t=>[t.id,t.name]));const first=new Set((votes||[]).filter(v=>v.round_no===1).map(v=>v.participant_id));const second=new Set((votes||[]).filter(v=>v.round_no===2).map(v=>v.participant_id));
 const standings=(teams||[]).map(t=>({name:t.name,points:(scores||[]).filter(s=>s.team_id===t.id).reduce((n,s)=>n+s.points,0),reversals:(scores||[]).filter(s=>s.team_id===t.id&&s.reason==="reverse").length})).sort((a,b)=>b.points-a.points||b.reversals-a.reversals);
 const representatives=(representatives||[]).map(r=>({...r,nickname:(people||[]).find(p=>p.id===r.participant_id)?.nickname||"알 수 없음"}));
 const participants=(people||[]).map(p=>({id:p.id,nickname:p.nickname,team:teamMap.get(p.team_id)||"미지정",online:p.status==="active",voted1:first.has(p.id),voted2:second.has(p.id)}));
 return NextResponse.json({participantCount:participants.length,onlineCount:participants.filter(p=>p.online).length,vote1Count:first.size,vote2Count:second.size,participants,standings,representatives},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"관리 현황 조회 실패"},{status:500})}
}