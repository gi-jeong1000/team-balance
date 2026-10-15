import {NextRequest,NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {serverDb} from "@/lib/server-db";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isAdmin(req))return NextResponse.json({error:"관리자 인증 필요"},{status:401});
 try{
 const {gameId,expectedVersion}=await req.json();
 if(typeof gameId!=="string"||!Number.isInteger(expectedVersion))return NextResponse.json({error:"잘못된 요청"},{status:400});
 const {data,error}=await serverDb().rpc("finish_team_balance_game",{p_game_id:gameId,p_expected_version:expectedVersion});
 if(error)return NextResponse.json({error:"마지막 라운드가 확정되지 않았거나 게임 상태가 변경됐습니다."},{status:409});
 return NextResponse.json({ok:true,phaseVersion:data});
 }catch{return NextResponse.json({error:"게임 종료 실패"},{status:500})}
}
