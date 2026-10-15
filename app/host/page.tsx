import {redirect} from 'next/navigation';
export default async function Host({searchParams}:{searchParams:Promise<{code?:string}>}){
 const {code}=await searchParams;redirect(code?'/admin/manage?code='+encodeURIComponent(code):'/admin');
}
