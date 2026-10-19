import {NextRequest,NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {serverDb} from "@/lib/server-db";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isAdmin(req))return NextResponse.json({error:"관리자 인증 필요"},{status:401});
 try{const {gameId}=await req.json();if(typeof gameId!=="string")return NextResponse.json({error:"게임 ID 오류"},{status:400});
 const db=serverDb();const {data,error}=await db.rpc("draw_game_representatives",{p_game_id:gameId});
 if(error)return NextResponse.json({error:"추첨 단계인지 확인해 주세요. 대표자 추첨에는 참가자 2명 이상이 필요합니다."},{status:409});
 const ids=(data??[]).map((r:{participant_id:string})=>r.participant_id);
 const {data:people}=ids.length?await db.from("participants").select("id,nickname,team_id").in("id",ids):{data:[]};
 const result=(data??[]).map((r:{participant_id:string;option:number;speech_order:number})=>({...r,nickname:people?.find(p=>p.id===r.participant_id)?.nickname??"참가자",team_id:people?.find(p=>p.id===r.participant_id)?.team_id??null}));
 return NextResponse.json({representatives:result});
 }catch{return NextResponse.json({error:"추첨 실패"},{status:500})}
}
