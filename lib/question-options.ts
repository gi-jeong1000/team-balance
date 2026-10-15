export function questionOptions(b:Record<string,unknown>){
 const duration=(key:string,fallback:number)=>{const n=b[key]??fallback;if(!Number.isInteger(n)||Number(n)<5||Number(n)>3600)throw Error('단계별 시간은 5~3600초여야 합니다.');return Number(n)};
 const image=(key:string)=>{const value=b[key];if(value==null||value==='')return null;if(typeof value!=='string'||value.length>900000||!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value))throw Error('이미지는 PNG, JPEG, WebP, GIF 형식의 650KB 이하 파일이어야 합니다.');return value};
 return {vote1_seconds:duration('vote1Seconds',30),speech_seconds:duration('speechSeconds',45),vote2_seconds:duration('vote2Seconds',20),image_a_path:image('imageA'),image_b_path:image('imageB')};
}
