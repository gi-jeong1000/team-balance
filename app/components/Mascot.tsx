export default function Mascot({side,className='',priority=false}:{side:'A'|'B';className?:string;priority?:boolean}){
 return <img className={'game-mascot mascot-'+side+' '+className} src={side==='A'?'/art/bunny.webp':'/art/bear.webp'} alt={side==='A'?'파란 글러브를 낀 흰 토끼':'빨간 글러브를 낀 주황 곰'} width={512} height={512} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} draggable={false}/>;
}
