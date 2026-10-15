import {NextRequest,NextResponse} from "next/server";
import {checkPassword,makeAdminCookie} from "@/lib/admin-auth";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 try{const body=await req.json();const password=body.password;if(typeof password!=="string"||password.length>256||!checkPassword(password))return NextResponse.json({error:"관리자 비밀번호가 올바르지 않습니다."},{status:401});
 const response=NextResponse.json({ok:true});response.cookies.set(makeAdminCookie());return response;
 }catch{return NextResponse.json({error:"관리자 인증 설정을 확인해 주세요."},{status:500})}
}
