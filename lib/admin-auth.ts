import {createHmac,createHash,timingSafeEqual} from "node:crypto";
import {NextRequest} from "next/server";
const cookie="tb_admin";
function secret(){const s=process.env.ADMIN_SESSION_SECRET;if(!s||s.length<32)throw new Error("ADMIN_SESSION_SECRET must have at least 32 characters");return s}
export function checkPassword(password:string){const stored=process.env.ADMIN_PASSWORD_HASH;if(!stored||!/^[a-f0-9]{64}$/i.test(stored))return false;const hashed=createHash("sha256").update(password).digest();return timingSafeEqual(hashed,Buffer.from(stored,"hex"))}
export function makeAdminCookie(){const expires=Date.now()+8*60*60*1000;const payload=String(expires);const signature=createHmac("sha256",secret()).update(payload).digest("hex");return {name:cookie,value:payload+"."+signature,httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict" as const,path:"/",maxAge:28800}}
export function isAdmin(request:NextRequest){const value=request.cookies.get(cookie)?.value??"";const [expiry,signature]=value.split(".");if(!/^\d{13}$/.test(expiry??"")||!signature||!/^[a-f0-9]{64}$/.test(signature)||Number(expiry)<Date.now())return false;const expected=createHmac("sha256",secret()).update(expiry).digest();return timingSafeEqual(expected,Buffer.from(signature,"hex"))}
