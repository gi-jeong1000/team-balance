import {createHash,randomBytes,timingSafeEqual} from "node:crypto";
export function makeToken(){return randomBytes(32).toString("base64url")}
export function hashToken(token:string){return createHash("sha256").update(token).digest("hex")}
export function sameToken(token:string,stored:string){
 if(!/^[a-f0-9]{64}$/.test(stored))return false;
 return timingSafeEqual(Buffer.from(hashToken(token),"hex"),Buffer.from(stored,"hex"));
}
