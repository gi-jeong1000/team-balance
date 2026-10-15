import {NextRequest,NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {serverDb} from "@/lib/server-db";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isAdmin(req))return NextResponse.json({error:"관리자 인증 필요"},{status:401});
 try{const {gameId}=await req.json();if(typeof gameId!=="string")return NextResponse.json({error:"게임 ID 오류"},{status:400});
 const db=serverDb();const {data,error}=await db.rpc("finalize_game_round",{p_game_id:gameId});
 if(error)return NextResponse.json({error:"결과 발표 단계가 아니거나 결과 확정에 실패했습니다."},{status:409});
 const {data:scores}=await db.from("score_events").select("team_id,points,reason").eq("game_id",gameId).eq("is_valid",true);
 const totals=new Map<string,{points:number;reversals:number}>();
 for(const s of scores??[]){const prev=totals.get(s.team_id)??{points:0,reversals:0};prev.points+=s.points;if(s.reason==="reversal")prev.reversals++;totals.set(s.team_id,prev)}
 return NextResponse.json({result:data,standings:[...totals].map(([teamId,v])=>({teamId,...v})).sort((a,b)=>b.points-a.points||b.reversals-a.reversals)});
 }catch{return NextResponse.json({error:"결과 확정 실패"},{status:500})}
}
